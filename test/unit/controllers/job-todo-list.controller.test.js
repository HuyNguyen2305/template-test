import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { JobTodoListController } from '#controllers/job-todo-list.controller.js';

describe('JobTodoListController', () => {
  let jobTodoListService;
  let controller;
  let reply;

  beforeEach(() => {
    jobTodoListService = {
      list: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    controller = new JobTodoListController({ jobTodoListService });
    reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test('list fetches by jobId param and sends the result', async () => {
    jobTodoListService.list.mockResolvedValue([{ id: 1 }]);
    const request = { params: { jobId: 1 } };

    await controller.list(request, reply);

    expect(jobTodoListService.list).toHaveBeenCalledWith(1);
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Job todo lists fetched',
      data: [{ id: 1 }],
    });
  });

  test('getById fetches by jobId and id params and sends the result', async () => {
    jobTodoListService.getById.mockResolvedValue({ id: 5 });
    const request = { params: { jobId: 1, id: 5 } };

    await controller.getById(request, reply);

    expect(jobTodoListService.getById).toHaveBeenCalledWith(1, 5);
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Job todo list fetched',
      data: { id: 5 },
    });
  });

  test('create sends a 201 with the created record', async () => {
    jobTodoListService.create.mockResolvedValue({ id: 5 });
    const request = { params: { jobId: 1 }, body: { name: 'Checklist' } };

    await controller.create(request, reply);

    expect(jobTodoListService.create).toHaveBeenCalledWith(1, {
      name: 'Checklist',
    });
    expect(reply.status).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Job todo list created',
      data: { id: 5 },
    });
  });

  test('update sends the updated record', async () => {
    jobTodoListService.update.mockResolvedValue({ id: 5, name: 'updated' });
    const request = {
      params: { jobId: 1, id: 5 },
      body: { name: 'updated' },
    };

    await controller.update(request, reply);

    expect(jobTodoListService.update).toHaveBeenCalledWith(1, 5, {
      name: 'updated',
    });
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Job todo list updated',
      data: { id: 5, name: 'updated' },
    });
  });

  test('remove sends a null-data success response', async () => {
    const request = { params: { jobId: 1, id: 5 } };

    await controller.remove(request, reply);

    expect(jobTodoListService.remove).toHaveBeenCalledWith(1, 5);
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Job todo list deleted',
      data: null,
    });
  });
});
