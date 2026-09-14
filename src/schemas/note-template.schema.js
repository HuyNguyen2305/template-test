import { NOTE_TEMPLATE_TYPE_KEYS } from '#models/note-template.model.js';

const noteTemplateResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    typeKey: { type: 'string', enum: NOTE_TEMPLATE_TYPE_KEYS },
    name: { type: 'string' },
    body: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

export const listNoteTemplatesSchema = {
  querystring: {
    type: 'object',
    properties: {
      typeKey: { type: 'string', enum: NOTE_TEMPLATE_TYPE_KEYS },
      query: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: { type: 'array', items: noteTemplateResponseSchema },
      },
    },
  },
};

export const getNoteTemplateSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'integer' } },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: noteTemplateResponseSchema,
      },
    },
  },
};

export const createNoteTemplateSchema = {
  body: {
    type: 'object',
    required: ['typeKey', 'name', 'body'],
    properties: {
      typeKey: { type: 'string', enum: NOTE_TEMPLATE_TYPE_KEYS },
      name: { type: 'string', minLength: 1 },
      body: { type: 'string', minLength: 1 },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: noteTemplateResponseSchema,
      },
    },
  },
};

export const updateNoteTemplateSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'integer' } },
  },
  body: {
    type: 'object',
    properties: {
      typeKey: { type: 'string', enum: NOTE_TEMPLATE_TYPE_KEYS },
      name: { type: 'string', minLength: 1 },
      body: { type: 'string', minLength: 1 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: noteTemplateResponseSchema,
      },
    },
  },
};

export const deleteNoteTemplateSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'integer' } },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: { type: 'null' },
      },
    },
  },
};
