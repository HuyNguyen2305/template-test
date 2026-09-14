import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { createSequelize } from '#configs/database.js';
import { defineCustomerLineItemModel } from '#models/customer-line-item.model.js';
import { CustomerLineItemRepository } from '#repositories/customer-line-item.repository.js';
import fixture from '../../fixtures/invoices.fixture.cjs';
import { seedWithTransaction } from '../../helpers/seed-fixture.js';

describe('CustomerLineItemRepository (integration)', () => {
  let sequelize;
  let customerLineItemRepository;

  beforeAll(() => {
    sequelize = createSequelize();
    const customerLineItemModel = defineCustomerLineItemModel(sequelize);

    customerLineItemRepository = new CustomerLineItemRepository({
      customerLineItemModel,
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('creates items for a parent and reads them back ordered by sortOrder', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      const parentId = randomUUID();

      await customerLineItemRepository.bulkCreate(
        [
          {
            ...fixture.item,
            parentType: 'invoice',
            parentId,
            sortOrder: 1,
          },
          {
            ...fixture.item,
            itemName: 'Parts',
            parentType: 'invoice',
            parentId,
            sortOrder: 0,
          },
        ],
        { transaction },
      );

      const found = await customerLineItemRepository.findAllForParent(
        'invoice',
        parentId,
        { transaction },
      );

      expect(found.map((item) => item.itemName)).toEqual(['Parts', 'Labor']);
    });
  });

  test('scopes findAllForParent by parentType, not just parentId', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      const parentId = randomUUID();

      await customerLineItemRepository.bulkCreate(
        [{ ...fixture.item, parentType: 'invoice', parentId, sortOrder: 0 }],
        { transaction },
      );

      const foundAsEstimate = await customerLineItemRepository.findAllForParent(
        'estimate',
        parentId,
        { transaction },
      );

      expect(foundAsEstimate).toHaveLength(0);
    });
  });

  test('description persists through the real DB column', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      const item = await customerLineItemRepository.create(
        {
          ...fixture.item,
          description: 'Weekly labor charge',
          parentType: 'invoice',
          parentId: randomUUID(),
        },
        { transaction },
      );

      const found = await customerLineItemRepository.findById(item.id, {
        transaction,
      });
      expect(found.description).toBe('Weekly labor charge');
    });
  });

  test('id is a generated UUID, not a sequential integer', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      const item = await customerLineItemRepository.create(
        { ...fixture.item, parentType: 'invoice', parentId: randomUUID() },
        { transaction },
      );

      expect(item.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });
  });

  test('taxSlots/subtotal/total round-trip as opaque persisted values', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      const taxSlots = [{ taxId: 1, name: 'VAT', rate: '10.00' }];

      const item = await customerLineItemRepository.create(
        {
          ...fixture.item,
          parentType: 'invoice',
          parentId: randomUUID(),
          taxSlots,
          subtotal: 100,
          total: 110,
        },
        { transaction },
      );

      const found = await customerLineItemRepository.findById(item.id, {
        transaction,
      });

      expect(found.taxSlots).toEqual(taxSlots);
      expect(Number(found.subtotal)).toBe(100);
      expect(Number(found.total)).toBe(110);
    });
  });

  test('deleteAllForParent removes only items for that exact parent', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      const parentId = randomUUID();
      const otherParentId = randomUUID();

      await customerLineItemRepository.bulkCreate(
        [
          {
            ...fixture.item,
            parentType: 'invoice',
            parentId,
            sortOrder: 0,
          },
          {
            ...fixture.item,
            parentType: 'invoice',
            parentId: otherParentId,
            sortOrder: 0,
          },
        ],
        { transaction },
      );

      await customerLineItemRepository.deleteAllForParent('invoice', parentId, {
        transaction,
      });

      const removedParent = await customerLineItemRepository.findAllForParent(
        'invoice',
        parentId,
        { transaction },
      );
      const untouchedParent = await customerLineItemRepository.findAllForParent(
        'invoice',
        otherParentId,
        { transaction },
      );

      expect(removedParent).toHaveLength(0);
      expect(untouchedParent).toHaveLength(1);
    });
  });

  test('rolls back cleanly, leaving no rows after the transaction', async () => {
    let createdId;

    await seedWithTransaction(sequelize, async (transaction) => {
      const item = await customerLineItemRepository.create(
        { ...fixture.item, parentType: 'invoice', parentId: randomUUID() },
        { transaction },
      );
      createdId = item.id;
    });

    const found = await customerLineItemRepository.findById(createdId);
    expect(found).toBeNull();
  });
});
