import 'dotenv/config';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { createSequelize } from '#configs/database.js';
import { defineTaxModel } from '#models/tax.model.js';
import { definePaymentTermTemplateModel } from '#models/payment-term-template.model.js';
import { TaxRepository } from '#repositories/tax.repository.js';
import { PaymentTermTemplateRepository } from '#repositories/payment-term-template.repository.js';
import taxFixtures from '../../fixtures/taxes.fixture.cjs';
import paymentTermTemplateFixture from '../../fixtures/payment-term-templates.fixture.cjs';
import { seedWithTransaction } from '../../helpers/seed-fixture.js';

describe('PaymentTermTemplateRepository (integration)', () => {
  let sequelize;
  let taxRepository;
  let paymentTermTemplateRepository;

  beforeAll(() => {
    sequelize = createSequelize();
    const taxModel = defineTaxModel(sequelize);
    const paymentTermTemplateModel = definePaymentTermTemplateModel(sequelize);
    taxRepository = new TaxRepository({ taxModel });
    paymentTermTemplateRepository = new PaymentTermTemplateRepository({
      paymentTermTemplateModel,
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('creates a payment term template referencing a tax and reads it back', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      const tax = await taxRepository.create(taxFixtures[0], { transaction });

      const created = await paymentTermTemplateRepository.create(
        {
          ...paymentTermTemplateFixture,
          tax1Id: tax.id,
          description: 'Net 30, Due date: 30 days, Late payment fee 5%',
        },
        { transaction },
      );

      const found = await paymentTermTemplateRepository.findById(created.id, {
        transaction,
      });
      expect(found.tax1Id).toBe(tax.id);
      expect(found.description).toBe(
        'Net 30, Due date: 30 days, Late payment fee 5%',
      );
    });
  });

  test('deleting the referenced tax sets tax1Id to null (ON DELETE SET NULL)', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      const tax = await taxRepository.create(taxFixtures[1], { transaction });

      const created = await paymentTermTemplateRepository.create(
        {
          ...paymentTermTemplateFixture,
          tax1Id: tax.id,
          description: 'Net 30, Due date: 30 days, Late payment fee 5%',
        },
        { transaction },
      );

      await taxRepository.delete(tax.id, { transaction });

      const found = await paymentTermTemplateRepository.findById(created.id, {
        transaction,
      });
      expect(found.tax1Id).toBeNull();
    });
  });

  test('rolls back cleanly, leaving no rows after the transaction', async () => {
    let createdId;

    await seedWithTransaction(sequelize, async (transaction) => {
      const created = await paymentTermTemplateRepository.create(
        {
          ...paymentTermTemplateFixture,
          description: 'Net 30, Due date: 30 days, Late payment fee 5%',
        },
        { transaction },
      );
      createdId = created.id;
    });

    const found = await paymentTermTemplateRepository.findById(createdId);
    expect(found).toBeNull();
  });
});
