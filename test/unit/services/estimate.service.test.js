import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { EstimateService } from '#services/estimate.service.js';
import { NotFoundError, ValidationError } from '#configs/error/index.js';

describe('EstimateService', () => {
  let sequelize;
  let jobRepository;
  let estimateRepository;
  let customerLineItemRepository;
  let taxRepository;
  let paymentTermTemplateRepository;
  let basicEstimateTemplateRepository;
  let noteRepository;
  let service;

  beforeEach(() => {
    sequelize = {
      transaction: jest.fn(async (callback) => callback('fake-transaction')),
    };
    jobRepository = { findById: jest.fn() };
    estimateRepository = {
      findByJobId: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    customerLineItemRepository = {
      findAllForParent: jest.fn().mockResolvedValue([]),
      deleteAllForParent: jest.fn(),
      bulkCreate: jest.fn(),
    };
    taxRepository = { findById: jest.fn() };
    paymentTermTemplateRepository = { findById: jest.fn() };
    basicEstimateTemplateRepository = { findByIdWithItems: jest.fn() };
    noteRepository = { deleteAllForParent: jest.fn() };
    service = new EstimateService({
      sequelize,
      jobRepository,
      estimateRepository,
      customerLineItemRepository,
      taxRepository,
      paymentTermTemplateRepository,
      basicEstimateTemplateRepository,
      noteRepository,
    });
  });

  describe('getByJobId', () => {
    test('throws NotFoundError when the job does not exist', async () => {
      jobRepository.findById.mockResolvedValue(null);

      await expect(service.getByJobId(999)).rejects.toThrow(NotFoundError);
    });

    test('throws NotFoundError when the job has no estimate', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      estimateRepository.findByJobId.mockResolvedValue(null);

      await expect(service.getByJobId(1)).rejects.toThrow(NotFoundError);
    });

    test('returns the estimate with its items attached', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      estimateRepository.findByJobId.mockResolvedValue({
        id: 10,
        estimateNumber: 'EST-1',
      });
      customerLineItemRepository.findAllForParent.mockResolvedValue([
        { id: 1, itemName: 'Labor' },
      ]);

      const result = await service.getByJobId(1);

      expect(customerLineItemRepository.findAllForParent).toHaveBeenCalledWith(
        'estimate',
        10,
      );
      expect(result).toEqual({
        id: 10,
        estimateNumber: 'EST-1',
        items: [{ id: 1, itemName: 'Labor' }],
      });
    });
  });

  describe('create', () => {
    test('throws NotFoundError when the job does not exist', async () => {
      jobRepository.findById.mockResolvedValue(null);

      await expect(
        service.create(999, { estimateNumber: 'EST-1' }),
      ).rejects.toThrow(NotFoundError);
    });

    test('throws ValidationError when the job already has an estimate', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      estimateRepository.findByJobId.mockResolvedValue({ id: 10 });

      await expect(
        service.create(1, { estimateNumber: 'EST-1' }),
      ).rejects.toThrow(ValidationError);
      expect(sequelize.transaction).not.toHaveBeenCalled();
    });

    test('creates with explicit fields, no template', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      estimateRepository.findByJobId.mockResolvedValue(null);
      estimateRepository.create.mockResolvedValue({ id: 10, jobId: 1 });

      await service.create(1, {
        estimateNumber: 'EST-1',
        discountValue: 10,
        items: [{ itemName: 'Labor', cost: 100 }],
      });

      expect(
        basicEstimateTemplateRepository.findByIdWithItems,
      ).not.toHaveBeenCalled();
      expect(estimateRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          jobId: 1,
          estimateNumber: 'EST-1',
          discountValue: 10,
        }),
        { transaction: 'fake-transaction' },
      );
      expect(estimateRepository.create.mock.calls[0][0]).not.toHaveProperty(
        'basicEstimateTemplateId',
      );
      expect(customerLineItemRepository.bulkCreate).toHaveBeenCalledWith(
        [
          {
            itemName: 'Labor',
            cost: 100,
            taxSlots: [],
            subtotal: 100,
            total: 100,
            parentType: 'estimate',
            parentId: 10,
            sortOrder: 0,
          },
        ],
        { transaction: 'fake-transaction' },
      );
    });

    test('throws ValidationError when basicEstimateTemplateId does not exist', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      estimateRepository.findByJobId.mockResolvedValue(null);
      basicEstimateTemplateRepository.findByIdWithItems.mockResolvedValue(null);

      await expect(
        service.create(1, {
          estimateNumber: 'EST-1',
          basicEstimateTemplateId: 999,
        }),
      ).rejects.toThrow(ValidationError);
    });

    test('seeds items, discount, deposit and terms from the template when omitted', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      estimateRepository.findByJobId.mockResolvedValue(null);
      basicEstimateTemplateRepository.findByIdWithItems.mockResolvedValue({
        id: 5,
        discountValue: 15,
        discountType: '%',
        depositValue: 20,
        depositType: '%',
        terms: 'Template terms',
        items: [
          {
            id: 1,
            serviceName: 'Labor',
            description: 'Weekly labor charge',
            cost: 100,
            qty: 1,
            tax1Id: null,
            tax2Id: null,
          },
        ],
      });
      estimateRepository.create.mockResolvedValue({ id: 10 });

      await service.create(1, {
        estimateNumber: 'EST-1',
        basicEstimateTemplateId: 5,
      });

      expect(estimateRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          discountValue: 15,
          discountType: '%',
          depositValue: 20,
          depositType: '%',
          terms: 'Template terms',
        }),
        { transaction: 'fake-transaction' },
      );
      expect(customerLineItemRepository.bulkCreate).toHaveBeenCalledWith(
        [
          {
            itemName: 'Labor',
            description: 'Weekly labor charge',
            cost: 100,
            qty: 1,
            taxSlots: [],
            subtotal: 100,
            total: 100,
            parentType: 'estimate',
            parentId: 10,
            sortOrder: 0,
          },
        ],
        { transaction: 'fake-transaction' },
      );
    });

    test('explicit items win over template items', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      estimateRepository.findByJobId.mockResolvedValue(null);
      basicEstimateTemplateRepository.findByIdWithItems.mockResolvedValue({
        id: 5,
        items: [{ id: 1, serviceName: 'Template item', cost: 1, qty: 1 }],
      });
      estimateRepository.create.mockResolvedValue({ id: 10 });

      await service.create(1, {
        estimateNumber: 'EST-1',
        basicEstimateTemplateId: 5,
        items: [{ itemName: 'Explicit item', cost: 50 }],
      });

      expect(customerLineItemRepository.bulkCreate).toHaveBeenCalledWith(
        [
          {
            itemName: 'Explicit item',
            cost: 50,
            taxSlots: [],
            subtotal: 50,
            total: 50,
            parentType: 'estimate',
            parentId: 10,
            sortOrder: 0,
          },
        ],
        { transaction: 'fake-transaction' },
      );
    });

    test('explicit discountValue wins over template discountValue', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      estimateRepository.findByJobId.mockResolvedValue(null);
      basicEstimateTemplateRepository.findByIdWithItems.mockResolvedValue({
        id: 5,
        discountValue: 15,
        items: [],
      });
      estimateRepository.create.mockResolvedValue({ id: 10 });

      await service.create(1, {
        estimateNumber: 'EST-1',
        basicEstimateTemplateId: 5,
        discountValue: 5,
      });

      expect(estimateRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ discountValue: 5 }),
        { transaction: 'fake-transaction' },
      );
    });

    test('passes an explicit status through to the created row', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      estimateRepository.findByJobId.mockResolvedValue(null);
      estimateRepository.create.mockResolvedValue({ id: 10 });

      await service.create(1, { estimateNumber: 'EST-1', status: 'Won' });

      expect(estimateRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'Won' }),
        { transaction: 'fake-transaction' },
      );
    });

    test('throws ValidationError when an item tax id does not exist', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      estimateRepository.findByJobId.mockResolvedValue(null);
      taxRepository.findById.mockResolvedValue(null);

      await expect(
        service.create(1, {
          estimateNumber: 'EST-1',
          items: [{ itemName: 'Labor', cost: 100, tax1Id: 99 }],
        }),
      ).rejects.toThrow(ValidationError);
      expect(sequelize.transaction).not.toHaveBeenCalled();
    });

    test('snapshots tax name/rate onto the item and computes subtotal/total', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      estimateRepository.findByJobId.mockResolvedValue(null);
      estimateRepository.create.mockResolvedValue({ id: 10 });
      taxRepository.findById.mockImplementation(async (id) => {
        if (id === 1) return { id: 1, name: 'VAT', rate: 10 };
        if (id === 2) return { id: 2, name: 'City Tax', rate: 5 };
        return null;
      });

      await service.create(1, {
        estimateNumber: 'EST-1',
        items: [{ itemName: 'Labor', cost: 100, qty: 2, tax1Id: 1, tax2Id: 2 }],
      });

      expect(customerLineItemRepository.bulkCreate).toHaveBeenCalledWith(
        [
          {
            itemName: 'Labor',
            cost: 100,
            qty: 2,
            taxSlots: [
              { taxId: 1, name: 'VAT', rate: 10 },
              { taxId: 2, name: 'City Tax', rate: 5 },
            ],
            subtotal: 200,
            total: 230,
            parentType: 'estimate',
            parentId: 10,
            sortOrder: 0,
          },
        ],
        { transaction: 'fake-transaction' },
      );
    });

    test('resolves terms from termsSourceTemplateId over the basic estimate template', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      estimateRepository.findByJobId.mockResolvedValue(null);
      basicEstimateTemplateRepository.findByIdWithItems.mockResolvedValue({
        id: 5,
        terms: 'Template terms',
        items: [],
      });
      paymentTermTemplateRepository.findById.mockResolvedValue({
        id: 7,
        description: 'Net 30',
      });
      estimateRepository.create.mockResolvedValue({ id: 10 });

      await service.create(1, {
        estimateNumber: 'EST-1',
        basicEstimateTemplateId: 5,
        termsSourceTemplateId: 7,
      });

      expect(estimateRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ terms: 'Net 30' }),
        { transaction: 'fake-transaction' },
      );
    });
  });

  describe('update', () => {
    test('throws NotFoundError when the job has no estimate', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      estimateRepository.findByJobId.mockResolvedValue(null);

      await expect(service.update(1, { poNumber: 'PO-1' })).rejects.toThrow(
        NotFoundError,
      );
    });

    test('updates only provided fields, leaving items untouched', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      estimateRepository.findByJobId.mockResolvedValue({ id: 10 });
      estimateRepository.findById.mockResolvedValue({ id: 10 });

      await service.update(1, { poNumber: 'PO-2' });

      expect(estimateRepository.update).toHaveBeenCalledWith(
        10,
        { poNumber: 'PO-2' },
        { transaction: 'fake-transaction' },
      );
      expect(
        customerLineItemRepository.deleteAllForParent,
      ).not.toHaveBeenCalled();
    });

    test('replaces items when provided', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      estimateRepository.findByJobId.mockResolvedValue({ id: 10 });
      estimateRepository.findById.mockResolvedValue({ id: 10 });

      await service.update(1, {
        items: [{ itemName: 'New item', cost: 50 }],
      });

      expect(
        customerLineItemRepository.deleteAllForParent,
      ).toHaveBeenCalledWith('estimate', 10, {
        transaction: 'fake-transaction',
      });
      expect(customerLineItemRepository.bulkCreate).toHaveBeenCalledWith(
        [
          {
            itemName: 'New item',
            cost: 50,
            taxSlots: [],
            subtotal: 50,
            total: 50,
            parentType: 'estimate',
            parentId: 10,
            sortOrder: 0,
          },
        ],
        { transaction: 'fake-transaction' },
      );
    });

    test('throws ValidationError when a replacement item tax id does not exist', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      estimateRepository.findByJobId.mockResolvedValue({ id: 10 });
      taxRepository.findById.mockResolvedValue(null);

      await expect(
        service.update(1, {
          items: [{ itemName: 'X', cost: 1, tax1Id: 99 }],
        }),
      ).rejects.toThrow(ValidationError);
      expect(sequelize.transaction).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    test('deletes line items before deleting the estimate, in one transaction', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      estimateRepository.findByJobId.mockResolvedValue({ id: 10 });
      estimateRepository.delete.mockResolvedValue(1);

      const result = await service.remove(1);

      expect(
        customerLineItemRepository.deleteAllForParent,
      ).toHaveBeenCalledWith('estimate', 10, {
        transaction: 'fake-transaction',
      });
      expect(noteRepository.deleteAllForParent).toHaveBeenCalledWith(
        'Estimate',
        10,
        { transaction: 'fake-transaction' },
      );
      expect(estimateRepository.delete).toHaveBeenCalledWith(10, {
        transaction: 'fake-transaction',
      });
      expect(result).toBe(1);
    });

    test('throws NotFoundError when the job has no estimate', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      estimateRepository.findByJobId.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundError);
    });
  });
});
