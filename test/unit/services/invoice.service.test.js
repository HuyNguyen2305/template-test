import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { InvoiceService } from '#services/invoice.service.js';
import { NotFoundError, ValidationError } from '#configs/error/index.js';

describe('InvoiceService', () => {
  let sequelize;
  let jobRepository;
  let invoiceRepository;
  let customerLineItemRepository;
  let taxRepository;
  let paymentTermTemplateRepository;
  let noteRepository;
  let service;

  beforeEach(() => {
    sequelize = {
      transaction: jest.fn(async (callback) => callback('fake-transaction')),
    };
    jobRepository = { findById: jest.fn() };
    invoiceRepository = {
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
    noteRepository = { deleteAllForParent: jest.fn() };
    service = new InvoiceService({
      sequelize,
      jobRepository,
      invoiceRepository,
      customerLineItemRepository,
      taxRepository,
      paymentTermTemplateRepository,
      noteRepository,
    });
  });

  describe('getByJobId', () => {
    test('throws NotFoundError when the job does not exist', async () => {
      jobRepository.findById.mockResolvedValue(null);

      await expect(service.getByJobId(999)).rejects.toThrow(NotFoundError);
    });

    test('throws NotFoundError when the job has no invoice', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      invoiceRepository.findByJobId.mockResolvedValue(null);

      await expect(service.getByJobId(1)).rejects.toThrow(NotFoundError);
    });

    test('returns the invoice with its items attached', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      invoiceRepository.findByJobId.mockResolvedValue({
        id: 10,
        invoiceNumber: 'INV-1',
      });
      customerLineItemRepository.findAllForParent.mockResolvedValue([
        { id: 1, itemName: 'Labor' },
      ]);

      const result = await service.getByJobId(1);

      expect(customerLineItemRepository.findAllForParent).toHaveBeenCalledWith(
        'invoice',
        10,
      );
      expect(result).toEqual({
        id: 10,
        invoiceNumber: 'INV-1',
        items: [{ id: 1, itemName: 'Labor' }],
      });
    });
  });

  describe('create', () => {
    test('throws NotFoundError when the job does not exist', async () => {
      jobRepository.findById.mockResolvedValue(null);

      await expect(
        service.create(999, { invoiceNumber: 'INV-1' }),
      ).rejects.toThrow(NotFoundError);
    });

    test('throws ValidationError when the job already has an invoice', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      invoiceRepository.findByJobId.mockResolvedValue({ id: 10 });

      await expect(
        service.create(1, { invoiceNumber: 'INV-1' }),
      ).rejects.toThrow(ValidationError);
      expect(sequelize.transaction).not.toHaveBeenCalled();
    });

    test('creates the invoice and its line items in one transaction', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      invoiceRepository.findByJobId.mockResolvedValue(null);
      invoiceRepository.create.mockResolvedValue({ id: 10, jobId: 1 });
      customerLineItemRepository.findAllForParent.mockResolvedValue([
        { id: 1, itemName: 'Labor' },
      ]);

      const result = await service.create(1, {
        invoiceNumber: 'INV-1',
        items: [{ itemName: 'Labor', description: 'Weekly labor', cost: 100 }],
      });

      expect(sequelize.transaction).toHaveBeenCalled();
      expect(invoiceRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ jobId: 1, invoiceNumber: 'INV-1' }),
        { transaction: 'fake-transaction' },
      );
      expect(customerLineItemRepository.bulkCreate).toHaveBeenCalledWith(
        [
          {
            itemName: 'Labor',
            description: 'Weekly labor',
            cost: 100,
            taxSlots: [],
            subtotal: 100,
            total: 100,
            parentType: 'invoice',
            parentId: 10,
            sortOrder: 0,
          },
        ],
        { transaction: 'fake-transaction' },
      );
      expect(result).toEqual({
        id: 10,
        jobId: 1,
        items: [{ id: 1, itemName: 'Labor' }],
      });
    });

    test('throws ValidationError when an item tax id does not exist', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      invoiceRepository.findByJobId.mockResolvedValue(null);
      taxRepository.findById.mockResolvedValue(null);

      await expect(
        service.create(1, {
          invoiceNumber: 'INV-1',
          items: [{ itemName: 'Labor', cost: 100, tax1Id: 99 }],
        }),
      ).rejects.toThrow(ValidationError);
      expect(sequelize.transaction).not.toHaveBeenCalled();
    });

    test('snapshots tax name/rate onto the item and computes subtotal/total', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      invoiceRepository.findByJobId.mockResolvedValue(null);
      invoiceRepository.create.mockResolvedValue({ id: 10 });
      taxRepository.findById.mockImplementation(async (id) => {
        if (id === 1) return { id: 1, name: 'VAT', rate: 10 };
        if (id === 2) return { id: 2, name: 'City Tax', rate: 5 };
        return null;
      });

      await service.create(1, {
        invoiceNumber: 'INV-1',
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
            parentType: 'invoice',
            parentId: 10,
            sortOrder: 0,
          },
        ],
        { transaction: 'fake-transaction' },
      );
    });

    test('drops oneTime from the item before persisting', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      invoiceRepository.findByJobId.mockResolvedValue(null);
      invoiceRepository.create.mockResolvedValue({ id: 10 });

      await service.create(1, {
        invoiceNumber: 'INV-1',
        items: [{ itemName: 'Labor', cost: 100, oneTime: true }],
      });

      expect(
        customerLineItemRepository.bulkCreate.mock.calls[0][0][0],
      ).not.toHaveProperty('oneTime');
    });

    test('resolves terms from termsSourceTemplateId when terms is omitted', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      invoiceRepository.findByJobId.mockResolvedValue(null);
      paymentTermTemplateRepository.findById.mockResolvedValue({
        id: 5,
        description: 'Net 30',
      });
      invoiceRepository.create.mockResolvedValue({ id: 10 });

      await service.create(1, {
        invoiceNumber: 'INV-1',
        termsSourceTemplateId: 5,
      });

      expect(invoiceRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ terms: 'Net 30' }),
        { transaction: 'fake-transaction' },
      );
    });

    test('throws ValidationError when termsSourceTemplateId does not exist', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      invoiceRepository.findByJobId.mockResolvedValue(null);
      paymentTermTemplateRepository.findById.mockResolvedValue(null);

      await expect(
        service.create(1, {
          invoiceNumber: 'INV-1',
          termsSourceTemplateId: 999,
        }),
      ).rejects.toThrow(ValidationError);
    });

    test('passes explicit status and amountPaid through to the created row', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      invoiceRepository.findByJobId.mockResolvedValue(null);
      invoiceRepository.create.mockResolvedValue({ id: 10 });

      await service.create(1, {
        invoiceNumber: 'INV-1',
        status: 'Sent',
        amountPaid: 50,
      });

      expect(invoiceRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'Sent', amountPaid: 50 }),
        { transaction: 'fake-transaction' },
      );
    });
  });

  describe('update', () => {
    test('throws NotFoundError when the job does not exist', async () => {
      jobRepository.findById.mockResolvedValue(null);

      await expect(service.update(999, { poNumber: 'PO-1' })).rejects.toThrow(
        NotFoundError,
      );
    });

    test('throws NotFoundError when the job has no invoice', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      invoiceRepository.findByJobId.mockResolvedValue(null);

      await expect(service.update(1, { poNumber: 'PO-1' })).rejects.toThrow(
        NotFoundError,
      );
    });

    test('updates only provided fields, leaving terms/items untouched', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      invoiceRepository.findByJobId.mockResolvedValue({ id: 10 });
      invoiceRepository.findById.mockResolvedValue({
        id: 10,
        poNumber: 'PO-2',
      });

      await service.update(1, { poNumber: 'PO-2' });

      expect(invoiceRepository.update).toHaveBeenCalledWith(
        10,
        { poNumber: 'PO-2' },
        { transaction: 'fake-transaction' },
      );
      expect(
        customerLineItemRepository.deleteAllForParent,
      ).not.toHaveBeenCalled();
      expect(customerLineItemRepository.bulkCreate).not.toHaveBeenCalled();
    });

    test('re-resolves terms only when terms keys are present', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      invoiceRepository.findByJobId.mockResolvedValue({ id: 10 });
      paymentTermTemplateRepository.findById.mockResolvedValue({
        id: 5,
        description: 'Net 15',
      });
      invoiceRepository.findById.mockResolvedValue({ id: 10 });

      await service.update(1, { termsSourceTemplateId: 5 });

      expect(invoiceRepository.update).toHaveBeenCalledWith(
        10,
        { termsSourceTemplateId: 5, terms: 'Net 15' },
        { transaction: 'fake-transaction' },
      );
    });

    test('replaces items when provided', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      invoiceRepository.findByJobId.mockResolvedValue({ id: 10 });
      invoiceRepository.findById.mockResolvedValue({ id: 10 });

      await service.update(1, {
        items: [{ itemName: 'New item', cost: 50 }],
      });

      expect(
        customerLineItemRepository.deleteAllForParent,
      ).toHaveBeenCalledWith('invoice', 10, {
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
            parentType: 'invoice',
            parentId: 10,
            sortOrder: 0,
          },
        ],
        { transaction: 'fake-transaction' },
      );
    });

    test('throws ValidationError when a replacement item tax id does not exist', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      invoiceRepository.findByJobId.mockResolvedValue({ id: 10 });
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
    test('throws NotFoundError when the job does not exist', async () => {
      jobRepository.findById.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundError);
    });

    test('throws NotFoundError when the job has no invoice', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      invoiceRepository.findByJobId.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundError);
    });

    test('deletes line items before deleting the invoice, in one transaction', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      invoiceRepository.findByJobId.mockResolvedValue({ id: 10 });
      invoiceRepository.delete.mockResolvedValue(1);

      const result = await service.remove(1);

      expect(
        customerLineItemRepository.deleteAllForParent,
      ).toHaveBeenCalledWith('invoice', 10, {
        transaction: 'fake-transaction',
      });
      expect(noteRepository.deleteAllForParent).toHaveBeenCalledWith(
        'Invoice',
        10,
        { transaction: 'fake-transaction' },
      );
      expect(invoiceRepository.delete).toHaveBeenCalledWith(10, {
        transaction: 'fake-transaction',
      });
      expect(result).toBe(1);
    });
  });
});
