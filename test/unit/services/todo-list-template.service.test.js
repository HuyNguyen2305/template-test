import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { TodoListTemplateService } from '#services/todo-list-template.service.js';
import { NotFoundError } from '#configs/error/index.js';

describe('TodoListTemplateService', () => {
  let sequelize;
  let todoListTemplateRepository;
  let todoListTemplateItemRepository;
  let service;

  beforeEach(() => {
    sequelize = {
      transaction: jest.fn(async (callback) => callback('fake-transaction')),
    };
    todoListTemplateRepository = {
      findAllWithItems: jest.fn(),
      findByIdWithItems: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    todoListTemplateItemRepository = {
      deleteAllForList: jest.fn(),
      bulkCreate: jest.fn(),
    };
    service = new TodoListTemplateService({
      sequelize,
      todoListTemplateRepository,
      todoListTemplateItemRepository,
    });
  });

  describe('list', () => {
    test('delegates to findAllWithItems', async () => {
      todoListTemplateRepository.findAllWithItems.mockResolvedValue([
        { id: 1 },
      ]);

      const result = await service.list();

      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('getById', () => {
    test('returns the record when found', async () => {
      todoListTemplateRepository.findByIdWithItems.mockResolvedValue({ id: 1 });

      const result = await service.getById(1);

      expect(result).toEqual({ id: 1 });
    });

    test('throws NotFoundError when missing', async () => {
      todoListTemplateRepository.findByIdWithItems.mockResolvedValue(null);

      await expect(service.getById(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    test('creates the list, bulk-creates items with sortOrder from array index, in one transaction', async () => {
      todoListTemplateRepository.create.mockResolvedValue({ id: 1 });
      todoListTemplateRepository.findByIdWithItems.mockResolvedValue({
        id: 1,
        items: [{ text: 'a' }, { text: 'b' }],
      });

      const result = await service.create({
        name: 'Checklist',
        items: [{ text: 'a' }, { text: 'b' }],
      });

      expect(sequelize.transaction).toHaveBeenCalled();
      expect(todoListTemplateRepository.create).toHaveBeenCalledWith(
        { name: 'Checklist' },
        { transaction: 'fake-transaction' },
      );
      expect(todoListTemplateItemRepository.bulkCreate).toHaveBeenCalledWith(
        [
          { todoListTemplateId: 1, text: 'a', sortOrder: 0 },
          { todoListTemplateId: 1, text: 'b', sortOrder: 1 },
        ],
        { transaction: 'fake-transaction' },
      );
      expect(result.id).toBe(1);
    });

    test('creates successfully with no items', async () => {
      todoListTemplateRepository.create.mockResolvedValue({ id: 1 });
      todoListTemplateRepository.findByIdWithItems.mockResolvedValue({
        id: 1,
        items: [],
      });

      const result = await service.create({ name: 'Checklist' });

      expect(todoListTemplateItemRepository.bulkCreate).toHaveBeenCalledWith(
        [],
        {
          transaction: 'fake-transaction',
        },
      );
      expect(result.id).toBe(1);
    });
  });

  describe('update', () => {
    test('throws NotFoundError when the record does not exist', async () => {
      todoListTemplateRepository.findByIdWithItems.mockResolvedValue(null);

      await expect(service.update(999, { name: 'x' })).rejects.toThrow(
        NotFoundError,
      );
      expect(sequelize.transaction).not.toHaveBeenCalled();
    });

    test('replaces items and updates name inside one transaction', async () => {
      todoListTemplateRepository.findByIdWithItems
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce({
          id: 1,
          name: 'Renamed',
          items: [{ text: 'c' }],
        });

      const result = await service.update(1, {
        name: 'Renamed',
        items: [{ text: 'c' }],
      });

      expect(todoListTemplateRepository.update).toHaveBeenCalledWith(
        1,
        { name: 'Renamed' },
        { transaction: 'fake-transaction' },
      );
      expect(
        todoListTemplateItemRepository.deleteAllForList,
      ).toHaveBeenCalledWith(1, {
        transaction: 'fake-transaction',
      });
      expect(todoListTemplateItemRepository.bulkCreate).toHaveBeenCalledWith(
        [{ todoListTemplateId: 1, text: 'c', sortOrder: 0 }],
        { transaction: 'fake-transaction' },
      );
      expect(result.name).toBe('Renamed');
    });

    test('leaves items untouched when items is not provided', async () => {
      todoListTemplateRepository.findByIdWithItems.mockResolvedValue({ id: 1 });

      await service.update(1, { name: 'Renamed only' });

      expect(
        todoListTemplateItemRepository.deleteAllForList,
      ).not.toHaveBeenCalled();
      expect(todoListTemplateItemRepository.bulkCreate).not.toHaveBeenCalled();
    });

    test('replaces items without touching the template row when no name is given', async () => {
      todoListTemplateRepository.findByIdWithItems
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce({ id: 1, items: [{ text: 'c' }] });

      await service.update(1, { items: [{ text: 'c' }] });

      expect(todoListTemplateRepository.update).not.toHaveBeenCalled();
      expect(
        todoListTemplateItemRepository.deleteAllForList,
      ).toHaveBeenCalledWith(1, { transaction: 'fake-transaction' });
    });
  });

  describe('remove', () => {
    test('deletes after confirming the record exists', async () => {
      todoListTemplateRepository.findByIdWithItems.mockResolvedValue({ id: 1 });
      todoListTemplateRepository.delete.mockResolvedValue(1);

      const result = await service.remove(1);

      expect(todoListTemplateRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(1);
    });

    test('throws NotFoundError when the record does not exist', async () => {
      todoListTemplateRepository.findByIdWithItems.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundError);
      expect(todoListTemplateRepository.delete).not.toHaveBeenCalled();
    });
  });
});
