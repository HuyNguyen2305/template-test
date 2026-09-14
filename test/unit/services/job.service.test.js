import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { JobService } from '#services/job.service.js';
import { NotFoundError } from '#configs/error/index.js';

describe('JobService', () => {
  let jobRepository;
  let invoiceRepository;
  let estimateRepository;
  let customerLineItemRepository;
  let noteRepository;
  let sequelize;
  let service;

  beforeEach(() => {
    jobRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    invoiceRepository = {
      findByJobId: jest.fn(),
    };
    estimateRepository = {
      findByJobId: jest.fn(),
    };
    customerLineItemRepository = {
      deleteAllForParent: jest.fn(),
    };
    noteRepository = {
      deleteAllForParent: jest.fn(),
    };
    sequelize = {
      transaction: jest.fn((callback) => callback('mock-transaction')),
    };
    service = new JobService({
      sequelize,
      jobRepository,
      invoiceRepository,
      estimateRepository,
      customerLineItemRepository,
      noteRepository,
    });
  });

  describe('list', () => {
    test('delegates to the repository', async () => {
      jobRepository.findAll.mockResolvedValue([{ id: 1 }]);

      const result = await service.list();

      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('getById', () => {
    test('returns the job when found', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });

      const result = await service.getById(1);

      expect(result).toEqual({ id: 1 });
    });

    test('throws NotFoundError when missing', async () => {
      jobRepository.findById.mockResolvedValue(null);

      await expect(service.getById(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    test('delegates to the repository', async () => {
      jobRepository.create.mockResolvedValue({ id: 1, name: 'Wall Street' });

      const result = await service.create({ name: 'Wall Street' });

      expect(jobRepository.create).toHaveBeenCalledWith({
        name: 'Wall Street',
      });
      expect(result).toEqual({ id: 1, name: 'Wall Street' });
    });
  });

  describe('update', () => {
    test('updates after confirming existence', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      jobRepository.update.mockResolvedValue({ id: 1, name: 'updated' });

      const result = await service.update(1, { name: 'updated' });

      expect(jobRepository.update).toHaveBeenCalledWith(1, {
        name: 'updated',
      });
      expect(result).toEqual({ id: 1, name: 'updated' });
    });

    test('throws NotFoundError when missing', async () => {
      jobRepository.findById.mockResolvedValue(null);

      await expect(service.update(999, { name: 'x' })).rejects.toThrow(
        NotFoundError,
      );
      expect(jobRepository.update).not.toHaveBeenCalled();
    });

    test('returns the current row without calling the repository when data is empty', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1, name: 'Wall Street' });

      const result = await service.update(1, {});

      expect(jobRepository.update).not.toHaveBeenCalled();
      expect(result).toEqual({ id: 1, name: 'Wall Street' });
    });
  });

  describe('remove', () => {
    test('deletes the job when it has no invoice or estimate', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      invoiceRepository.findByJobId.mockResolvedValue(null);
      estimateRepository.findByJobId.mockResolvedValue(null);
      jobRepository.delete.mockResolvedValue(1);

      const result = await service.remove(1);

      expect(
        customerLineItemRepository.deleteAllForParent,
      ).not.toHaveBeenCalled();
      expect(noteRepository.deleteAllForParent).toHaveBeenCalledWith('Job', 1, {
        transaction: 'mock-transaction',
      });
      expect(noteRepository.deleteAllForParent).toHaveBeenCalledTimes(1);
      expect(jobRepository.delete).toHaveBeenCalledWith(1, {
        transaction: 'mock-transaction',
      });
      expect(result).toBe(1);
    });

    test('cleans up the invoice line items before deleting the job', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      invoiceRepository.findByJobId.mockResolvedValue({ id: 10 });
      estimateRepository.findByJobId.mockResolvedValue(null);
      jobRepository.delete.mockResolvedValue(1);

      await service.remove(1);

      expect(
        customerLineItemRepository.deleteAllForParent,
      ).toHaveBeenCalledWith('invoice', 10, {
        transaction: 'mock-transaction',
      });
      expect(
        customerLineItemRepository.deleteAllForParent,
      ).toHaveBeenCalledTimes(1);
      expect(noteRepository.deleteAllForParent).toHaveBeenCalledWith(
        'Invoice',
        10,
        { transaction: 'mock-transaction' },
      );
    });

    test('cleans up the estimate line items before deleting the job', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      invoiceRepository.findByJobId.mockResolvedValue(null);
      estimateRepository.findByJobId.mockResolvedValue({ id: 20 });
      jobRepository.delete.mockResolvedValue(1);

      await service.remove(1);

      expect(
        customerLineItemRepository.deleteAllForParent,
      ).toHaveBeenCalledWith('estimate', 20, {
        transaction: 'mock-transaction',
      });
      expect(
        customerLineItemRepository.deleteAllForParent,
      ).toHaveBeenCalledTimes(1);
      expect(noteRepository.deleteAllForParent).toHaveBeenCalledWith(
        'Estimate',
        20,
        { transaction: 'mock-transaction' },
      );
    });

    test('cleans up both invoice and estimate line items when both exist', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      invoiceRepository.findByJobId.mockResolvedValue({ id: 10 });
      estimateRepository.findByJobId.mockResolvedValue({ id: 20 });
      jobRepository.delete.mockResolvedValue(1);

      await service.remove(1);

      expect(
        customerLineItemRepository.deleteAllForParent,
      ).toHaveBeenCalledWith('invoice', 10, {
        transaction: 'mock-transaction',
      });
      expect(
        customerLineItemRepository.deleteAllForParent,
      ).toHaveBeenCalledWith('estimate', 20, {
        transaction: 'mock-transaction',
      });
      expect(
        customerLineItemRepository.deleteAllForParent,
      ).toHaveBeenCalledTimes(2);
      expect(noteRepository.deleteAllForParent).toHaveBeenCalledWith(
        'Invoice',
        10,
        { transaction: 'mock-transaction' },
      );
      expect(noteRepository.deleteAllForParent).toHaveBeenCalledWith(
        'Estimate',
        20,
        { transaction: 'mock-transaction' },
      );
      expect(noteRepository.deleteAllForParent).toHaveBeenCalledWith('Job', 1, {
        transaction: 'mock-transaction',
      });
      expect(noteRepository.deleteAllForParent).toHaveBeenCalledTimes(3);
    });

    test('throws NotFoundError when missing and never opens a transaction', async () => {
      jobRepository.findById.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundError);
      expect(sequelize.transaction).not.toHaveBeenCalled();
      expect(jobRepository.delete).not.toHaveBeenCalled();
    });
  });
});
