import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from '@jest/globals';
import { BasicEstimateTemplateItemRepository } from '#repositories/basic-estimate-template-item.repository.js';

describe('BasicEstimateTemplateItemRepository', () => {
  let scopedModel;
  let model;
  let repository;

  beforeEach(() => {
    scopedModel = {
      destroy: jest.fn().mockResolvedValue(2),
      bulkCreate: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
    };
    model = { schema: jest.fn().mockReturnValue(scopedModel) };
    repository = new BasicEstimateTemplateItemRepository({
      basicEstimateTemplateItemModel: model,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('deleteAllForTemplate destroys all items scoped to the template id', async () => {
    const result = await repository.deleteAllForTemplate(5, {
      transaction: 't',
    });

    expect(scopedModel.destroy).toHaveBeenCalledWith({
      where: { basicEstimateTemplateId: 5 },
      transaction: 't',
    });
    expect(result).toBe(2);
  });

  test('bulkCreate delegates to the schema-scoped model', async () => {
    const items = [{ serviceName: 'a' }, { serviceName: 'b' }];

    const result = await repository.bulkCreate(items, { transaction: 't' });

    expect(scopedModel.bulkCreate).toHaveBeenCalledWith(items, {
      transaction: 't',
    });
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });
});
