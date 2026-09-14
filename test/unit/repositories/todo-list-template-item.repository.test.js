import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from '@jest/globals';
import { TodoListTemplateItemRepository } from '#repositories/todo-list-template-item.repository.js';

describe('TodoListTemplateItemRepository', () => {
  let scopedModel;
  let model;
  let repository;

  beforeEach(() => {
    scopedModel = {
      destroy: jest.fn().mockResolvedValue(2),
      bulkCreate: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
    };
    model = { schema: jest.fn().mockReturnValue(scopedModel) };
    repository = new TodoListTemplateItemRepository({
      todoListTemplateItemModel: model,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('deleteAllForList destroys all items scoped to the list id', async () => {
    const result = await repository.deleteAllForList(5, { transaction: 't' });

    expect(scopedModel.destroy).toHaveBeenCalledWith({
      where: { todoListTemplateId: 5 },
      transaction: 't',
    });
    expect(result).toBe(2);
  });

  test('bulkCreate delegates to the schema-scoped model', async () => {
    const items = [{ text: 'a' }, { text: 'b' }];

    const result = await repository.bulkCreate(items, { transaction: 't' });

    expect(scopedModel.bulkCreate).toHaveBeenCalledWith(items, {
      transaction: 't',
    });
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });
});
