import 'dotenv/config';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { createSequelize } from '#configs/database.js';
import { defineTaxModel } from '#models/tax.model.js';
import { defineBasicEstimateTemplateModel } from '#models/basic-estimate-template.model.js';
import { defineBasicEstimateTemplateItemModel } from '#models/basic-estimate-template-item.model.js';
import { TaxRepository } from '#repositories/tax.repository.js';
import { BasicEstimateTemplateRepository } from '#repositories/basic-estimate-template.repository.js';
import { BasicEstimateTemplateItemRepository } from '#repositories/basic-estimate-template-item.repository.js';
import taxFixtures from '../../fixtures/taxes.fixture.cjs';
import fixture from '../../fixtures/basic-estimate-templates.fixture.cjs';
import { seedWithTransaction } from '../../helpers/seed-fixture.js';

describe('BasicEstimateTemplateRepository (integration)', () => {
  let sequelize;
  let taxRepository;
  let basicEstimateTemplateRepository;
  let basicEstimateTemplateItemRepository;

  beforeAll(() => {
    sequelize = createSequelize();
    const taxModel = defineTaxModel(sequelize);
    const basicEstimateTemplateModel =
      defineBasicEstimateTemplateModel(sequelize);
    const basicEstimateTemplateItemModel =
      defineBasicEstimateTemplateItemModel(sequelize);

    basicEstimateTemplateModel.hasMany(basicEstimateTemplateItemModel, {
      as: 'items',
      foreignKey: 'basicEstimateTemplateId',
    });
    basicEstimateTemplateItemModel.belongsTo(basicEstimateTemplateModel, {
      foreignKey: 'basicEstimateTemplateId',
    });

    taxRepository = new TaxRepository({ taxModel });
    basicEstimateTemplateRepository = new BasicEstimateTemplateRepository({
      basicEstimateTemplateModel,
    });
    basicEstimateTemplateItemRepository =
      new BasicEstimateTemplateItemRepository({
        basicEstimateTemplateItemModel,
      });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('creates a template with items and reads them back', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      const template = await basicEstimateTemplateRepository.create(
        { name: fixture.name },
        { transaction },
      );

      await basicEstimateTemplateItemRepository.bulkCreate(
        fixture.items.map((item) => ({
          ...item,
          basicEstimateTemplateId: template.id,
        })),
        { transaction },
      );

      const found = await basicEstimateTemplateRepository.findByIdWithItems(
        template.id,
        {
          transaction,
        },
      );

      expect(found.items).toHaveLength(2);
      expect(found.items.map((item) => item.serviceName)).toEqual([
        'Labor',
        'Materials',
      ]);
    });
  });

  test('an item description persists through the real DB column', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      const template = await basicEstimateTemplateRepository.create(
        { name: fixture.name },
        { transaction },
      );

      await basicEstimateTemplateItemRepository.bulkCreate(
        [
          {
            serviceName: 'Labor',
            description: 'Weekly labor charge',
            cost: 100,
            basicEstimateTemplateId: template.id,
          },
        ],
        { transaction },
      );

      const found = await basicEstimateTemplateRepository.findByIdWithItems(
        template.id,
        { transaction },
      );
      expect(found.items[0].description).toBe('Weekly labor charge');
    });
  });

  test('an item referencing a tax nulls that reference out when the tax is deleted', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      const tax = await taxRepository.create(taxFixtures[0], { transaction });
      const template = await basicEstimateTemplateRepository.create(
        { name: fixture.name },
        { transaction },
      );

      await basicEstimateTemplateItemRepository.bulkCreate(
        [
          {
            serviceName: 'Labor',
            cost: 100,
            tax1Id: tax.id,
            basicEstimateTemplateId: template.id,
          },
        ],
        { transaction },
      );

      await taxRepository.delete(tax.id, { transaction });

      const found = await basicEstimateTemplateRepository.findByIdWithItems(
        template.id,
        {
          transaction,
        },
      );
      expect(found.items[0].tax1Id).toBeNull();
    });
  });

  test('deleting a template cascades to its items', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      const template = await basicEstimateTemplateRepository.create(
        { name: fixture.name },
        { transaction },
      );

      await basicEstimateTemplateItemRepository.bulkCreate(
        [
          {
            serviceName: 'Labor',
            cost: 100,
            basicEstimateTemplateId: template.id,
          },
        ],
        { transaction },
      );

      await basicEstimateTemplateRepository.delete(template.id, {
        transaction,
      });

      const found = await basicEstimateTemplateRepository.findByIdWithItems(
        template.id,
        {
          transaction,
        },
      );
      expect(found).toBeNull();
    });
  });

  test('rolls back cleanly, leaving no rows after the transaction', async () => {
    let createdId;

    await seedWithTransaction(sequelize, async (transaction) => {
      const template = await basicEstimateTemplateRepository.create(
        { name: fixture.name },
        { transaction },
      );
      createdId = template.id;
    });

    const found = await basicEstimateTemplateRepository.findById(createdId);
    expect(found).toBeNull();
  });
});
