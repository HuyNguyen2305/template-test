import { ESTIMATE_TYPES, ESTIMATE_STATUSES } from '#models/estimate.model.js';

const taxSlotSchema = {
  type: 'object',
  properties: {
    taxId: { type: 'integer' },
    name: { type: 'string' },
    rate: { type: 'string' },
  },
};

const itemResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    itemName: { type: 'string' },
    description: { type: ['string', 'null'] },
    cost: { type: 'string' },
    qty: { type: 'string' },
    subtotal: { type: 'string' },
    taxSlots: { type: 'array', items: taxSlotSchema },
    total: { type: 'string' },
    sortOrder: { type: 'integer' },
  },
};

const estimateResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    jobId: { type: 'integer' },
    type: { type: 'string' },
    status: { type: 'string', enum: ESTIMATE_STATUSES },
    estimateNumber: { type: 'string' },
    poNumber: { type: ['string', 'null'] },
    dateIssued: { type: 'string' },
    discountValue: { type: 'string' },
    discountType: { type: 'string' },
    depositValue: { type: 'string' },
    depositType: { type: 'string' },
    terms: { type: ['string', 'null'] },
    items: { type: 'array', items: itemResponseSchema },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const itemInputSchema = {
  type: 'object',
  required: ['itemName', 'cost'],
  properties: {
    itemName: { type: 'string', minLength: 1 },
    description: { type: 'string' },
    cost: { type: 'number', minimum: 0, maximum: 99999999.99 },
    qty: { type: 'number', exclusiveMinimum: 0, maximum: 99999999.99 },
    tax1Id: { type: ['integer', 'null'] },
    tax2Id: { type: ['integer', 'null'] },
  },
};

const jobIdParam = {
  type: 'object',
  required: ['jobId'],
  properties: { jobId: { type: 'integer' } },
};

export const getEstimateSchema = {
  params: jobIdParam,
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: estimateResponseSchema,
      },
    },
  },
};

export const createEstimateSchema = {
  params: jobIdParam,
  body: {
    type: 'object',
    required: ['estimateNumber'],
    properties: {
      type: { type: 'string', enum: ESTIMATE_TYPES, default: 'Basic' },
      status: { type: 'string', enum: ESTIMATE_STATUSES, default: 'Draft' },
      estimateNumber: { type: 'string', minLength: 1 },
      poNumber: { type: 'string' },
      dateIssued: { type: 'string', format: 'date' },
      discountValue: { type: 'number', minimum: 0, maximum: 99999999.99 },
      discountType: { type: 'string', minLength: 1 },
      depositValue: { type: 'number', minimum: 0, maximum: 99999999.99 },
      depositType: { type: 'string', minLength: 1 },
      terms: { type: 'string', minLength: 1 },
      termsSourceTemplateId: { type: 'integer' },
      basicEstimateTemplateId: { type: 'integer' },
      items: { type: 'array', items: itemInputSchema },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: estimateResponseSchema,
      },
    },
  },
};

export const updateEstimateSchema = {
  params: jobIdParam,
  body: {
    type: 'object',
    properties: {
      type: { type: 'string', enum: ESTIMATE_TYPES },
      status: { type: 'string', enum: ESTIMATE_STATUSES },
      estimateNumber: { type: 'string', minLength: 1 },
      poNumber: { type: ['string', 'null'] },
      dateIssued: { type: 'string', format: 'date' },
      discountValue: { type: 'number', minimum: 0, maximum: 99999999.99 },
      discountType: { type: 'string', minLength: 1 },
      depositValue: { type: 'number', minimum: 0, maximum: 99999999.99 },
      depositType: { type: 'string', minLength: 1 },
      terms: { type: ['string', 'null'] },
      termsSourceTemplateId: { type: ['integer', 'null'] },
      items: { type: 'array', items: itemInputSchema },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: estimateResponseSchema,
      },
    },
  },
};

export const deleteEstimateSchema = {
  params: jobIdParam,
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
