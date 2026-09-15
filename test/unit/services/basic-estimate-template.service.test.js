import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { BasicEstimateTemplateService } from '#services/basic-estimate-template.service.js';
import { NotFoundError, ValidationError } from '#configs/error/index.js';

describe('BasicEstimateTemplateService', () => {
  let sequelize;
  let basicEstimateTemplateRepository;
  let basicEstimateTemplateItemRepository;
  let taxRepository;
  let service;

  beforeEach(() => {
    sequelize = {
      transaction: jest.fn(async (callback) => callback('fake-transaction')),
    };
    basicEstimateTemplateRepository = {
      findAllWithItems: jest.fn(),
      findByIdWithItems: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    basicEstimateTemplateItemRepository = {
      deleteAllForTemplate: jest.fn(),
      bulkCreate: jest.fn(),
    };
    taxRepository = {
      findById: jest.fn(),
    };
    service = new BasicEstimateTemplateService({
      sequelize,
      basicEstimateTemplateRepository,
      basicEstimateTemplateItemRepository,
      taxRepository,
    });
  });

  describe('list', () => {
    test('delegates to findAllWithItems', async () => {
      basicEstimateTemplateRepository.findAllWithItems.mockResolvedValue([
        { id: 1 },
      ]);

      const result = await service.list();

      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('getById', () => {
    test('throws NotFoundError when missing', async () => {
      basicEstimateTemplateRepository.findByIdWithItems.mockResolvedValue(null);

      await expect(service.getById(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    test('creates the template and bulk-creates items in one transaction', async () => {
      basicEstimateTemplateRepository.create.mockResolvedValue({ id: 1 });
      basicEstimateTemplateRepository.findByIdWithItems.mockResolvedValue({
        id: 1,
        items: [{ serviceName: 'Labor' }],
      });

      const result = await service.create({
        name: 'Basic Estimate',
        items: [
          { serviceName: 'Labor', description: 'Weekly labor', cost: 100 },
        ],
      });

      expect(sequelize.transaction).toHaveBeenCalled();
      expect(basicEstimateTemplateRepository.create).toHaveBeenCalledWith(
        { name: 'Basic Estimate' },
        { transaction: 'fake-transaction' },
      );
      expect(
        basicEstimateTemplateItemRepository.bulkCreate,
      ).toHaveBeenCalledWith(
        [
          {
            serviceName: 'Labor',
            description: 'Weekly labor',
            cost: 100,
            basicEstimateTemplateId: 1,
          },
        ],
        { transaction: 'fake-transaction' },
      );
      expect(result.id).toBe(1);
    });

    test('validates tax1Id/tax2Id on every item', async () => {
      taxRepository.findById.mockResolvedValue(null);

      await expect(
        service.create({
          name: 'Basic Estimate',
          items: [{ serviceName: 'Labor', cost: 100, tax1Id: 99 }],
        }),
      ).rejects.toThrow(ValidationError);
      expect(basicEstimateTemplateRepository.create).not.toHaveBeenCalled();
    });

    test('validates tax2Id on a later item in the array', async () => {
      taxRepository.findById.mockImplementation((id) =>
        id === 1 ? Promise.resolve({ id: 1 }) : Promise.resolve(null),
      );

      await expect(
        service.create({
          name: 'Basic Estimate',
          items: [
            { serviceName: 'Labor', cost: 100, tax1Id: 1 },
            { serviceName: 'Parts', cost: 50, tax2Id: 99 },
          ],
        }),
      ).rejects.toThrow(ValidationError);
    });

    test('creates successfully with no items', async () => {
      basicEstimateTemplateRepository.create.mockResolvedValue({ id: 1 });
      basicEstimateTemplateRepository.findByIdWithItems.mockResolvedValue({
        id: 1,
        items: [],
      });

      const result = await service.create({ name: 'Basic Estimate' });

      expect(
        basicEstimateTemplateItemRepository.bulkCreate,
      ).toHaveBeenCalledWith([], {
        transaction: 'fake-transaction',
      });
      expect(result.id).toBe(1);
    });
  });

  describe('update', () => {
    test('throws NotFoundError when missing', async () => {
      basicEstimateTemplateRepository.findByIdWithItems.mockResolvedValue(null);

      await expect(service.update(999, { name: 'x' })).rejects.toThrow(
        NotFoundError,
      );
      expect(sequelize.transaction).not.toHaveBeenCalled();
    });

    test('replaces items and updates fields inside one transaction', async () => {
      basicEstimateTemplateRepository.findByIdWithItems
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce({
          id: 1,
          name: 'Renamed',
          items: [{ serviceName: 'New' }],
        });

      const result = await service.update(1, {
        name: 'Renamed',
        items: [{ serviceName: 'New', cost: 20 }],
      });

      expect(basicEstimateTemplateRepository.update).toHaveBeenCalledWith(
        1,
        { name: 'Renamed' },
        { transaction: 'fake-transaction' },
      );
      expect(
        basicEstimateTemplateItemRepository.deleteAllForTemplate,
      ).toHaveBeenCalledWith(1, {
        transaction: 'fake-transaction',
      });
      expect(
        basicEstimateTemplateItemRepository.bulkCreate,
      ).toHaveBeenCalledWith(
        [{ serviceName: 'New', cost: 20, basicEstimateTemplateId: 1 }],
        { transaction: 'fake-transaction' },
      );
      expect(result.name).toBe('Renamed');
    });

    test('leaves items untouched when items is not provided', async () => {
      basicEstimateTemplateRepository.findByIdWithItems.mockResolvedValue({
        id: 1,
      });

      await service.update(1, { name: 'Renamed only' });

      expect(
        basicEstimateTemplateItemRepository.deleteAllForTemplate,
      ).not.toHaveBeenCalled();
      expect(
        basicEstimateTemplateItemRepository.bulkCreate,
      ).not.toHaveBeenCalled();
    });

    test('replaces items without touching the template row when no other fields are given', async () => {
      basicEstimateTemplateRepository.findByIdWithItems
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce({ id: 1, items: [{ serviceName: 'New' }] });

      await service.update(1, {
        items: [{ serviceName: 'New', cost: 20 }],
      });

      expect(basicEstimateTemplateRepository.update).not.toHaveBeenCalled();
      expect(
        basicEstimateTemplateItemRepository.deleteAllForTemplate,
      ).toHaveBeenCalledWith(1, { transaction: 'fake-transaction' });
    });

    test('validates a provided item tax id before updating', async () => {
      basicEstimateTemplateRepository.findByIdWithItems.mockResolvedValue({
        id: 1,
      });
      taxRepository.findById.mockResolvedValue(null);

      await expect(
        service.update(1, {
          items: [{ serviceName: 'x', cost: 1, tax1Id: 99 }],
        }),
      ).rejects.toThrow(ValidationError);
      expect(basicEstimateTemplateRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    test('deletes after confirming existence', async () => {
      basicEstimateTemplateRepository.findByIdWithItems.mockResolvedValue({
        id: 1,
      });
      basicEstimateTemplateRepository.delete.mockResolvedValue(1);

      const result = await service.remove(1);

      expect(basicEstimateTemplateRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(1);
    });

    test('throws NotFoundError when missing', async () => {
      basicEstimateTemplateRepository.findByIdWithItems.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundError);
    });
  });
});
