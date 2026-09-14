import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from '@jest/globals';
import { Op } from 'sequelize';
import { AllTemplateRepository } from '#repositories/all-template.repository.js';

describe('AllTemplateRepository', () => {
  let scopedModel;
  let model;
  let repository;

  beforeEach(() => {
    scopedModel = { findAll: jest.fn().mockResolvedValue([]) };
    model = { schema: jest.fn().mockReturnValue(scopedModel) };
    repository = new AllTemplateRepository({ allTemplateModel: model });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('search with no filters queries with an empty where clause', async () => {
    await repository.search();

    expect(scopedModel.findAll).toHaveBeenCalledWith({ where: {} });
  });

  test('search filters by category', async () => {
    await repository.search({ category: 'Payment Terms' });

    expect(scopedModel.findAll).toHaveBeenCalledWith({
      where: { category: 'Payment Terms' },
    });
  });

  test('search filters by name ILIKE for a free-text query', async () => {
    await repository.search({ query: 'net 30' });

    expect(scopedModel.findAll).toHaveBeenCalledWith({
      where: { name: { [Op.iLike]: '%net 30%' } },
    });
  });

  test('search combines category and query filters', async () => {
    await repository.search({ category: 'Todo Lists', query: 'move' });

    expect(scopedModel.findAll).toHaveBeenCalledWith({
      where: {
        category: 'Todo Lists',
        name: { [Op.iLike]: '%move%' },
      },
    });
  });
});
