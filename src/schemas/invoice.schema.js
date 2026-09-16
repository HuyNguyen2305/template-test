import { INVOICE_STATUSES } from '#models/invoice.model.js';

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

const invoiceResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    jobId: { type: 'integer' },
    invoiceNumber: { type: 'string' },
    status: { type: 'string', enum: INVOICE_STATUSES },
    poNumber: { type: ['string', 'null'] },
    dateIssued: { type: 'string' },
    repeatsWithJob: { type: 'boolean' },
    discountValue: { type: 'string' },
    discountType: { type: 'string' },
    amountPaid: { type: 'string' },
    terms: { type: ['string', 'null'] },
    items: { type: 'array', items: itemResponseSchema },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const itemInputSchema = {
  type: 'object',
  additionalProperties: false,
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

export const getInvoiceSchema = {
  params: jobIdParam,
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: invoiceResponseSchema,
      },
    },
  },
};

export const createInvoiceSchema = {
  params: jobIdParam,
  body: {
    type: 'object',
    additionalProperties: false,
    required: ['invoiceNumber'],
    properties: {
      invoiceNumber: { type: 'string', minLength: 1 },
      status: { type: 'string', enum: INVOICE_STATUSES, default: 'Draft' },
      poNumber: { type: 'string' },
      dateIssued: { type: 'string', format: 'date' },
      repeatsWithJob: { type: 'boolean', default: false },
      discountValue: { type: 'number', minimum: 0, maximum: 99999999.99 },
      discountType: { type: 'string', minLength: 1 },
      amountPaid: { type: 'number', minimum: 0, maximum: 99999999.99 },
      terms: { type: 'string', minLength: 1 },
      termsSourceTemplateId: { type: 'integer' },
      items: { type: 'array', items: itemInputSchema },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: invoiceResponseSchema,
      },
    },
  },
};

export const updateInvoiceSchema = {
  params: jobIdParam,
  body: {
    type: 'object',
    additionalProperties: false,
    properties: {
      invoiceNumber: { type: 'string', minLength: 1 },
      status: { type: 'string', enum: INVOICE_STATUSES },
      poNumber: { type: ['string', 'null'] },
      dateIssued: { type: 'string', format: 'date' },
      repeatsWithJob: { type: 'boolean' },
      discountValue: { type: 'number', minimum: 0, maximum: 99999999.99 },
      discountType: { type: 'string', minLength: 1 },
      amountPaid: { type: 'number', minimum: 0, maximum: 99999999.99 },
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
        data: invoiceResponseSchema,
      },
    },
  },
};

export const deleteInvoiceSchema = {
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
