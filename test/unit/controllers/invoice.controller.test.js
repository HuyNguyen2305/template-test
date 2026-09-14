import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { InvoiceController } from '#controllers/invoice.controller.js';

describe('InvoiceController', () => {
  let invoiceService;
  let controller;
  let reply;

  beforeEach(() => {
    invoiceService = {
      getByJobId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    controller = new InvoiceController({ invoiceService });
    reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test('getByJobId fetches by jobId param and sends the result', async () => {
    invoiceService.getByJobId.mockResolvedValue({ id: 10 });
    const request = { params: { jobId: 1 } };

    await controller.getByJobId(request, reply);

    expect(invoiceService.getByJobId).toHaveBeenCalledWith(1);
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Invoice fetched',
      data: { id: 10 },
    });
  });

  test('create sends a 201 with the created record', async () => {
    invoiceService.create.mockResolvedValue({ id: 10 });
    const request = {
      params: { jobId: 1 },
      body: { invoiceNumber: 'INV-1' },
    };

    await controller.create(request, reply);

    expect(invoiceService.create).toHaveBeenCalledWith(1, {
      invoiceNumber: 'INV-1',
    });
    expect(reply.status).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Invoice created',
      data: { id: 10 },
    });
  });

  test('update sends the updated record', async () => {
    invoiceService.update.mockResolvedValue({ id: 10, poNumber: 'PO-1' });
    const request = {
      params: { jobId: 1 },
      body: { poNumber: 'PO-1' },
    };

    await controller.update(request, reply);

    expect(invoiceService.update).toHaveBeenCalledWith(1, {
      poNumber: 'PO-1',
    });
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Invoice updated',
      data: { id: 10, poNumber: 'PO-1' },
    });
  });

  test('remove sends a null-data success response', async () => {
    const request = { params: { jobId: 1 } };

    await controller.remove(request, reply);

    expect(invoiceService.remove).toHaveBeenCalledWith(1);
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Invoice deleted',
      data: null,
    });
  });
});
