import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { NoteService } from '#services/note.service.js';
import { NotFoundError, ValidationError } from '#configs/error/index.js';

describe('NoteService', () => {
  let jobRepository;
  let invoiceRepository;
  let estimateRepository;
  let noteRepository;
  let noteTemplateRepository;
  let service;

  beforeEach(() => {
    jobRepository = { findById: jest.fn() };
    invoiceRepository = { findByJobId: jest.fn() };
    estimateRepository = { findByJobId: jest.fn() };
    noteRepository = {
      findAllForParent: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    };
    noteTemplateRepository = { findById: jest.fn() };
    service = new NoteService({
      jobRepository,
      invoiceRepository,
      estimateRepository,
      noteRepository,
      noteTemplateRepository,
    });
  });

  describe('resolveJobParent', () => {
    test('throws NotFoundError when the job does not exist', async () => {
      jobRepository.findById.mockResolvedValue(null);

      await expect(service.resolveJobParent(999)).rejects.toThrow(
        NotFoundError,
      );
    });

    test('returns the Job type and stringified id', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });

      const result = await service.resolveJobParent(1);

      expect(result).toEqual({ type: 'Job', parentId: '1' });
    });
  });

  describe('resolveInvoiceParent', () => {
    test('throws NotFoundError when the job does not exist', async () => {
      jobRepository.findById.mockResolvedValue(null);

      await expect(service.resolveInvoiceParent(999)).rejects.toThrow(
        NotFoundError,
      );
    });

    test('throws NotFoundError when the job has no invoice', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      invoiceRepository.findByJobId.mockResolvedValue(null);

      await expect(service.resolveInvoiceParent(1)).rejects.toThrow(
        NotFoundError,
      );
    });

    test('returns the Invoice type and stringified invoice id', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      invoiceRepository.findByJobId.mockResolvedValue({ id: 10 });

      const result = await service.resolveInvoiceParent(1);

      expect(result).toEqual({ type: 'Invoice', parentId: '10' });
    });
  });

  describe('resolveEstimateParent', () => {
    test('throws NotFoundError when the job has no estimate', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      estimateRepository.findByJobId.mockResolvedValue(null);

      await expect(service.resolveEstimateParent(1)).rejects.toThrow(
        NotFoundError,
      );
    });

    test('returns the Estimate type and stringified estimate id', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      estimateRepository.findByJobId.mockResolvedValue({ id: 20 });

      const result = await service.resolveEstimateParent(1);

      expect(result).toEqual({ type: 'Estimate', parentId: '20' });
    });
  });

  describe('resolveBody', () => {
    test('throws ValidationError when neither body nor sourceTemplateId is given', async () => {
      await expect(service.resolveBody({}, 'Job')).rejects.toThrow(
        ValidationError,
      );
    });

    test('explicit body wins over sourceTemplateId', async () => {
      const result = await service.resolveBody(
        { body: 'Manual text', sourceTemplateId: 5 },
        'Job',
      );

      expect(noteTemplateRepository.findById).not.toHaveBeenCalled();
      expect(result).toBe('Manual text');
    });

    test('seeds body from the source template when body is omitted', async () => {
      noteTemplateRepository.findById.mockResolvedValue({
        id: 5,
        typeKey: 'Job',
        body: 'Template body',
      });

      const result = await service.resolveBody({ sourceTemplateId: 5 }, 'Job');

      expect(result).toBe('Template body');
    });

    test('throws ValidationError when the source template does not exist', async () => {
      noteTemplateRepository.findById.mockResolvedValue(null);

      await expect(
        service.resolveBody({ sourceTemplateId: 999 }, 'Job'),
      ).rejects.toThrow(ValidationError);
    });

    test('throws ValidationError when the source template category does not match', async () => {
      noteTemplateRepository.findById.mockResolvedValue({
        id: 5,
        typeKey: 'Customer',
        body: 'Template body',
      });

      await expect(
        service.resolveBody({ sourceTemplateId: 5 }, 'Job'),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('listForJob / listForInvoice / listForEstimate', () => {
    test('listForJob resolves the job and lists its notes', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      noteRepository.findAllForParent.mockResolvedValue([{ id: 1 }]);

      const result = await service.listForJob(1);

      expect(noteRepository.findAllForParent).toHaveBeenCalledWith('Job', '1');
      expect(result).toEqual([{ id: 1 }]);
    });

    test('listForInvoice resolves the invoice and lists its notes', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      invoiceRepository.findByJobId.mockResolvedValue({ id: 10 });
      noteRepository.findAllForParent.mockResolvedValue([{ id: 2 }]);

      const result = await service.listForInvoice(1);

      expect(noteRepository.findAllForParent).toHaveBeenCalledWith(
        'Invoice',
        '10',
      );
      expect(result).toEqual([{ id: 2 }]);
    });

    test('listForEstimate resolves the estimate and lists its notes', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      estimateRepository.findByJobId.mockResolvedValue({ id: 20 });
      noteRepository.findAllForParent.mockResolvedValue([{ id: 3 }]);

      const result = await service.listForEstimate(1);

      expect(noteRepository.findAllForParent).toHaveBeenCalledWith(
        'Estimate',
        '20',
      );
      expect(result).toEqual([{ id: 3 }]);
    });
  });

  describe('createForJob / createForInvoice / createForEstimate', () => {
    test('createForJob creates a Job note', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      noteRepository.create.mockResolvedValue({ id: 1 });

      await service.createForJob(1, { body: 'text' });

      expect(noteRepository.create).toHaveBeenCalledWith({
        parentId: '1',
        type: 'Job',
        body: 'text',
        authorUserId: null,
      });
    });

    test('createForInvoice creates an Invoice note', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      invoiceRepository.findByJobId.mockResolvedValue({ id: 10 });
      noteRepository.create.mockResolvedValue({ id: 1 });

      await service.createForInvoice(1, { body: 'text', authorUserId: 3 });

      expect(noteRepository.create).toHaveBeenCalledWith({
        parentId: '10',
        type: 'Invoice',
        body: 'text',
        authorUserId: 3,
      });
    });

    test('createForEstimate creates an Estimate note', async () => {
      jobRepository.findById.mockResolvedValue({ id: 1 });
      estimateRepository.findByJobId.mockResolvedValue({ id: 20 });
      noteRepository.create.mockResolvedValue({ id: 1 });

      await service.createForEstimate(1, { body: 'text' });

      expect(noteRepository.create).toHaveBeenCalledWith({
        parentId: '20',
        type: 'Estimate',
        body: 'text',
        authorUserId: null,
      });
    });
  });

  describe('remove', () => {
    test('deletes an existing note', async () => {
      noteRepository.findById.mockResolvedValue({ id: 7 });
      noteRepository.delete.mockResolvedValue(1);

      const result = await service.remove(7);

      expect(noteRepository.delete).toHaveBeenCalledWith(7);
      expect(result).toBe(1);
    });

    test('throws NotFoundError when the note does not exist', async () => {
      noteRepository.findById.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundError);
      expect(noteRepository.delete).not.toHaveBeenCalled();
    });
  });
});
