import 'dotenv/config';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { createSequelize } from '#configs/database.js';
import { defineJobModel } from '#models/job.model.js';
import { defineEstimateModel } from '#models/estimate.model.js';
import { defineInvoiceModel } from '#models/invoice.model.js';
import { defineCustomerLineItemModel } from '#models/customer-line-item.model.js';
import { defineNoteModel } from '#models/note.model.js';
import { JobRepository } from '#repositories/job.repository.js';
import { EstimateRepository } from '#repositories/estimate.repository.js';
import { InvoiceRepository } from '#repositories/invoice.repository.js';
import { CustomerLineItemRepository } from '#repositories/customer-line-item.repository.js';
import { NoteRepository } from '#repositories/note.repository.js';
import { JobService } from '#services/job.service.js';
import estimateFixture from '../../fixtures/estimates.fixture.cjs';
import invoiceFixture from '../../fixtures/invoices.fixture.cjs';

// JobService.remove() opens its own sequelize.transaction() internally, so
// it cannot participate in the seedWithTransaction rollback pattern used by
// the repository-level integration tests (no CLS is configured, so a nested
// transaction can't see the outer transaction's uncommitted rows). These
// tests commit real rows instead - which is fine because the thing under
// test (remove()) is itself responsible for leaving no rows behind.
describe('JobService (integration)', () => {
  let sequelize;
  let jobRepository;
  let estimateRepository;
  let invoiceRepository;
  let customerLineItemRepository;
  let noteRepository;
  let jobService;

  beforeAll(() => {
    sequelize = createSequelize();
    const jobModel = defineJobModel(sequelize);
    const estimateModel = defineEstimateModel(sequelize);
    const invoiceModel = defineInvoiceModel(sequelize);
    const customerLineItemModel = defineCustomerLineItemModel(sequelize);
    const noteModel = defineNoteModel(sequelize);

    jobRepository = new JobRepository({ jobModel });
    estimateRepository = new EstimateRepository({ estimateModel });
    invoiceRepository = new InvoiceRepository({ invoiceModel });
    customerLineItemRepository = new CustomerLineItemRepository({
      customerLineItemModel,
    });
    noteRepository = new NoteRepository({ noteModel });
    jobService = new JobService({
      sequelize,
      jobRepository,
      invoiceRepository,
      estimateRepository,
      customerLineItemRepository,
      noteRepository,
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('removing a job with an estimate deletes the estimate line items and notes, leaving no orphans', async () => {
    const job = await jobRepository.create(estimateFixture.job);
    const estimate = await estimateRepository.create({
      jobId: job.id,
      ...estimateFixture.estimate,
    });
    await customerLineItemRepository.bulkCreate([
      {
        itemName: 'Orphan check',
        cost: 50,
        parentType: 'estimate',
        parentId: estimate.id,
      },
    ]);
    await noteRepository.create({
      parentId: String(estimate.id),
      type: 'Estimate',
      body: 'Estimate note',
    });

    await jobService.remove(job.id);

    const orphanItems = await customerLineItemRepository.findAllForParent(
      'estimate',
      estimate.id,
    );
    const orphanNotes = await noteRepository.findAllForParent(
      'Estimate',
      estimate.id,
    );
    expect(orphanItems).toHaveLength(0);
    expect(orphanNotes).toHaveLength(0);
    expect(await estimateRepository.findById(estimate.id)).toBeNull();
    expect(await jobRepository.findById(job.id)).toBeNull();
  });

  test('removing a job with an invoice deletes the invoice line items and notes, leaving no orphans', async () => {
    const job = await jobRepository.create(invoiceFixture.job);
    const invoice = await invoiceRepository.create({
      jobId: job.id,
      invoiceNumber: invoiceFixture.invoice.invoiceNumber,
      dateIssued: invoiceFixture.invoice.dateIssued,
    });
    await customerLineItemRepository.bulkCreate([
      {
        itemName: 'Orphan check',
        cost: 50,
        parentType: 'invoice',
        parentId: invoice.id,
      },
    ]);
    await noteRepository.create({
      parentId: String(invoice.id),
      type: 'Invoice',
      body: 'Invoice note',
    });

    await jobService.remove(job.id);

    const orphanItems = await customerLineItemRepository.findAllForParent(
      'invoice',
      invoice.id,
    );
    const orphanNotes = await noteRepository.findAllForParent(
      'Invoice',
      invoice.id,
    );
    expect(orphanItems).toHaveLength(0);
    expect(orphanNotes).toHaveLength(0);
    expect(await invoiceRepository.findById(invoice.id)).toBeNull();
    expect(await jobRepository.findById(job.id)).toBeNull();
  });

  test('removing a job deletes its own Job-type notes, leaving no orphans', async () => {
    const job = await jobRepository.create(estimateFixture.job);
    await noteRepository.create({
      parentId: String(job.id),
      type: 'Job',
      body: 'Job note',
    });

    await jobService.remove(job.id);

    const orphanNotes = await noteRepository.findAllForParent('Job', job.id);
    expect(orphanNotes).toHaveLength(0);
  });

  test('removing a job with neither an estimate nor an invoice just deletes the job', async () => {
    const job = await jobRepository.create(estimateFixture.job);

    await jobService.remove(job.id);

    expect(await jobRepository.findById(job.id)).toBeNull();
  });
});
