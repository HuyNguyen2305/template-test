import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from '@jest/globals';

const getSchemaName = jest.fn();

jest.unstable_mockModule('#common/request-context.js', () => ({
  getSchemaName,
}));

const { Baserepository } = await import('#common/base-repository.js');

describe('Baserepository', () => {
  let scopedModel;
  let model;
  let repository;

  beforeEach(() => {
    getSchemaName.mockReturnValue('tenant_a');
    scopedModel = {
      findAll: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
    };
    model = { schema: jest.fn().mockReturnValue(scopedModel) };
    repository = new Baserepository(model);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('setSchema scopes the model to the current tenant schema', () => {
    const result = repository.setSchema();

    expect(getSchemaName).toHaveBeenCalled();
    expect(model.schema).toHaveBeenCalledWith('tenant_a');
    expect(result).toBe(scopedModel);
  });

  test('findAll delegates to the schema-scoped model', async () => {
    scopedModel.findAll.mockResolvedValue([{ id: 1 }]);

    const result = await repository.findAll({ where: { id: 1 } });

    expect(scopedModel.findAll).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toEqual([{ id: 1 }]);
  });

  test('findById delegates to findByPk on the schema-scoped model', async () => {
    scopedModel.findByPk.mockResolvedValue({ id: 5 });

    const result = await repository.findById(5);

    expect(scopedModel.findByPk).toHaveBeenCalledWith(5, {});
    expect(result).toEqual({ id: 5 });
  });

  test('create delegates to the schema-scoped model', async () => {
    scopedModel.create.mockResolvedValue({ id: 1, name: 'foo' });

    const result = await repository.create({ name: 'foo' });

    expect(scopedModel.create).toHaveBeenCalledWith({ name: 'foo' }, {});
    expect(result).toEqual({ id: 1, name: 'foo' });
  });

  test('update delegates to the schema-scoped model and returns the updated row', async () => {
    scopedModel.update.mockResolvedValue([1, [{ id: 1, name: 'bar' }]]);

    const result = await repository.update(1, { name: 'bar' });

    expect(scopedModel.update).toHaveBeenCalledWith(
      { name: 'bar' },
      { where: { id: 1 }, returning: true },
    );
    expect(result).toEqual({ id: 1, name: 'bar' });
  });

  test('delete delegates to destroy on the schema-scoped model', async () => {
    scopedModel.destroy.mockResolvedValue(1);

    const result = await repository.delete(1);

    expect(scopedModel.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toBe(1);
  });
});
