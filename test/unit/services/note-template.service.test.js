import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { NoteTemplateService } from '#services/note-template.service.js';
import { NotFoundError, ValidationError } from '#configs/error/index.js';

describe('NoteTemplateService', () => {
  let noteTemplateRepository;
  let service;

  beforeEach(() => {
    noteTemplateRepository = {
      search: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    service = new NoteTemplateService({ noteTemplateRepository });
  });

  describe('list', () => {
    test('delegates to the repository search', async () => {
      noteTemplateRepository.search.mockResolvedValue([{ id: 1 }]);

      const result = await service.list({ typeKey: 'Customer', query: 'foo' });

      expect(noteTemplateRepository.search).toHaveBeenCalledWith({
        typeKey: 'Customer',
        query: 'foo',
      });
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('getById', () => {
    test('returns the note template when found', async () => {
      noteTemplateRepository.findById.mockResolvedValue({ id: 1 });

      const result = await service.getById(1);

      expect(result).toEqual({ id: 1 });
    });

    test('throws NotFoundError when missing', async () => {
      noteTemplateRepository.findById.mockResolvedValue(null);

      await expect(service.getById(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    test('creates when typeKey is valid', async () => {
      noteTemplateRepository.create.mockResolvedValue({
        id: 1,
        typeKey: 'Customer',
      });

      const result = await service.create({
        typeKey: 'Customer',
        name: 'n',
        body: 'b',
      });

      expect(noteTemplateRepository.create).toHaveBeenCalledWith({
        typeKey: 'Customer',
        name: 'n',
        body: 'b',
      });
      expect(result).toEqual({ id: 1, typeKey: 'Customer' });
    });

    test('throws ValidationError for an invalid typeKey', async () => {
      await expect(
        service.create({ typeKey: 'Bogus', name: 'n', body: 'b' }),
      ).rejects.toThrow(ValidationError);
      expect(noteTemplateRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    test('updates after confirming the record exists', async () => {
      noteTemplateRepository.findById.mockResolvedValue({ id: 1 });
      noteTemplateRepository.update.mockResolvedValue({
        id: 1,
        name: 'updated',
      });

      const result = await service.update(1, { name: 'updated' });

      expect(noteTemplateRepository.update).toHaveBeenCalledWith(1, {
        name: 'updated',
      });
      expect(result).toEqual({ id: 1, name: 'updated' });
    });

    test('throws NotFoundError when the record does not exist', async () => {
      noteTemplateRepository.findById.mockResolvedValue(null);

      await expect(service.update(999, { name: 'x' })).rejects.toThrow(
        NotFoundError,
      );
      expect(noteTemplateRepository.update).not.toHaveBeenCalled();
    });

    test('throws ValidationError for an invalid typeKey', async () => {
      noteTemplateRepository.findById.mockResolvedValue({ id: 1 });

      await expect(service.update(1, { typeKey: 'Bogus' })).rejects.toThrow(
        ValidationError,
      );
      expect(noteTemplateRepository.update).not.toHaveBeenCalled();
    });

    test('returns the current row without calling the repository when data is empty', async () => {
      noteTemplateRepository.findById.mockResolvedValue({
        id: 1,
        name: 'existing',
      });

      const result = await service.update(1, {});

      expect(noteTemplateRepository.update).not.toHaveBeenCalled();
      expect(result).toEqual({ id: 1, name: 'existing' });
    });
  });

  describe('remove', () => {
    test('deletes after confirming the record exists', async () => {
      noteTemplateRepository.findById.mockResolvedValue({ id: 1 });
      noteTemplateRepository.delete.mockResolvedValue(1);

      const result = await service.remove(1);

      expect(noteTemplateRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(1);
    });

    test('throws NotFoundError when the record does not exist', async () => {
      noteTemplateRepository.findById.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundError);
      expect(noteTemplateRepository.delete).not.toHaveBeenCalled();
    });
  });
});
