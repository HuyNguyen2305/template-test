import 'dotenv/config';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { createSequelize } from '#configs/database.js';
import { defineJobModel } from '#models/job.model.js';
import { defineInvoiceModel } from '#models/invoice.model.js';
import { defineCustomerLineItemModel } from '#models/customer-line-item.model.js';
import { JobRepository } from '#repositories/job.repository.js';
import { InvoiceRepository } from '#repositories/invoice.repository.js';
import { CustomerLineItemRepository } from '#repositories/customer-line-item.repository.js';
import fixture from '../../fixtures/invoices.fixture.cjs';
import { seedWithTransaction } from '../../helpers/seed-fixture.js';

describe('InvoiceRepository (integration)', () => {
  let sequelize;
  let jobRepository;
  let invoiceRepository;
  let customerLineItemRepository;

  beforeAll(() => {
    sequelize = createSequelize();
    const jobModel = defineJobModel(sequelize);
    const invoiceModel = defineInvoiceModel(sequelize);
    const customerLineItemModel = defineCustomerLineItemModel(sequelize);

    jobRepository = new JobRepository({ jobModel });
    invoiceRepository = new InvoiceRepository({ invoiceModel });
    customerLineItemRepository = new CustomerLineItemRepository({
      customerLineItemModel,
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('creates an invoice without explicit dateIssued/status/amountPaid, defaulting all three', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      const job = await jobRepository.create(fixture.job, { transaction });

      const invoice = await invoiceRepository.create(
        { jobId: job.id, invoiceNumber: fixture.invoice.invoiceNumber },
        { transaction },
      );

      expect(invoice.dateIssued).toBeTruthy();
      expect(invoice.status).toBe('Draft');
      expect(Number(invoice.amountPaid)).toBe(0);
    });
  });

  test('persists an explicit status and amountPaid', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      const job = await jobRepository.create(fixture.job, { transaction });

      const invoice = await invoiceRepository.create(
        {
          jobId: job.id,
          ...fixture.invoice,
          status: 'Sent',
          amountPaid: 50,
        },
        { transaction },
      );

      expect(invoice.status).toBe('Sent');
      expect(Number(invoice.amountPaid)).toBe(50);
    });
  });

  test('finds an invoice by job id', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      const job = await jobRepository.create(fixture.job, { transaction });
      const invoice = await invoiceRepository.create(
        { jobId: job.id, ...fixture.invoice },
        { transaction },
      );

      const found = await invoiceRepository.findByJobId(job.id, {
        transaction,
      });

      expect(found.id).toBe(invoice.id);
    });
  });

  test('rejects a second invoice for the same job (unique job_id)', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      const job = await jobRepository.create(fixture.job, { transaction });
      await invoiceRepository.create(
        { jobId: job.id, ...fixture.invoice },
        { transaction },
      );

      await expect(
        invoiceRepository.create(
          { jobId: job.id, ...fixture.invoice },
          { transaction },
        ),
      ).rejects.toThrow();
    });
  });

  test('deleting the parent job cascades to its invoice', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      const job = await jobRepository.create(fixture.job, { transaction });
      const invoice = await invoiceRepository.create(
        { jobId: job.id, ...fixture.invoice },
        { transaction },
      );

      await jobRepository.delete(job.id, { transaction });

      const found = await invoiceRepository.findById(invoice.id, {
        transaction,
      });
      expect(found).toBeNull();
    });
  });

  test('deleting an invoice does not automatically remove its line items (no FK - manual cleanup required)', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      const job = await jobRepository.create(fixture.job, { transaction });
      const invoice = await invoiceRepository.create(
        { jobId: job.id, ...fixture.invoice },
        { transaction },
      );
      await customerLineItemRepository.create(
        { ...fixture.item, parentType: 'invoice', parentId: invoice.id },
        { transaction },
      );

      await invoiceRepository.delete(invoice.id, { transaction });

      const orphaned = await customerLineItemRepository.findAllForParent(
        'invoice',
        invoice.id,
        { transaction },
      );
      expect(orphaned).toHaveLength(1);

      await customerLineItemRepository.deleteAllForParent(
        'invoice',
        invoice.id,
        { transaction },
      );
    });
  });

  test('rolls back cleanly, leaving no rows after the transaction', async () => {
    let createdId;

    await seedWithTransaction(sequelize, async (transaction) => {
      const job = await jobRepository.create(fixture.job, { transaction });
      const invoice = await invoiceRepository.create(
        { jobId: job.id, ...fixture.invoice },
        { transaction },
      );
      createdId = invoice.id;
    });

    const found = await invoiceRepository.findById(createdId);
    expect(found).toBeNull();
  });
});
