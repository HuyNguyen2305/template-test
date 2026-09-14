import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { JobTodoListService } from '#services/job-todo-list.service.js';
import { NotFoundError, ValidationError } from '#configs/error/index.js';

describe('JobTodoListService', () => {
  let sequelize;
  let jobRepository;
  let jobTodoListRepository;
  let jobTodoListItemRepository;
  let todoListTemplateRepository;
  let service;

  beforeEach(() => {
    sequelize = {
      transaction: jest.fn(async (callback) => callback('fake-transaction')),
    };
    jobRepository = {
      findById: jest.fn(),
    };
    jobTodoListRepository = {
      findAllWithItems: jest.fn(),
      findByIdWithItems: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    jobTodoListItemRepository = {
      deleteAllForList: jest.fn(),
      bulkCreate: jest.fn(),
    };
    todoListTemplateRepository = {
      findByIdWithItems: jest.fn(),
    };
    service = new JobTodoListService({
      sequelize,
      jobRepository,
      jobTodoListRepository,
      jobTodoListItemRepository,
      todoListTemplateRepository,
    });
  });

  describe('list', () => {
    test('throws NotFoundError when the job does not exist', async () => {
      jobRepository.findById.mockResolvedValue(null);

      await expect(service.list(999)).rejects.toThrow(NotFoundError);
      expect(jobTodoListRepository.findAllWithItems).not.toHaveBeenCalled();
    });

    test('scopes the query to the job id', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      jobTodoListRepository.findAllWithItems.mockResolvedValue([{ id: 1 }]);

      const result = await service.list(1);

      expect(jobTodoListRepository.findAllWithItems).toHaveBeenCalledWith({
        where: { jobId: 1 },
      });
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('getById', () => {
    test('throws NotFoundError when the job does not exist', async () => {
      jobRepository.findById.mockResolvedValue(null);

      await expect(service.getById(999, 1)).rejects.toThrow(NotFoundError);
    });

    test('throws NotFoundError when the todo list does not exist', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      jobTodoListRepository.findByIdWithItems.mockResolvedValue(null);

      await expect(service.getById(1, 999)).rejects.toThrow(NotFoundError);
    });

    test('throws NotFoundError when the todo list belongs to a different job', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      jobTodoListRepository.findByIdWithItems.mockResolvedValue({
        id: 5,
        jobId: 2,
      });

      await expect(service.getById(1, 5)).rejects.toThrow(NotFoundError);
    });

    test('returns the todo list when it belongs to the job', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      jobTodoListRepository.findByIdWithItems.mockResolvedValue({
        id: 5,
        jobId: 1,
      });

      const result = await service.getById(1, 5);

      expect(result).toEqual({ id: 5, jobId: 1 });
    });
  });

  describe('create', () => {
    test('throws NotFoundError when the job does not exist', async () => {
      jobRepository.findById.mockResolvedValue(null);

      await expect(service.create(999, { name: 'Checklist' })).rejects.toThrow(
        NotFoundError,
      );
      expect(sequelize.transaction).not.toHaveBeenCalled();
    });

    test('creates with explicit items, ignoring sourceTemplateId', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      jobTodoListRepository.create.mockResolvedValue({ id: 10 });
      jobTodoListRepository.findByIdWithItems.mockResolvedValue({ id: 10 });

      await service.create(1, {
        name: 'Checklist',
        items: [{ text: 'a' }],
        sourceTemplateId: 99,
      });

      expect(
        todoListTemplateRepository.findByIdWithItems,
      ).not.toHaveBeenCalled();
      expect(jobTodoListRepository.create).toHaveBeenCalledWith(
        { jobId: 1, name: 'Checklist' },
        { transaction: 'fake-transaction' },
      );
      expect(jobTodoListItemRepository.bulkCreate).toHaveBeenCalledWith(
        [{ jobTodoListId: 10, text: 'a', completed: false, sortOrder: 0 }],
        { transaction: 'fake-transaction' },
      );
    });

    test('seeds items from the source template when items is omitted', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      todoListTemplateRepository.findByIdWithItems.mockResolvedValue({
        id: 99,
        items: [
          { id: 1, text: 'Step 1', sortOrder: 0 },
          { id: 2, text: 'Step 2', sortOrder: 1 },
        ],
      });
      jobTodoListRepository.create.mockResolvedValue({ id: 10 });
      jobTodoListRepository.findByIdWithItems.mockResolvedValue({ id: 10 });

      await service.create(1, { name: 'Checklist', sourceTemplateId: 99 });

      expect(todoListTemplateRepository.findByIdWithItems).toHaveBeenCalledWith(
        99,
      );
      expect(jobTodoListItemRepository.bulkCreate).toHaveBeenCalledWith(
        [
          { jobTodoListId: 10, text: 'Step 1', completed: false, sortOrder: 0 },
          { jobTodoListId: 10, text: 'Step 2', completed: false, sortOrder: 1 },
        ],
        { transaction: 'fake-transaction' },
      );
    });

    test('throws ValidationError when the source template does not exist', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      todoListTemplateRepository.findByIdWithItems.mockResolvedValue(null);

      await expect(
        service.create(1, { name: 'Checklist', sourceTemplateId: 99 }),
      ).rejects.toThrow(ValidationError);
      expect(jobTodoListRepository.create).not.toHaveBeenCalled();
    });

    test('creates with no items and no sourceTemplateId', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      jobTodoListRepository.create.mockResolvedValue({ id: 10 });
      jobTodoListRepository.findByIdWithItems.mockResolvedValue({ id: 10 });

      await service.create(1, { name: 'Empty' });

      expect(jobTodoListItemRepository.bulkCreate).toHaveBeenCalledWith([], {
        transaction: 'fake-transaction',
      });
    });
  });

  describe('update', () => {
    test('throws NotFoundError when the job does not exist', async () => {
      jobRepository.findById.mockResolvedValue(null);

      await expect(service.update(999, 1, { name: 'x' })).rejects.toThrow(
        NotFoundError,
      );
    });

    test('throws NotFoundError when the todo list belongs to a different job', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      jobTodoListRepository.findByIdWithItems.mockResolvedValue({
        id: 5,
        jobId: 2,
      });

      await expect(service.update(1, 5, { name: 'x' })).rejects.toThrow(
        NotFoundError,
      );
      expect(sequelize.transaction).not.toHaveBeenCalled();
    });

    test('replaces items, marking completed flags, inside one transaction', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      jobTodoListRepository.findByIdWithItems
        .mockResolvedValueOnce({ id: 5, jobId: 1 })
        .mockResolvedValueOnce({
          id: 5,
          jobId: 1,
          items: [{ text: 'a', completed: true }],
        });

      const result = await service.update(1, 5, {
        items: [{ text: 'a', completed: true }],
      });

      expect(jobTodoListItemRepository.deleteAllForList).toHaveBeenCalledWith(
        5,
        { transaction: 'fake-transaction' },
      );
      expect(jobTodoListItemRepository.bulkCreate).toHaveBeenCalledWith(
        [{ jobTodoListId: 5, text: 'a', completed: true, sortOrder: 0 }],
        { transaction: 'fake-transaction' },
      );
      expect(result.items[0].completed).toBe(true);
    });

    test('leaves items untouched when items is not provided', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      jobTodoListRepository.findByIdWithItems.mockResolvedValue({
        id: 5,
        jobId: 1,
      });

      await service.update(1, 5, { name: 'Renamed only' });

      expect(jobTodoListItemRepository.deleteAllForList).not.toHaveBeenCalled();
      expect(jobTodoListItemRepository.bulkCreate).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    test('deletes after confirming ownership', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      jobTodoListRepository.findByIdWithItems.mockResolvedValue({
        id: 5,
        jobId: 1,
      });
      jobTodoListRepository.delete.mockResolvedValue(1);

      const result = await service.remove(1, 5);

      expect(jobTodoListRepository.delete).toHaveBeenCalledWith(5);
      expect(result).toBe(1);
    });

    test('throws NotFoundError when the todo list belongs to a different job', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      jobTodoListRepository.findByIdWithItems.mockResolvedValue({
        id: 5,
        jobId: 2,
      });

      await expect(service.remove(1, 5)).rejects.toThrow(NotFoundError);
      expect(jobTodoListRepository.delete).not.toHaveBeenCalled();
    });
  });
});
