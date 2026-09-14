import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { NoteController } from '#controllers/note.controller.js';

describe('NoteController', () => {
  let noteService;
  let controller;
  let reply;

  beforeEach(() => {
    noteService = {
      listForJob: jest.fn(),
      createForJob: jest.fn(),
      listForInvoice: jest.fn(),
      createForInvoice: jest.fn(),
      listForEstimate: jest.fn(),
      createForEstimate: jest.fn(),
      remove: jest.fn(),
    };
    controller = new NoteController({ noteService });
    reply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test('listForJob fetches by jobId param and sends the result', async () => {
    noteService.listForJob.mockResolvedValue([{ id: 1 }]);
    const request = { params: { jobId: 1 } };

    await controller.listForJob(request, reply);

    expect(noteService.listForJob).toHaveBeenCalledWith(1);
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Notes fetched',
      data: [{ id: 1 }],
    });
  });

  test('createForJob creates and sends a 201 with the result', async () => {
    noteService.createForJob.mockResolvedValue({ id: 1, body: 'text' });
    const request = { params: { jobId: 1 }, body: { body: 'text' } };

    await controller.createForJob(request, reply);

    expect(noteService.createForJob).toHaveBeenCalledWith(1, { body: 'text' });
    expect(reply.status).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Note created',
      data: { id: 1, body: 'text' },
    });
  });

  test('listForInvoice fetches by jobId param and sends the result', async () => {
    noteService.listForInvoice.mockResolvedValue([{ id: 2 }]);
    const request = { params: { jobId: 1 } };

    await controller.listForInvoice(request, reply);

    expect(noteService.listForInvoice).toHaveBeenCalledWith(1);
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Notes fetched',
      data: [{ id: 2 }],
    });
  });

  test('createForInvoice creates and sends a 201 with the result', async () => {
    noteService.createForInvoice.mockResolvedValue({ id: 2, body: 'text' });
    const request = { params: { jobId: 1 }, body: { body: 'text' } };

    await controller.createForInvoice(request, reply);

    expect(noteService.createForInvoice).toHaveBeenCalledWith(1, {
      body: 'text',
    });
    expect(reply.status).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Note created',
      data: { id: 2, body: 'text' },
    });
  });

  test('listForEstimate fetches by jobId param and sends the result', async () => {
    noteService.listForEstimate.mockResolvedValue([{ id: 3 }]);
    const request = { params: { jobId: 1 } };

    await controller.listForEstimate(request, reply);

    expect(noteService.listForEstimate).toHaveBeenCalledWith(1);
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Notes fetched',
      data: [{ id: 3 }],
    });
  });

  test('createForEstimate creates and sends a 201 with the result', async () => {
    noteService.createForEstimate.mockResolvedValue({ id: 3, body: 'text' });
    const request = { params: { jobId: 1 }, body: { body: 'text' } };

    await controller.createForEstimate(request, reply);

    expect(noteService.createForEstimate).toHaveBeenCalledWith(1, {
      body: 'text',
    });
    expect(reply.status).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Note created',
      data: { id: 3, body: 'text' },
    });
  });

  test('remove sends a null-data success response', async () => {
    const request = { params: { id: 7 } };

    await controller.remove(request, reply);

    expect(noteService.remove).toHaveBeenCalledWith(7);
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Note deleted',
      data: null,
    });
  });
});
