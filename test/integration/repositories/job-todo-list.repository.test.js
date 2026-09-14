import 'dotenv/config';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { createSequelize } from '#configs/database.js';
import { defineJobModel } from '#models/job.model.js';
import { defineJobTodoListModel } from '#models/job-todo-list.model.js';
import { defineJobTodoListItemModel } from '#models/job-todo-list-item.model.js';
import { JobRepository } from '#repositories/job.repository.js';
import { JobTodoListRepository } from '#repositories/job-todo-list.repository.js';
import { JobTodoListItemRepository } from '#repositories/job-todo-list-item.repository.js';
import fixture from '../../fixtures/job-todo-lists.fixture.cjs';
import { seedWithTransaction } from '../../helpers/seed-fixture.js';

describe('JobTodoListRepository (integration)', () => {
  let sequelize;
  let jobRepository;
  let jobTodoListRepository;
  let jobTodoListItemRepository;

  beforeAll(() => {
    sequelize = createSequelize();
    const jobModel = defineJobModel(sequelize);
    const jobTodoListModel = defineJobTodoListModel(sequelize);
    const jobTodoListItemModel = defineJobTodoListItemModel(sequelize);

    jobTodoListModel.hasMany(jobTodoListItemModel, {
      as: 'items',
      foreignKey: 'jobTodoListId',
    });
    jobTodoListItemModel.belongsTo(jobTodoListModel, {
      foreignKey: 'jobTodoListId',
    });

    jobRepository = new JobRepository({ jobModel });
    jobTodoListRepository = new JobTodoListRepository({ jobTodoListModel });
    jobTodoListItemRepository = new JobTodoListItemRepository({
      jobTodoListItemModel,
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('creates a list with items and reads them back in sortOrder', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      const job = await jobRepository.create(fixture.job, { transaction });
      const list = await jobTodoListRepository.create(
        { jobId: job.id, name: fixture.jobTodoList.name },
        { transaction },
      );

      await jobTodoListItemRepository.bulkCreate(
        fixture.jobTodoList.items.map((item, index) => ({
          jobTodoListId: list.id,
          text: item.text,
          sortOrder: index,
        })),
        { transaction },
      );

      const found = await jobTodoListRepository.findByIdWithItems(list.id, {
        transaction,
      });

      expect(found.items).toHaveLength(3);
      expect(found.items.map((item) => item.text)).toEqual([
        'Turn on utilities',
        'Change locks',
        'Inspect HVAC',
      ]);
      expect(found.items.every((item) => item.completed === false)).toBe(true);
    });
  });

  test('deleting the parent job cascades through the todo list to its items', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      const job = await jobRepository.create(fixture.job, { transaction });
      const list = await jobTodoListRepository.create(
        { jobId: job.id, name: fixture.jobTodoList.name },
        { transaction },
      );

      await jobTodoListItemRepository.bulkCreate(
        [{ jobTodoListId: list.id, text: 'one', sortOrder: 0 }],
        { transaction },
      );

      await jobRepository.delete(job.id, { transaction });

      const found = await jobTodoListRepository.findByIdWithItems(list.id, {
        transaction,
      });
      expect(found).toBeNull();
    });
  });

  test('deleting a todo list cascades to its items', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      const job = await jobRepository.create(fixture.job, { transaction });
      const list = await jobTodoListRepository.create(
        { jobId: job.id, name: fixture.jobTodoList.name },
        { transaction },
      );

      await jobTodoListItemRepository.bulkCreate(
        [{ jobTodoListId: list.id, text: 'one', sortOrder: 0 }],
        { transaction },
      );

      await jobTodoListRepository.delete(list.id, { transaction });

      const found = await jobTodoListRepository.findByIdWithItems(list.id, {
        transaction,
      });
      expect(found).toBeNull();
    });
  });

  test('rolls back cleanly, leaving no rows after the transaction', async () => {
    let createdId;

    await seedWithTransaction(sequelize, async (transaction) => {
      const job = await jobRepository.create(fixture.job, { transaction });
      const list = await jobTodoListRepository.create(
        { jobId: job.id, name: fixture.jobTodoList.name },
        { transaction },
      );
      createdId = list.id;
    });

    const found = await jobTodoListRepository.findById(createdId);
    expect(found).toBeNull();
  });
});
