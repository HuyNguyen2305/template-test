import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { TaxService } from '#services/tax.service.js';
import { NotFoundError } from '#configs/error/index.js';

describe('TaxService', () => {
  let taxRepository;
  let service;

  beforeEach(() => {
    taxRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    service = new TaxService({ taxRepository });
  });

  describe('list', () => {
    test('delegates to the repository', async () => {
      taxRepository.findAll.mockResolvedValue([{ id: 1 }]);

      const result = await service.list();

      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('getById', () => {
    test('returns the tax when found', async () => {
      taxRepository.findById.mockResolvedValue({ id: 1 });

      const result = await service.getById(1);

      expect(result).toEqual({ id: 1 });
    });

    test('throws NotFoundError when missing', async () => {
      taxRepository.findById.mockResolvedValue(null);

      await expect(service.getById(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    test('delegates to the repository', async () => {
      taxRepository.create.mockResolvedValue({ id: 1, name: 'VAT', rate: 10 });

      const result = await service.create({ name: 'VAT', rate: 10 });

      expect(taxRepository.create).toHaveBeenCalledWith({
        name: 'VAT',
        rate: 10,
      });
      expect(result).toEqual({ id: 1, name: 'VAT', rate: 10 });
    });
  });

  describe('update', () => {
    test('updates after confirming existence', async () => {
      taxRepository.findById.mockResolvedValue({ id: 1 });
      taxRepository.update.mockResolvedValue({ id: 1, name: 'updated' });

      const result = await service.update(1, { name: 'updated' });

      expect(taxRepository.update).toHaveBeenCalledWith(1, { name: 'updated' });
      expect(result).toEqual({ id: 1, name: 'updated' });
    });

    test('throws NotFoundError when missing', async () => {
      taxRepository.findById.mockResolvedValue(null);

      await expect(service.update(999, { name: 'x' })).rejects.toThrow(
        NotFoundError,
      );
      expect(taxRepository.update).not.toHaveBeenCalled();
    });

    test('returns the current row without calling the repository when data is empty', async () => {
      taxRepository.findById.mockResolvedValue({ id: 1, name: 'VAT' });

      const result = await service.update(1, {});

      expect(taxRepository.update).not.toHaveBeenCalled();
      expect(result).toEqual({ id: 1, name: 'VAT' });
    });
  });

  describe('remove', () => {
    test('deletes after confirming existence', async () => {
      taxRepository.findById.mockResolvedValue({ id: 1 });
      taxRepository.delete.mockResolvedValue(1);

      const result = await service.remove(1);

      expect(taxRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(1);
    });

    test('throws NotFoundError when missing', async () => {
      taxRepository.findById.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundError);
      expect(taxRepository.delete).not.toHaveBeenCalled();
    });
  });
});
