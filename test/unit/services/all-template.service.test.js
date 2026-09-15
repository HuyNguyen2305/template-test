import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { AllTemplateService } from '#services/all-template.service.js';
import { NotFoundError, ValidationError } from '#configs/error/index.js';

describe('AllTemplateService', () => {
  let allTemplateRepository;
  let noteTemplateRepository;
  let paymentTermTemplateRepository;
  let service;

  beforeEach(() => {
    allTemplateRepository = {
      search: jest.fn(),
    };
    noteTemplateRepository = {
      findById: jest.fn(),
    };
    paymentTermTemplateRepository = {
      findById: jest.fn(),
    };
    service = new AllTemplateService({
      allTemplateRepository,
      noteTemplateRepository,
      paymentTermTemplateRepository,
    });
  });

  describe('list', () => {
    test('delegates to the repository search', async () => {
      allTemplateRepository.search.mockResolvedValue([{ id: 1 }]);

      const result = await service.list({
        category: 'Payment Terms',
        query: 'net',
      });

      expect(allTemplateRepository.search).toHaveBeenCalledWith({
        category: 'Payment Terms',
        query: 'net',
      });
      expect(result).toEqual([{ id: 1 }]);
    });

    test('delegates to the repository search with no filters when called with nothing', async () => {
      allTemplateRepository.search.mockResolvedValue([{ id: 1 }]);

      const result = await service.list();

      expect(allTemplateRepository.search).toHaveBeenCalledWith({
        category: undefined,
        query: undefined,
      });
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('getContent', () => {
    test('returns body for a NoteTemplate', async () => {
      noteTemplateRepository.findById.mockResolvedValue({
        id: 1,
        name: 'Customer Note #1',
        body: 'Thanks for your business!',
      });

      const result = await service.getContent('NoteTemplate', 1);

      expect(noteTemplateRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        id: 1,
        sourceTable: 'NoteTemplate',
        name: 'Customer Note #1',
        content: 'Thanks for your business!',
      });
    });

    test('returns description for a PaymentTermTemplate', async () => {
      paymentTermTemplateRepository.findById.mockResolvedValue({
        id: 2,
        name: 'Net 30',
        description: 'Net 30, Due date: 30 days, Late payment fee 5%',
      });

      const result = await service.getContent('PaymentTermTemplate', 2);

      expect(paymentTermTemplateRepository.findById).toHaveBeenCalledWith(2);
      expect(result).toEqual({
        id: 2,
        sourceTable: 'PaymentTermTemplate',
        name: 'Net 30',
        content: 'Net 30, Due date: 30 days, Late payment fee 5%',
      });
    });

    test('throws ValidationError for an unsupported sourceTable', async () => {
      await expect(service.getContent('TodoListTemplate', 1)).rejects.toThrow(
        ValidationError,
      );
      expect(noteTemplateRepository.findById).not.toHaveBeenCalled();
      expect(paymentTermTemplateRepository.findById).not.toHaveBeenCalled();
    });

    test('throws NotFoundError when the underlying row does not exist', async () => {
      noteTemplateRepository.findById.mockResolvedValue(null);

      await expect(service.getContent('NoteTemplate', 999)).rejects.toThrow(
        NotFoundError,
      );
    });
  });
});
