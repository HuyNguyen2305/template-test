import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { BasicEstimateTemplateController } from '#controllers/basic-estimate-template.controller.js';

describe('BasicEstimateTemplateController', () => {
  let basicEstimateTemplateService;
  let controller;
  let reply;

  beforeEach(() => {
    basicEstimateTemplateService = {
      list: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    controller = new BasicEstimateTemplateController({
      basicEstimateTemplateService,
    });
    reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test('list fetches and sends all templates', async () => {
    basicEstimateTemplateService.list.mockResolvedValue([{ id: 1 }]);

    await controller.list({}, reply);

    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Basic estimate templates fetched',
      data: [{ id: 1 }],
    });
  });

  test('getById fetches by param id and sends the result', async () => {
    basicEstimateTemplateService.getById.mockResolvedValue({ id: 1 });
    const request = { params: { id: '1' } };

    await controller.getById(request, reply);

    expect(basicEstimateTemplateService.getById).toHaveBeenCalledWith('1');
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Basic estimate template fetched',
      data: { id: 1 },
    });
  });

  test('create sends a 201 with the created record', async () => {
    basicEstimateTemplateService.create.mockResolvedValue({ id: 1 });
    const request = { body: { name: 'Basic Estimate' } };

    await controller.create(request, reply);

    expect(basicEstimateTemplateService.create).toHaveBeenCalledWith(
      request.body,
    );
    expect(reply.status).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Basic estimate template created',
      data: { id: 1 },
    });
  });

  test('update sends the updated record', async () => {
    basicEstimateTemplateService.update.mockResolvedValue({
      id: 1,
      name: 'updated',
    });
    const request = { params: { id: '1' }, body: { name: 'updated' } };

    await controller.update(request, reply);

    expect(basicEstimateTemplateService.update).toHaveBeenCalledWith('1', {
      name: 'updated',
    });
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Basic estimate template updated',
      data: { id: 1, name: 'updated' },
    });
  });

  test('remove sends a null-data success response', async () => {
    const request = { params: { id: '1' } };

    await controller.remove(request, reply);

    expect(basicEstimateTemplateService.remove).toHaveBeenCalledWith('1');
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Basic estimate template deleted',
      data: null,
    });
  });
});
