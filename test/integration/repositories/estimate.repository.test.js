import 'dotenv/config';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { createSequelize } from '#configs/database.js';
import { defineJobModel } from '#models/job.model.js';
import { defineEstimateModel } from '#models/estimate.model.js';
import { JobRepository } from '#repositories/job.repository.js';
import { EstimateRepository } from '#repositories/estimate.repository.js';
import fixture from '../../fixtures/estimates.fixture.cjs';
import { seedWithTransaction } from '../../helpers/seed-fixture.js';

describe('EstimateRepository (integration)', () => {
  let sequelize;
  let jobRepository;
  let estimateRepository;

  beforeAll(() => {
    sequelize = createSequelize();
    const jobModel = defineJobModel(sequelize);
    const estimateModel = defineEstimateModel(sequelize);

    jobRepository = new JobRepository({ jobModel });
    estimateRepository = new EstimateRepository({ estimateModel });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('creates an estimate without an explicit dateIssued or status, defaulting both', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      const job = await jobRepository.create(fixture.job, { transaction });

      const estimate = await estimateRepository.create(
        { jobId: job.id, estimateNumber: fixture.estimate.estimateNumber },
        { transaction },
      );

      expect(estimate.dateIssued).toBeTruthy();
      expect(estimate.type).toBe('Basic');
      expect(estimate.status).toBe('Draft');
    });
  });

  test('persists an explicit status', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      const job = await jobRepository.create(fixture.job, { transaction });

      const estimate = await estimateRepository.create(
        { jobId: job.id, ...fixture.estimate, status: 'Won' },
        { transaction },
      );

      expect(estimate.status).toBe('Won');
    });
  });

  test('finds an estimate by job id', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      const job = await jobRepository.create(fixture.job, { transaction });
      const estimate = await estimateRepository.create(
        { jobId: job.id, ...fixture.estimate },
        { transaction },
      );

      const found = await estimateRepository.findByJobId(job.id, {
        transaction,
      });

      expect(found.id).toBe(estimate.id);
    });
  });

  test('rejects a second estimate for the same job (unique job_id)', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      const job = await jobRepository.create(fixture.job, { transaction });
      await estimateRepository.create(
        { jobId: job.id, ...fixture.estimate },
        { transaction },
      );

      await expect(
        estimateRepository.create(
          { jobId: job.id, ...fixture.estimate },
          { transaction },
        ),
      ).rejects.toThrow();
    });
  });

  test('deleting the parent job cascades to its estimate', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      const job = await jobRepository.create(fixture.job, { transaction });
      const estimate = await estimateRepository.create(
        { jobId: job.id, ...fixture.estimate },
        { transaction },
      );

      await jobRepository.delete(job.id, { transaction });

      const found = await estimateRepository.findById(estimate.id, {
        transaction,
      });
      expect(found).toBeNull();
    });
  });

  test('rolls back cleanly, leaving no rows after the transaction', async () => {
    let createdId;

    await seedWithTransaction(sequelize, async (transaction) => {
      const job = await jobRepository.create(fixture.job, { transaction });
      const estimate = await estimateRepository.create(
        { jobId: job.id, ...fixture.estimate },
        { transaction },
      );
      createdId = estimate.id;
    });

    const found = await estimateRepository.findById(createdId);
    expect(found).toBeNull();
  });
});
