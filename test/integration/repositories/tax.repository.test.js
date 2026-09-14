import 'dotenv/config';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { createSequelize } from '#configs/database.js';
import { defineTaxModel } from '#models/tax.model.js';
import { TaxRepository } from '#repositories/tax.repository.js';
import fixtures from '../../fixtures/taxes.fixture.cjs';
import { seedWithTransaction } from '../../helpers/seed-fixture.js';

describe('TaxRepository (integration)', () => {
  let sequelize;
  let repository;

  beforeAll(() => {
    sequelize = createSequelize();
    const taxModel = defineTaxModel(sequelize);
    repository = new TaxRepository({ taxModel });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('create/find/update/delete round-trip against the real database', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      const created = await repository.create(fixtures[0], { transaction });
      expect(created.name).toBe('VAT');

      const found = await repository.findById(created.id, { transaction });
      expect(Number(found.rate)).toBe(10);

      const updated = await repository.update(
        created.id,
        { rate: 12 },
        { transaction },
      );
      expect(Number(updated.rate)).toBe(12);

      await repository.delete(created.id, { transaction });
      const afterDelete = await repository.findById(created.id, {
        transaction,
      });
      expect(afterDelete).toBeNull();
    });
  });

  test('rolls back cleanly, leaving no rows after the transaction', async () => {
    let createdId;

    await seedWithTransaction(sequelize, async (transaction) => {
      const created = await repository.create(fixtures[1], { transaction });
      createdId = created.id;
    });

    const found = await repository.findById(createdId);
    expect(found).toBeNull();
  });
});
