import 'dotenv/config';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { createSequelize } from '#configs/database.js';
import { defineTodoListTemplateModel } from '#models/todo-list-template.model.js';
import { defineTodoListTemplateItemModel } from '#models/todo-list-template-item.model.js';
import { TodoListTemplateRepository } from '#repositories/todo-list-template.repository.js';
import { TodoListTemplateItemRepository } from '#repositories/todo-list-template-item.repository.js';
import fixture from '../../fixtures/todo-list-templates.fixture.cjs';
import { seedWithTransaction } from '../../helpers/seed-fixture.js';

describe('TodoListTemplateRepository (integration)', () => {
  let sequelize;
  let todoListTemplateRepository;
  let todoListTemplateItemRepository;

  beforeAll(() => {
    sequelize = createSequelize();
    const todoListTemplateModel = defineTodoListTemplateModel(sequelize);
    const todoListTemplateItemModel =
      defineTodoListTemplateItemModel(sequelize);

    todoListTemplateModel.hasMany(todoListTemplateItemModel, {
      as: 'items',
      foreignKey: 'todoListTemplateId',
    });
    todoListTemplateItemModel.belongsTo(todoListTemplateModel, {
      foreignKey: 'todoListTemplateId',
    });

    todoListTemplateRepository = new TodoListTemplateRepository({
      todoListTemplateModel,
    });
    todoListTemplateItemRepository = new TodoListTemplateItemRepository({
      todoListTemplateItemModel,
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('creates a list with items and reads them back in sortOrder', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      const list = await todoListTemplateRepository.create(
        { name: fixture.name },
        { transaction },
      );

      await todoListTemplateItemRepository.bulkCreate(
        fixture.items.map((item, index) => ({
          todoListTemplateId: list.id,
          text: item.text,
          sortOrder: index,
        })),
        { transaction },
      );

      const found = await todoListTemplateRepository.findByIdWithItems(
        list.id,
        { transaction },
      );

      expect(found.items).toHaveLength(3);
      expect(found.items.map((item) => item.text)).toEqual([
        'Turn on utilities',
        'Change locks',
        'Inspect HVAC',
      ]);
    });
  });

  test('deleting a list cascades to its items', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      const list = await todoListTemplateRepository.create(
        { name: fixture.name },
        { transaction },
      );

      await todoListTemplateItemRepository.bulkCreate(
        [{ todoListTemplateId: list.id, text: 'one', sortOrder: 0 }],
        { transaction },
      );

      await todoListTemplateRepository.delete(list.id, { transaction });

      const found = await todoListTemplateRepository.findByIdWithItems(
        list.id,
        { transaction },
      );
      expect(found).toBeNull();
    });
  });

  test('rolls back cleanly, leaving no rows after the transaction', async () => {
    let createdId;

    await seedWithTransaction(sequelize, async (transaction) => {
      const list = await todoListTemplateRepository.create(
        { name: fixture.name },
        { transaction },
      );
      createdId = list.id;
    });

    const found = await todoListTemplateRepository.findById(createdId);
    expect(found).toBeNull();
  });
});
