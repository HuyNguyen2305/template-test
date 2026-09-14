import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from '@jest/globals';
import { Op } from 'sequelize';
import { NoteTemplateRepository } from '#repositories/note-template.repository.js';

describe('NoteTemplateRepository', () => {
  let scopedModel;
  let model;
  let repository;

  beforeEach(() => {
    scopedModel = { findAll: jest.fn().mockResolvedValue([]) };
    model = { schema: jest.fn().mockReturnValue(scopedModel) };
    repository = new NoteTemplateRepository({ noteTemplateModel: model });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('search with no filters queries with an empty where clause', async () => {
    await repository.search();

    expect(scopedModel.findAll).toHaveBeenCalledWith({ where: {} });
  });

  test('search filters by typeKey', async () => {
    await repository.search({ typeKey: 'Customer' });

    expect(scopedModel.findAll).toHaveBeenCalledWith({
      where: { typeKey: 'Customer' },
    });
  });

  test('search filters by name/body ILIKE for a free-text query', async () => {
    await repository.search({ query: 'refund' });

    expect(scopedModel.findAll).toHaveBeenCalledWith({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: '%refund%' } },
          { body: { [Op.iLike]: '%refund%' } },
        ],
      },
    });
  });

  test('search combines typeKey and query filters', async () => {
    await repository.search({ typeKey: 'Invoice', query: 'late' });

    expect(scopedModel.findAll).toHaveBeenCalledWith({
      where: {
        typeKey: 'Invoice',
        [Op.or]: [
          { name: { [Op.iLike]: '%late%' } },
          { body: { [Op.iLike]: '%late%' } },
        ],
      },
    });
  });
});
