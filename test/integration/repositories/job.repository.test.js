import 'dotenv/config';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { createSequelize } from '#configs/database.js';
import { defineJobModel } from '#models/job.model.js';
import { JobRepository } from '#repositories/job.repository.js';
import fixture from '../../fixtures/job-todo-lists.fixture.cjs';
import { seedWithTransaction } from '../../helpers/seed-fixture.js';

describe('JobRepository (integration)', () => {
  let sequelize;
  let jobRepository;

  beforeAll(() => {
    sequelize = createSequelize();
    const jobModel = defineJobModel(sequelize);

    jobRepository = new JobRepository({ jobModel });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('creates and reads back a job', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      const job = await jobRepository.create(fixture.job, { transaction });

      const found = await jobRepository.findById(job.id, { transaction });

      expect(found.name).toBe(fixture.job.name);
    });
  });

  test('rolls back cleanly, leaving no rows after the transaction', async () => {
    let createdId;

    await seedWithTransaction(sequelize, async (transaction) => {
      const job = await jobRepository.create(fixture.job, { transaction });
      createdId = job.id;
    });

    const found = await jobRepository.findById(createdId);
    expect(found).toBeNull();
  });
});
