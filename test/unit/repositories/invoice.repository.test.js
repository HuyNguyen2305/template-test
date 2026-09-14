import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from '@jest/globals';
import { InvoiceRepository } from '#repositories/invoice.repository.js';

describe('InvoiceRepository', () => {
  let scopedModel;
  let model;
  let repository;

  beforeEach(() => {
    scopedModel = { findOne: jest.fn().mockResolvedValue(null) };
    model = { schema: jest.fn().mockReturnValue(scopedModel) };
    repository = new InvoiceRepository({ invoiceModel: model });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('findByJobId queries by jobId', async () => {
    scopedModel.findOne.mockResolvedValue({ id: 1 });

    const result = await repository.findByJobId(5);

    expect(scopedModel.findOne).toHaveBeenCalledWith({
      where: { jobId: 5 },
    });
    expect(result).toEqual({ id: 1 });
  });

  test('findByJobId forwards extra options', async () => {
    await repository.findByJobId(5, { transaction: 't' });

    expect(scopedModel.findOne).toHaveBeenCalledWith({
      where: { jobId: 5 },
      transaction: 't',
    });
  });
});
