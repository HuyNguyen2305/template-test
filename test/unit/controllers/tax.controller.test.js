import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { TaxController } from '#controllers/tax.controller.js';

describe('TaxController', () => {
  let taxService;
  let controller;
  let reply;

  beforeEach(() => {
    taxService = {
      list: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    controller = new TaxController({ taxService });
    reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test('list fetches and sends all taxes', async () => {
    taxService.list.mockResolvedValue([{ id: 1 }]);

    await controller.list({}, reply);

    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Taxes fetched',
      data: [{ id: 1 }],
    });
  });

  test('getById fetches by param id and sends the result', async () => {
    taxService.getById.mockResolvedValue({ id: 1 });
    const request = { params: { id: '1' } };

    await controller.getById(request, reply);

    expect(taxService.getById).toHaveBeenCalledWith('1');
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Tax fetched',
      data: { id: 1 },
    });
  });

  test('create sends a 201 with the created record', async () => {
    taxService.create.mockResolvedValue({ id: 1 });
    const request = { body: { name: 'VAT', rate: 10 } };

    await controller.create(request, reply);

    expect(taxService.create).toHaveBeenCalledWith(request.body);
    expect(reply.status).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Tax created',
      data: { id: 1 },
    });
  });

  test('update sends the updated record', async () => {
    taxService.update.mockResolvedValue({ id: 1, name: 'updated' });
    const request = { params: { id: '1' }, body: { name: 'updated' } };

    await controller.update(request, reply);

    expect(taxService.update).toHaveBeenCalledWith('1', { name: 'updated' });
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Tax updated',
      data: { id: 1, name: 'updated' },
    });
  });

  test('remove sends a null-data success response', async () => {
    const request = { params: { id: '1' } };

    await controller.remove(request, reply);

    expect(taxService.remove).toHaveBeenCalledWith('1');
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Tax deleted',
      data: null,
    });
  });
});
