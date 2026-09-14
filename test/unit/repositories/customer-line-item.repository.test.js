import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from '@jest/globals';
import { CustomerLineItemRepository } from '#repositories/customer-line-item.repository.js';

describe('CustomerLineItemRepository', () => {
  let scopedModel;
  let model;
  let repository;

  beforeEach(() => {
    scopedModel = {
      findAll: jest.fn().mockResolvedValue([]),
      destroy: jest.fn().mockResolvedValue(2),
      bulkCreate: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
    };
    model = { schema: jest.fn().mockReturnValue(scopedModel) };
    repository = new CustomerLineItemRepository({
      customerLineItemModel: model,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('findAllForParent queries by parentType/parentId ordered by sortOrder', async () => {
    await repository.findAllForParent('invoice', 5);

    expect(scopedModel.findAll).toHaveBeenCalledWith({
      where: { parentType: 'invoice', parentId: 5 },
      order: [['sortOrder', 'ASC']],
    });
  });

  test('findAllForParent forwards extra options', async () => {
    await repository.findAllForParent('invoice', 5, { transaction: 't' });

    expect(scopedModel.findAll).toHaveBeenCalledWith({
      where: { parentType: 'invoice', parentId: 5 },
      order: [['sortOrder', 'ASC']],
      transaction: 't',
    });
  });

  test('deleteAllForParent destroys all items scoped to the parent', async () => {
    const result = await repository.deleteAllForParent('invoice', 5, {
      transaction: 't',
    });

    expect(scopedModel.destroy).toHaveBeenCalledWith({
      where: { parentType: 'invoice', parentId: 5 },
      transaction: 't',
    });
    expect(result).toBe(2);
  });

  test('bulkCreate delegates to the schema-scoped model', async () => {
    const items = [{ itemName: 'a' }, { itemName: 'b' }];

    const result = await repository.bulkCreate(items, { transaction: 't' });

    expect(scopedModel.bulkCreate).toHaveBeenCalledWith(items, {
      transaction: 't',
    });
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });
});
