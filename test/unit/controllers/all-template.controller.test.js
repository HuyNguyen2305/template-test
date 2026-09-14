import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { AllTemplateController } from '#controllers/all-template.controller.js';

describe('AllTemplateController', () => {
  let allTemplateService;
  let controller;
  let reply;

  beforeEach(() => {
    allTemplateService = {
      list: jest.fn(),
      getContent: jest.fn(),
    };
    controller = new AllTemplateController({ allTemplateService });
    reply = {
      send: jest.fn(),
    };
  });

  test('list fetches with query filters and sends the result', async () => {
    allTemplateService.list.mockResolvedValue([{ id: 1 }]);
    const request = { query: { category: 'Payment Terms', query: 'net' } };

    await controller.list(request, reply);

    expect(allTemplateService.list).toHaveBeenCalledWith({
      category: 'Payment Terms',
      query: 'net',
    });
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'All templates fetched',
      data: [{ id: 1 }],
    });
  });

  test('getContent fetches by sourceTable/id and sends the result', async () => {
    allTemplateService.getContent.mockResolvedValue({
      id: 1,
      sourceTable: 'NoteTemplate',
      name: 'Customer Note #1',
      content: 'Thanks!',
    });
    const request = { params: { sourceTable: 'NoteTemplate', id: '1' } };

    await controller.getContent(request, reply);

    expect(allTemplateService.getContent).toHaveBeenCalledWith(
      'NoteTemplate',
      '1',
    );
    expect(reply.send).toHaveBeenCalledWith({
      success: true,
      message: 'Template content fetched',
      data: {
        id: 1,
        sourceTable: 'NoteTemplate',
        name: 'Customer Note #1',
        content: 'Thanks!',
      },
    });
  });
});
