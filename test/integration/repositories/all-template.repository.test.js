import 'dotenv/config';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { createSequelize } from '#configs/database.js';
import { defineAllTemplateModel } from '#models/all-template.model.js';
import { defineNoteTemplateModel } from '#models/note-template.model.js';
import { definePaymentTermTemplateModel } from '#models/payment-term-template.model.js';
import { defineTodoListTemplateModel } from '#models/todo-list-template.model.js';
import { defineBasicEstimateTemplateModel } from '#models/basic-estimate-template.model.js';
import { AllTemplateRepository } from '#repositories/all-template.repository.js';
import { seedWithTransaction } from '../../helpers/seed-fixture.js';

describe('AllTemplateRepository (integration)', () => {
  let sequelize;
  let allTemplateRepository;
  let NoteTemplate;
  let PaymentTermTemplate;
  let TodoListTemplate;
  let BasicEstimateTemplate;

  beforeAll(() => {
    sequelize = createSequelize();
    const allTemplateModel = defineAllTemplateModel(sequelize);
    allTemplateRepository = new AllTemplateRepository({ allTemplateModel });
    NoteTemplate = defineNoteTemplateModel(sequelize);
    PaymentTermTemplate = definePaymentTermTemplateModel(sequelize);
    TodoListTemplate = defineTodoListTemplateModel(sequelize);
    BasicEstimateTemplate = defineBasicEstimateTemplateModel(sequelize);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('unions all four source tables with the correct category mapping', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      const uniqueTag = `IntegrationTag${Date.now()}`;

      await NoteTemplate.schema('public').create(
        { typeKey: 'Job', name: `${uniqueTag} Note`, body: 'body' },
        { transaction },
      );
      await PaymentTermTemplate.schema('public').create(
        {
          name: `${uniqueTag} Terms`,
          dueDateValue: 30,
          dueDateUnit: 'Days',
          lateFeeValue: 5,
          lateFeeUnit: '%',
          description: 'desc',
        },
        { transaction },
      );
      await TodoListTemplate.schema('public').create(
        { name: `${uniqueTag} Todo` },
        { transaction },
      );
      await BasicEstimateTemplate.schema('public').create(
        { name: `${uniqueTag} Estimate` },
        { transaction },
      );

      const results = await allTemplateRepository.search(
        { query: uniqueTag },
        { transaction },
      );

      expect(results).toHaveLength(4);

      const bySourceTable = Object.fromEntries(
        results.map((row) => [row.sourceTable, row]),
      );
      expect(bySourceTable.NoteTemplate.category).toBe('Job Notes');
      expect(bySourceTable.PaymentTermTemplate.category).toBe('Payment Terms');
      expect(bySourceTable.TodoListTemplate.category).toBe('Todo Lists');
      expect(bySourceTable.BasicEstimateTemplate.category).toBe(
        'Basic Estimates',
      );
    });
  });

  test('filters by category', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      const uniqueTag = `CategoryTag${Date.now()}`;

      await NoteTemplate.schema('public').create(
        { typeKey: 'Customer', name: `${uniqueTag} Note`, body: 'body' },
        { transaction },
      );
      await TodoListTemplate.schema('public').create(
        { name: `${uniqueTag} Todo` },
        { transaction },
      );

      const results = await allTemplateRepository.search(
        { category: 'Todo Lists', query: uniqueTag },
        { transaction },
      );

      expect(results).toHaveLength(1);
      expect(results[0].sourceTable).toBe('TodoListTemplate');
    });
  });
});
