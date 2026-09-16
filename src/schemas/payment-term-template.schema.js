const paymentTermTemplateResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    dueDateValue: { type: 'string' },
    dueDateUnit: { type: 'string' },
    lateFeeValue: { type: 'string' },
    lateFeeUnit: { type: 'string' },
    tax1Id: { type: ['integer', 'null'] },
    tax2Id: { type: ['integer', 'null'] },
    description: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

export const listPaymentTermTemplatesSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: { type: 'array', items: paymentTermTemplateResponseSchema },
      },
    },
  },
};

export const getPaymentTermTemplateSchema = {
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
        data: paymentTermTemplateResponseSchema,
      },
    },
  },
};

export const createPaymentTermTemplateSchema = {
  body: {
    type: 'object',
    additionalProperties: false,
    required: ['dueDateValue', 'dueDateUnit', 'lateFeeValue', 'lateFeeUnit'],
    properties: {
      name: { type: 'string', minLength: 1 },
      dueDateValue: { type: 'number', maximum: 99999999.99 },
      dueDateUnit: { type: 'string', minLength: 1 },
      lateFeeValue: { type: 'number', maximum: 99999999.99 },
      lateFeeUnit: { type: 'string', minLength: 1 },
      tax1Id: { type: 'integer' },
      tax2Id: { type: 'integer' },
      description: { type: 'string', minLength: 1 },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: paymentTermTemplateResponseSchema,
      },
    },
  },
};

export const updatePaymentTermTemplateSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'integer' } },
  },
  body: {
    type: 'object',
    additionalProperties: false,
    properties: {
      name: { type: 'string', minLength: 1 },
      dueDateValue: { type: 'number', maximum: 99999999.99 },
      dueDateUnit: { type: 'string', minLength: 1 },
      lateFeeValue: { type: 'number', maximum: 99999999.99 },
      lateFeeUnit: { type: 'string', minLength: 1 },
      tax1Id: { type: ['integer', 'null'] },
      tax2Id: { type: ['integer', 'null'] },
      description: { type: 'string', minLength: 1 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: paymentTermTemplateResponseSchema,
      },
    },
  },
};

export const deletePaymentTermTemplateSchema = {
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
