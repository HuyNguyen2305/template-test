import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { NoteTemplateController } from '#controllers/note-template.controller.js';

describe('NoteTemplateController', () => {
  let noteTemplateService;
  let controller;
  let reply;

  beforeEach(() => {
    noteTemplateService = {
      list: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    controller = new NoteTemplateController({ noteTemplateService });
    reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test('list fetches with query filters and sends the result', async () => {
    noteTemplateService.list.mockResolvedValue([{ id: 1 }]);
    const request = { query: { typeKey: 'Customer', query: 'foo' } };

    await controller.list(request, reply);

    expect(noteTemplateService.list).toHaveBeenCalledWith({
      typeKey: 'Customer',
      query: 'foo',
    });
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Note templates fetched',
      data: [{ id: 1 }],
    });
  });

  test('getById fetches by param id and sends the result', async () => {
    noteTemplateService.getById.mockResolvedValue({ id: 1 });
    const request = { params: { id: '1' } };

    await controller.getById(request, reply);

    expect(noteTemplateService.getById).toHaveBeenCalledWith('1');
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Note template fetched',
      data: { id: 1 },
    });
  });

  test('create sends a 201 with the created record', async () => {
    noteTemplateService.create.mockResolvedValue({ id: 1 });
    const request = { body: { typeKey: 'Customer', name: 'n', body: 'b' } };

    await controller.create(request, reply);

    expect(noteTemplateService.create).toHaveBeenCalledWith(request.body);
    expect(reply.status).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Note template created',
      data: { id: 1 },
    });
  });

  test('update sends the updated record', async () => {
    noteTemplateService.update.mockResolvedValue({ id: 1, name: 'updated' });
    const request = { params: { id: '1' }, body: { name: 'updated' } };

    await controller.update(request, reply);

    expect(noteTemplateService.update).toHaveBeenCalledWith('1', {
      name: 'updated',
    });
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Note template updated',
      data: { id: 1, name: 'updated' },
    });
  });

  test('remove sends a null-data success response', async () => {
    const request = { params: { id: '1' } };

    await controller.remove(request, reply);

    expect(noteTemplateService.remove).toHaveBeenCalledWith('1');
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Note template deleted',
      data: null,
    });
  });
});
