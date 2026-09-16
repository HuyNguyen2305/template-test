const taxResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    rate: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

export const listTaxesSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: { type: 'array', items: taxResponseSchema },
      },
    },
  },
};

export const getTaxSchema = {
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
        data: taxResponseSchema,
      },
    },
  },
};

export const createTaxSchema = {
  body: {
    type: 'object',
    additionalProperties: false,
    required: ['name', 'rate'],
    properties: {
      name: { type: 'string', minLength: 1 },
      rate: { type: 'number', minimum: 0, maximum: 999.99 },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: taxResponseSchema,
      },
    },
  },
};

export const updateTaxSchema = {
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
      rate: { type: 'number', minimum: 0, maximum: 999.99 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: taxResponseSchema,
      },
    },
  },
};

export const deleteTaxSchema = {
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
