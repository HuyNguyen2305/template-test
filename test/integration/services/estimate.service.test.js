import 'dotenv/config';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { createSequelize } from '#configs/database.js';
import { defineJobModel } from '#models/job.model.js';
import { defineEstimateModel } from '#models/estimate.model.js';
import { defineCustomerLineItemModel } from '#models/customer-line-item.model.js';
import { defineTaxModel } from '#models/tax.model.js';
import { definePaymentTermTemplateModel } from '#models/payment-term-template.model.js';
import { defineBasicEstimateTemplateModel } from '#models/basic-estimate-template.model.js';
import { defineBasicEstimateTemplateItemModel } from '#models/basic-estimate-template-item.model.js';
import { defineNoteModel } from '#models/note.model.js';
import { JobRepository } from '#repositories/job.repository.js';
import { EstimateRepository } from '#repositories/estimate.repository.js';
import { CustomerLineItemRepository } from '#repositories/customer-line-item.repository.js';
import { TaxRepository } from '#repositories/tax.repository.js';
import { PaymentTermTemplateRepository } from '#repositories/payment-term-template.repository.js';
import { BasicEstimateTemplateRepository } from '#repositories/basic-estimate-template.repository.js';
import { NoteRepository } from '#repositories/note.repository.js';
import { EstimateService } from '#services/estimate.service.js';
import { ValidationError } from '#configs/error/index.js';
import estimateFixture from '../../fixtures/estimates.fixture.cjs';
import basicEstimateTemplateFixture from '../../fixtures/basic-estimate-templates.fixture.cjs';

// EstimateService.create() opens its own sequelize.transaction() internally,
// so it cannot participate in the seedWithTransaction rollback pattern used
// by the repository-level integration tests (no CLS is configured, so a
// nested transaction can't see the outer transaction's uncommitted rows).
// These tests commit real rows instead and clean up manually.
describe('EstimateService (integration)', () => {
  let sequelize;
  let jobRepository;
  let estimateRepository;
  let customerLineItemRepository;
  let taxRepository;
  let paymentTermTemplateRepository;
  let basicEstimateTemplateRepository;
  let noteRepository;
  let estimateService;

  beforeAll(() => {
    sequelize = createSequelize();
    const jobModel = defineJobModel(sequelize);
    const estimateModel = defineEstimateModel(sequelize);
    const customerLineItemModel = defineCustomerLineItemModel(sequelize);
    const taxModel = defineTaxModel(sequelize);
    const paymentTermTemplateModel = definePaymentTermTemplateModel(sequelize);
    const basicEstimateTemplateModel =
      defineBasicEstimateTemplateModel(sequelize);
    const basicEstimateTemplateItemModel =
      defineBasicEstimateTemplateItemModel(sequelize);
    const noteModel = defineNoteModel(sequelize);

    basicEstimateTemplateModel.hasMany(basicEstimateTemplateItemModel, {
      as: 'items',
      foreignKey: 'basicEstimateTemplateId',
    });
    basicEstimateTemplateItemModel.belongsTo(basicEstimateTemplateModel, {
      foreignKey: 'basicEstimateTemplateId',
    });

    jobRepository = new JobRepository({ jobModel });
    estimateRepository = new EstimateRepository({ estimateModel });
    customerLineItemRepository = new CustomerLineItemRepository({
      customerLineItemModel,
    });
    taxRepository = new TaxRepository({ taxModel });
    paymentTermTemplateRepository = new PaymentTermTemplateRepository({
      paymentTermTemplateModel,
    });
    basicEstimateTemplateRepository = new BasicEstimateTemplateRepository({
      basicEstimateTemplateModel,
    });
    noteRepository = new NoteRepository({ noteModel });
    estimateService = new EstimateService({
      sequelize,
      jobRepository,
      estimateRepository,
      customerLineItemRepository,
      taxRepository,
      paymentTermTemplateRepository,
      basicEstimateTemplateRepository,
      noteRepository,
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('creating an estimate from a template with notes creates a matching Estimate note', async () => {
    const template = await basicEstimateTemplateRepository.create({
      name: basicEstimateTemplateFixture.name,
      notes: 'Template note body',
    });
    const job = await jobRepository.create(estimateFixture.job);

    const estimate = await estimateService.create(job.id, {
      estimateNumber: estimateFixture.estimate.estimateNumber,
      basicEstimateTemplateId: template.id,
    });

    const notes = await noteRepository.findAllForParent(
      'Estimate',
      estimate.id,
    );
    expect(notes).toHaveLength(1);
    expect(notes[0].body).toBe('Template note body');

    await customerLineItemRepository.deleteAllForParent(
      'estimate',
      estimate.id,
    );
    await noteRepository.deleteAllForParent('Estimate', estimate.id);
    await estimateRepository.delete(estimate.id);
    await jobRepository.delete(job.id);
    await basicEstimateTemplateRepository.delete(template.id);
  });

  test('creating an estimate with no template creates no note', async () => {
    const job = await jobRepository.create(estimateFixture.job);

    const estimate = await estimateService.create(job.id, {
      estimateNumber: estimateFixture.estimate.estimateNumber,
    });

    const notes = await noteRepository.findAllForParent(
      'Estimate',
      estimate.id,
    );
    expect(notes).toHaveLength(0);

    await customerLineItemRepository.deleteAllForParent(
      'estimate',
      estimate.id,
    );
    await estimateRepository.delete(estimate.id);
    await jobRepository.delete(job.id);
  });

  test('a real unique-constraint violation on job_id surfaces as ValidationError, not a raw 500', async () => {
    const job = await jobRepository.create(estimateFixture.job);
    const estimate = await estimateRepository.create({
      jobId: job.id,
      ...estimateFixture.estimate,
    });

    const staleService = new EstimateService({
      sequelize,
      jobRepository,
      estimateRepository: {
        create: estimateRepository.create.bind(estimateRepository),
        findByJobId: async () => null,
      },
      customerLineItemRepository,
      taxRepository,
      paymentTermTemplateRepository,
      basicEstimateTemplateRepository,
      noteRepository,
    });

    await expect(
      staleService.create(job.id, {
        estimateNumber: 'EST-RACE',
      }),
    ).rejects.toThrow(ValidationError);

    await customerLineItemRepository.deleteAllForParent(
      'estimate',
      estimate.id,
    );
    await estimateRepository.delete(estimate.id);
    await jobRepository.delete(job.id);
  });
});
