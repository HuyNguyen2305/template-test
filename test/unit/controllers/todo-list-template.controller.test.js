import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { TodoListTemplateController } from '#controllers/todo-list-template.controller.js';

describe('TodoListTemplateController', () => {
  let todoListTemplateService;
  let controller;
  let reply;

  beforeEach(() => {
    todoListTemplateService = {
      list: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    controller = new TodoListTemplateController({ todoListTemplateService });
    reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test('list fetches and sends all templates', async () => {
    todoListTemplateService.list.mockResolvedValue([{ id: 1 }]);

    await controller.list({}, reply);

    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Todo list templates fetched',
      data: [{ id: 1 }],
    });
  });

  test('getById fetches by param id and sends the result', async () => {
    todoListTemplateService.getById.mockResolvedValue({ id: 1 });
    const request = { params: { id: '1' } };

    await controller.getById(request, reply);

    expect(todoListTemplateService.getById).toHaveBeenCalledWith('1');
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Todo list template fetched',
      data: { id: 1 },
    });
  });

  test('create sends a 201 with the created record', async () => {
    todoListTemplateService.create.mockResolvedValue({ id: 1 });
    const request = { body: { name: 'Checklist', items: [{ text: 'a' }] } };

    await controller.create(request, reply);

    expect(todoListTemplateService.create).toHaveBeenCalledWith(request.body);
    expect(reply.status).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Todo list template created',
      data: { id: 1 },
    });
  });

  test('update sends the updated record', async () => {
    todoListTemplateService.update.mockResolvedValue({
      id: 1,
      name: 'updated',
    });
    const request = { params: { id: '1' }, body: { name: 'updated' } };

    await controller.update(request, reply);

    expect(todoListTemplateService.update).toHaveBeenCalledWith('1', {
      name: 'updated',
    });
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Todo list template updated',
      data: { id: 1, name: 'updated' },
    });
  });

  test('remove sends a null-data success response', async () => {
    const request = { params: { id: '1' } };

    await controller.remove(request, reply);

    expect(todoListTemplateService.remove).toHaveBeenCalledWith('1');
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Todo list template deleted',
      data: null,
    });
  });
});
