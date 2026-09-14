import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { JobController } from '#controllers/job.controller.js';

describe('JobController', () => {
  let jobService;
  let controller;
  let reply;

  beforeEach(() => {
    jobService = {
      list: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    controller = new JobController({ jobService });
    reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test('list fetches and sends all jobs', async () => {
    jobService.list.mockResolvedValue([{ id: 1 }]);

    await controller.list({}, reply);

    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Jobs fetched',
      data: [{ id: 1 }],
    });
  });

  test('getById fetches by param id and sends the result', async () => {
    jobService.getById.mockResolvedValue({ id: 1 });
    const request = { params: { id: 1 } };

    await controller.getById(request, reply);

    expect(jobService.getById).toHaveBeenCalledWith(1);
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Job fetched',
      data: { id: 1 },
    });
  });

  test('create sends a 201 with the created record', async () => {
    jobService.create.mockResolvedValue({ id: 1, name: 'Wall Street' });
    const request = { body: { name: 'Wall Street' } };

    await controller.create(request, reply);

    expect(jobService.create).toHaveBeenCalledWith({ name: 'Wall Street' });
    expect(reply.status).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Job created',
      data: { id: 1, name: 'Wall Street' },
    });
  });

  test('update sends the updated record', async () => {
    jobService.update.mockResolvedValue({ id: 1, name: 'updated' });
    const request = { params: { id: 1 }, body: { name: 'updated' } };

    await controller.update(request, reply);

    expect(jobService.update).toHaveBeenCalledWith(1, { name: 'updated' });
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Job updated',
      data: { id: 1, name: 'updated' },
    });
  });

  test('remove sends a null-data success response', async () => {
    const request = { params: { id: 1 } };

    await controller.remove(request, reply);

    expect(jobService.remove).toHaveBeenCalledWith(1);
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Job deleted',
      data: null,
    });
  });
});
