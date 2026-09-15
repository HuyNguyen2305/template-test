import 'dotenv/config';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { createSequelize } from '#configs/database.js';
import { defineJobModel } from '#models/job.model.js';
import { defineInvoiceModel } from '#models/invoice.model.js';
import { defineCustomerLineItemModel } from '#models/customer-line-item.model.js';
import { defineTaxModel } from '#models/tax.model.js';
import { definePaymentTermTemplateModel } from '#models/payment-term-template.model.js';
import { defineNoteModel } from '#models/note.model.js';
import { JobRepository } from '#repositories/job.repository.js';
import { InvoiceRepository } from '#repositories/invoice.repository.js';
import { CustomerLineItemRepository } from '#repositories/customer-line-item.repository.js';
import { TaxRepository } from '#repositories/tax.repository.js';
import { PaymentTermTemplateRepository } from '#repositories/payment-term-template.repository.js';
import { NoteRepository } from '#repositories/note.repository.js';
import { InvoiceService } from '#services/invoice.service.js';
import { ValidationError } from '#configs/error/index.js';
import invoiceFixture from '../../fixtures/invoices.fixture.cjs';

// InvoiceService.create() opens its own sequelize.transaction() internally,
// so it cannot participate in the seedWithTransaction rollback pattern used
// by the repository-level integration tests (no CLS is configured, so a
// nested transaction can't see the outer transaction's uncommitted rows).
// These tests commit real rows instead and clean up manually.
describe('InvoiceService (integration)', () => {
  let sequelize;
  let jobRepository;
  let invoiceRepository;
  let customerLineItemRepository;
  let taxRepository;
  let paymentTermTemplateRepository;
  let noteRepository;

  beforeAll(() => {
    sequelize = createSequelize();
    const jobModel = defineJobModel(sequelize);
    const invoiceModel = defineInvoiceModel(sequelize);
    const customerLineItemModel = defineCustomerLineItemModel(sequelize);
    const taxModel = defineTaxModel(sequelize);
    const paymentTermTemplateModel = definePaymentTermTemplateModel(sequelize);
    const noteModel = defineNoteModel(sequelize);

    jobRepository = new JobRepository({ jobModel });
    invoiceRepository = new InvoiceRepository({ invoiceModel });
    customerLineItemRepository = new CustomerLineItemRepository({
      customerLineItemModel,
    });
    taxRepository = new TaxRepository({ taxModel });
    paymentTermTemplateRepository = new PaymentTermTemplateRepository({
      paymentTermTemplateModel,
    });
    noteRepository = new NoteRepository({ noteModel });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('a real unique-constraint violation on job_id surfaces as ValidationError, not a raw 500', async () => {
    const job = await jobRepository.create(invoiceFixture.job);
    const invoice = await invoiceRepository.create({
      jobId: job.id,
      ...invoiceFixture.invoice,
    });

    const staleService = new InvoiceService({
      sequelize,
      jobRepository,
      invoiceRepository: {
        create: invoiceRepository.create.bind(invoiceRepository),
        findByJobId: async () => null,
      },
      customerLineItemRepository,
      taxRepository,
      paymentTermTemplateRepository,
      noteRepository,
    });

    await expect(
      staleService.create(job.id, {
        invoiceNumber: 'INV-RACE',
      }),
    ).rejects.toThrow(ValidationError);

    await customerLineItemRepository.deleteAllForParent('invoice', invoice.id);
    await invoiceRepository.delete(invoice.id);
    await jobRepository.delete(job.id);
  });
});
