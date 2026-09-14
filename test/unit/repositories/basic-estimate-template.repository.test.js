import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from '@jest/globals';
import { BasicEstimateTemplateRepository } from '#repositories/basic-estimate-template.repository.js';

describe('BasicEstimateTemplateRepository', () => {
  let scopedModel;
  let model;
  let repository;

  beforeEach(() => {
    scopedModel = {
      findAll: jest.fn().mockResolvedValue([]),
      findByPk: jest.fn().mockResolvedValue(null),
    };
    model = { schema: jest.fn().mockReturnValue(scopedModel) };
    repository = new BasicEstimateTemplateRepository({
      basicEstimateTemplateModel: model,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const itemsInclude = [
    { association: 'items', separate: true, order: [['id', 'ASC']] },
  ];

  test('findAllWithItems includes items ordered by id', async () => {
    await repository.findAllWithItems();

    expect(scopedModel.findAll).toHaveBeenCalledWith({
      include: itemsInclude,
    });
  });

  test('findAllWithItems forwards extra options alongside the include', async () => {
    await repository.findAllWithItems({ transaction: 't' });

    expect(scopedModel.findAll).toHaveBeenCalledWith({
      include: itemsInclude,
      transaction: 't',
    });
  });

  test('findByIdWithItems includes items ordered by id', async () => {
    await repository.findByIdWithItems(5);

    expect(scopedModel.findByPk).toHaveBeenCalledWith(5, {
      include: itemsInclude,
    });
  });

  test('findByIdWithItems forwards extra options alongside the include', async () => {
    await repository.findByIdWithItems(5, { transaction: 't' });

    expect(scopedModel.findByPk).toHaveBeenCalledWith(5, {
      include: itemsInclude,
      transaction: 't',
    });
  });
});
