import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { PaymentTermTemplateController } from '#controllers/payment-term-template.controller.js';

describe('PaymentTermTemplateController', () => {
  let paymentTermTemplateService;
  let controller;
  let reply;

  beforeEach(() => {
    paymentTermTemplateService = {
      list: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    controller = new PaymentTermTemplateController({
      paymentTermTemplateService,
    });
    reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test('list fetches and sends all templates', async () => {
    paymentTermTemplateService.list.mockResolvedValue([{ id: 1 }]);

    await controller.list({}, reply);

    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Payment term templates fetched',
      data: [{ id: 1 }],
    });
  });

  test('getById fetches by param id and sends the result', async () => {
    paymentTermTemplateService.getById.mockResolvedValue({ id: 1 });
    const request = { params: { id: '1' } };

    await controller.getById(request, reply);

    expect(paymentTermTemplateService.getById).toHaveBeenCalledWith('1');
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Payment term template fetched',
      data: { id: 1 },
    });
  });

  test('create sends a 201 with the created record', async () => {
    paymentTermTemplateService.create.mockResolvedValue({ id: 1 });
    const request = { body: { name: 'Net 30' } };

    await controller.create(request, reply);

    expect(paymentTermTemplateService.create).toHaveBeenCalledWith(
      request.body,
    );
    expect(reply.status).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Payment term template created',
      data: { id: 1 },
    });
  });

  test('update sends the updated record', async () => {
    paymentTermTemplateService.update.mockResolvedValue({
      id: 1,
      name: 'updated',
    });
    const request = { params: { id: '1' }, body: { name: 'updated' } };

    await controller.update(request, reply);

    expect(paymentTermTemplateService.update).toHaveBeenCalledWith('1', {
      name: 'updated',
    });
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Payment term template updated',
      data: { id: 1, name: 'updated' },
    });
  });

  test('remove sends a null-data success response', async () => {
    const request = { params: { id: '1' } };

    await controller.remove(request, reply);

    expect(paymentTermTemplateService.remove).toHaveBeenCalledWith('1');
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Payment term template deleted',
      data: null,
    });
  });
});
