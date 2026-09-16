import { NOTE_TYPES } from '#models/note.model.js';

const noteResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    parentId: { type: 'string' },
    type: { type: 'string', enum: NOTE_TYPES },
    body: { type: 'string' },
    authorUserId: { type: ['integer', 'null'] },
    createdAt: { type: 'string', format: 'date-time' },
  },
};

const jobIdParam = {
  type: 'object',
  required: ['jobId'],
  properties: { jobId: { type: 'integer' } },
};

const createNoteBody = {
  type: 'object',
  additionalProperties: false,
  properties: {
    body: { type: 'string', minLength: 1 },
    sourceTemplateId: { type: 'integer' },
    authorUserId: { type: 'integer' },
  },
};

const listResponse = {
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: { type: 'array', items: noteResponseSchema },
      },
    },
  },
};

const createResponse = {
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: noteResponseSchema,
      },
    },
  },
};

export const listJobNotesSchema = { params: jobIdParam, ...listResponse };
export const createJobNoteSchema = {
  params: jobIdParam,
  body: createNoteBody,
  ...createResponse,
};

export const listInvoiceNotesSchema = { params: jobIdParam, ...listResponse };
export const createInvoiceNoteSchema = {
  params: jobIdParam,
  body: createNoteBody,
  ...createResponse,
};

export const listEstimateNotesSchema = { params: jobIdParam, ...listResponse };
export const createEstimateNoteSchema = {
  params: jobIdParam,
  body: createNoteBody,
  ...createResponse,
};

export const deleteNoteSchema = {
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
