import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from '@jest/globals';
import { NoteRepository } from '#repositories/note.repository.js';

describe('NoteRepository', () => {
  let scopedModel;
  let model;
  let repository;

  beforeEach(() => {
    scopedModel = {
      findAll: jest.fn().mockResolvedValue([]),
      destroy: jest.fn().mockResolvedValue(0),
    };
    model = { schema: jest.fn().mockReturnValue(scopedModel) };
    repository = new NoteRepository({ noteModel: model });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllForParent', () => {
    test('queries by type and stringified parentId, ordered by createdAt', async () => {
      scopedModel.findAll.mockResolvedValue([{ id: 1 }]);

      const result = await repository.findAllForParent('Job', 5);

      expect(scopedModel.findAll).toHaveBeenCalledWith({
        where: { type: 'Job', parentId: '5' },
        order: [['createdAt', 'ASC']],
      });
      expect(result).toEqual([{ id: 1 }]);
    });

    test('forwards extra options', async () => {
      await repository.findAllForParent('Job', 5, { transaction: 't' });

      expect(scopedModel.findAll).toHaveBeenCalledWith({
        where: { type: 'Job', parentId: '5' },
        order: [['createdAt', 'ASC']],
        transaction: 't',
      });
    });
  });

  describe('deleteAllForParent', () => {
    test('destroys by type and stringified parentId', async () => {
      await repository.deleteAllForParent('Estimate', 7);

      expect(scopedModel.destroy).toHaveBeenCalledWith({
        where: { type: 'Estimate', parentId: '7' },
      });
    });

    test('forwards extra options', async () => {
      await repository.deleteAllForParent('Estimate', 7, { transaction: 't' });

      expect(scopedModel.destroy).toHaveBeenCalledWith({
        where: { type: 'Estimate', parentId: '7' },
        transaction: 't',
      });
    });
  });
});
