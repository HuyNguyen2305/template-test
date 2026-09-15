import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { PaymentTermTemplateService } from '#services/payment-term-template.service.js';
import { NotFoundError, ValidationError } from '#configs/error/index.js';

describe('PaymentTermTemplateService', () => {
  let paymentTermTemplateRepository;
  let taxRepository;
  let service;

  beforeEach(() => {
    paymentTermTemplateRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    taxRepository = {
      findById: jest.fn(),
    };
    service = new PaymentTermTemplateService({
      paymentTermTemplateRepository,
      taxRepository,
    });
  });

  describe('list', () => {
    test('delegates to the repository', async () => {
      paymentTermTemplateRepository.findAll.mockResolvedValue([{ id: 1 }]);

      const result = await service.list();

      expect(paymentTermTemplateRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('create', () => {
    test('auto-generates name when omitted', async () => {
      paymentTermTemplateRepository.create.mockImplementation((data) => ({
        id: 1,
        ...data,
      }));

      const result = await service.create({
        dueDateValue: 30,
        dueDateUnit: 'Days',
        lateFeeValue: 5,
        lateFeeUnit: '%',
      });

      expect(result.name).toBe(
        'Net 30, Due date: 30 days, Late payment fee 5%',
      );
    });

    test('auto-generates description when omitted', async () => {
      paymentTermTemplateRepository.create.mockImplementation((data) => ({
        id: 1,
        ...data,
      }));

      const result = await service.create({
        dueDateValue: 30,
        dueDateUnit: 'Days',
        lateFeeValue: 5,
        lateFeeUnit: '%',
      });

      expect(result.description).toBe(
        'Net 30 Terms: Payment is due within 30 days from the invoice date. Invoices that are not settled within this period will incur a late payment fee of 5%.',
      );
    });

    test('preserves a caller-supplied name', async () => {
      paymentTermTemplateRepository.create.mockImplementation((data) => ({
        id: 1,
        ...data,
      }));

      const result = await service.create({
        name: 'Custom name',
        dueDateValue: 30,
        dueDateUnit: 'Days',
        lateFeeValue: 5,
        lateFeeUnit: '%',
      });

      expect(result.name).toBe('Custom name');
    });

    test('preserves a caller-supplied description', async () => {
      paymentTermTemplateRepository.create.mockImplementation((data) => ({
        id: 1,
        ...data,
      }));

      const result = await service.create({
        name: 'Net 30',
        dueDateValue: 30,
        dueDateUnit: 'Days',
        lateFeeValue: 5,
        lateFeeUnit: '%',
        description: 'Custom text',
      });

      expect(result.description).toBe('Custom text');
    });

    test('validates tax1Id exists', async () => {
      taxRepository.findById.mockResolvedValue(null);

      await expect(
        service.create({
          name: 'Net 30',
          dueDateValue: 30,
          dueDateUnit: 'Days',
          lateFeeValue: 5,
          lateFeeUnit: '%',
          tax1Id: 99,
        }),
      ).rejects.toThrow(ValidationError);
      expect(paymentTermTemplateRepository.create).not.toHaveBeenCalled();
    });

    test('validates tax2Id exists', async () => {
      taxRepository.findById.mockResolvedValue(null);

      await expect(
        service.create({
          name: 'Net 30',
          dueDateValue: 30,
          dueDateUnit: 'Days',
          lateFeeValue: 5,
          lateFeeUnit: '%',
          tax2Id: 99,
        }),
      ).rejects.toThrow(ValidationError);
    });

    test('creates successfully when tax ids exist', async () => {
      taxRepository.findById.mockResolvedValue({ id: 1 });
      paymentTermTemplateRepository.create.mockImplementation((data) => ({
        id: 1,
        ...data,
      }));

      const result = await service.create({
        name: 'Net 30',
        dueDateValue: 30,
        dueDateUnit: 'Days',
        lateFeeValue: 5,
        lateFeeUnit: '%',
        tax1Id: 1,
      });

      expect(result.tax1Id).toBe(1);
    });

    test('includes the tax name in the generated summary/description when tax1Id is provided', async () => {
      taxRepository.findById.mockResolvedValue({ id: 1, name: 'Sales Tax' });
      paymentTermTemplateRepository.create.mockImplementation((data) => ({
        id: 1,
        ...data,
      }));

      const result = await service.create({
        dueDateValue: 30,
        dueDateUnit: 'Days',
        lateFeeValue: 5,
        lateFeeUnit: '%',
        tax1Id: 1,
      });

      expect(result.name).toBe(
        'Net 30, Due date: 30 days, Late payment fee 5% plus Sales Tax',
      );
      expect(result.description).toBe(
        'Net 30 Terms: Payment is due within 30 days from the invoice date. Invoices that are not settled within this period will incur a late payment fee of 5% plus applicable Sales Tax.',
      );
    });

    test('includes both tax names when tax1Id and tax2Id are both provided', async () => {
      taxRepository.findById.mockImplementation((id) =>
        id === 1 ? { id: 1, name: 'Sales Tax' } : { id: 2, name: 'City Tax' },
      );
      paymentTermTemplateRepository.create.mockImplementation((data) => ({
        id: 1,
        ...data,
      }));

      const result = await service.create({
        dueDateValue: 30,
        dueDateUnit: 'Days',
        lateFeeValue: 5,
        lateFeeUnit: '%',
        tax1Id: 1,
        tax2Id: 2,
      });

      expect(result.name).toBe(
        'Net 30, Due date: 30 days, Late payment fee 5% plus Sales Tax and City Tax',
      );
    });
  });

  describe('getById', () => {
    test('returns the payment term template when found', async () => {
      paymentTermTemplateRepository.findById.mockResolvedValue({ id: 1 });

      const result = await service.getById(1);

      expect(result).toEqual({ id: 1 });
    });

    test('throws NotFoundError when missing', async () => {
      paymentTermTemplateRepository.findById.mockResolvedValue(null);

      await expect(service.getById(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('update', () => {
    test('throws NotFoundError when missing', async () => {
      paymentTermTemplateRepository.findById.mockResolvedValue(null);

      await expect(service.update(999, { name: 'x' })).rejects.toThrow(
        NotFoundError,
      );
    });

    test('validates a provided tax id before updating', async () => {
      paymentTermTemplateRepository.findById.mockResolvedValue({
        id: 1,
        dueDateValue: 30,
        dueDateUnit: 'Days',
        lateFeeValue: 5,
        lateFeeUnit: '%',
      });
      taxRepository.findById.mockResolvedValue(null);

      await expect(service.update(1, { tax1Id: 99 })).rejects.toThrow(
        ValidationError,
      );
      expect(paymentTermTemplateRepository.update).not.toHaveBeenCalled();
    });

    test('re-generates name and description from current values when omitted', async () => {
      paymentTermTemplateRepository.findById.mockResolvedValue({
        id: 1,
        dueDateValue: 30,
        dueDateUnit: 'Days',
        lateFeeValue: 5,
        lateFeeUnit: '%',
      });
      paymentTermTemplateRepository.update.mockImplementation((id, data) => ({
        id,
        ...data,
      }));

      await service.update(1, { lateFeeValue: 10 });

      expect(paymentTermTemplateRepository.update).toHaveBeenCalledWith(1, {
        lateFeeValue: 10,
        name: 'Net 30, Due date: 30 days, Late payment fee 10%',
        description:
          'Net 30 Terms: Payment is due within 30 days from the invoice date. Invoices that are not settled within this period will incur a late payment fee of 10%.',
      });
    });

    test('re-generates name and description cleanly when current values are DB-formatted decimal strings', async () => {
      paymentTermTemplateRepository.findById.mockResolvedValue({
        id: 1,
        dueDateValue: '30.00',
        dueDateUnit: 'Days',
        lateFeeValue: '5.00',
        lateFeeUnit: '%',
      });
      paymentTermTemplateRepository.update.mockImplementation((id, data) => ({
        id,
        ...data,
      }));

      await service.update(1, { lateFeeValue: 8 });

      expect(paymentTermTemplateRepository.update).toHaveBeenCalledWith(1, {
        lateFeeValue: 8,
        name: 'Net 30, Due date: 30 days, Late payment fee 8%',
        description:
          'Net 30 Terms: Payment is due within 30 days from the invoice date. Invoices that are not settled within this period will incur a late payment fee of 8%.',
      });
    });

    test('preserves a caller-supplied name', async () => {
      paymentTermTemplateRepository.findById.mockResolvedValue({
        id: 1,
        dueDateValue: 30,
        dueDateUnit: 'Days',
        lateFeeValue: 5,
        lateFeeUnit: '%',
      });
      paymentTermTemplateRepository.update.mockImplementation((id, data) => ({
        id,
        ...data,
      }));

      await service.update(1, { name: 'Custom name' });

      expect(paymentTermTemplateRepository.update).toHaveBeenCalledWith(1, {
        name: 'Custom name',
        description:
          'Net 30 Terms: Payment is due within 30 days from the invoice date. Invoices that are not settled within this period will incur a late payment fee of 5%.',
      });
    });

    test('preserves a caller-supplied description', async () => {
      paymentTermTemplateRepository.findById.mockResolvedValue({
        id: 1,
        dueDateValue: 30,
        dueDateUnit: 'Days',
        lateFeeValue: 5,
        lateFeeUnit: '%',
      });
      paymentTermTemplateRepository.update.mockImplementation((id, data) => ({
        id,
        ...data,
      }));

      await service.update(1, { description: 'Custom text' });

      expect(paymentTermTemplateRepository.update).toHaveBeenCalledWith(1, {
        description: 'Custom text',
        name: 'Net 30, Due date: 30 days, Late payment fee 5%',
      });
    });

    test('regenerates the summary with the current tax name when tax fields are omitted', async () => {
      paymentTermTemplateRepository.findById.mockResolvedValue({
        id: 1,
        dueDateValue: 30,
        dueDateUnit: 'Days',
        lateFeeValue: 5,
        lateFeeUnit: '%',
        tax1Id: 1,
      });
      taxRepository.findById.mockResolvedValue({ id: 1, name: 'Sales Tax' });
      paymentTermTemplateRepository.update.mockImplementation((id, data) => ({
        id,
        ...data,
      }));

      await service.update(1, { lateFeeValue: 10 });

      expect(taxRepository.findById).toHaveBeenCalledWith(1);
      expect(paymentTermTemplateRepository.update).toHaveBeenCalledWith(1, {
        lateFeeValue: 10,
        name: 'Net 30, Due date: 30 days, Late payment fee 10% plus Sales Tax',
        description:
          'Net 30 Terms: Payment is due within 30 days from the invoice date. Invoices that are not settled within this period will incur a late payment fee of 10% plus applicable Sales Tax.',
      });
    });

    test('regenerates the summary with a new tax name when tax1Id is changed', async () => {
      paymentTermTemplateRepository.findById.mockResolvedValue({
        id: 1,
        dueDateValue: 30,
        dueDateUnit: 'Days',
        lateFeeValue: 5,
        lateFeeUnit: '%',
        tax1Id: 1,
      });
      taxRepository.findById.mockImplementation((id) =>
        id === 1 ? { id: 1, name: 'Sales Tax' } : { id: 2, name: 'City Tax' },
      );
      paymentTermTemplateRepository.update.mockImplementation((id, data) => ({
        id,
        ...data,
      }));

      await service.update(1, { tax1Id: 2 });

      expect(paymentTermTemplateRepository.update).toHaveBeenCalledWith(1, {
        tax1Id: 2,
        name: 'Net 30, Due date: 30 days, Late payment fee 5% plus City Tax',
        description:
          'Net 30 Terms: Payment is due within 30 days from the invoice date. Invoices that are not settled within this period will incur a late payment fee of 5% plus applicable City Tax.',
      });
    });

    test('drops the tax mention when tax1Id is cleared to null', async () => {
      paymentTermTemplateRepository.findById.mockResolvedValue({
        id: 1,
        dueDateValue: 30,
        dueDateUnit: 'Days',
        lateFeeValue: 5,
        lateFeeUnit: '%',
        tax1Id: 1,
      });
      paymentTermTemplateRepository.update.mockImplementation((id, data) => ({
        id,
        ...data,
      }));

      await service.update(1, { tax1Id: null });

      expect(taxRepository.findById).not.toHaveBeenCalled();
      expect(paymentTermTemplateRepository.update).toHaveBeenCalledWith(1, {
        tax1Id: null,
        name: 'Net 30, Due date: 30 days, Late payment fee 5%',
        description:
          'Net 30 Terms: Payment is due within 30 days from the invoice date. Invoices that are not settled within this period will incur a late payment fee of 5%.',
      });
    });
  });

  describe('remove', () => {
    test('deletes after confirming existence', async () => {
      paymentTermTemplateRepository.findById.mockResolvedValue({ id: 1 });
      paymentTermTemplateRepository.delete.mockResolvedValue(1);

      const result = await service.remove(1);

      expect(paymentTermTemplateRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(1);
    });

    test('throws NotFoundError when missing', async () => {
      paymentTermTemplateRepository.findById.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundError);
    });
  });
});
