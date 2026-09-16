const itemResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    serviceName: { type: 'string' },
    description: { type: ['string', 'null'] },
    cost: { type: 'string' },
    qty: { type: 'string' },
    tax1Id: { type: ['integer', 'null'] },
    tax2Id: { type: ['integer', 'null'] },
  },
};

const basicEstimateTemplateResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    discountValue: { type: 'string' },
    discountType: { type: 'string' },
    depositValue: { type: 'string' },
    depositType: { type: 'string' },
    terms: { type: ['string', 'null'] },
    notes: { type: ['string', 'null'] },
    items: { type: 'array', items: itemResponseSchema },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const itemInputSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['serviceName', 'cost'],
  properties: {
    serviceName: { type: 'string', minLength: 1 },
    description: { type: 'string' },
    cost: { type: 'number', minimum: 0, maximum: 99999999.99 },
    qty: { type: 'number', exclusiveMinimum: 0, maximum: 99999999.99 },
    tax1Id: { type: ['integer', 'null'] },
    tax2Id: { type: ['integer', 'null'] },
  },
};

export const listBasicEstimateTemplatesSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: { type: 'array', items: basicEstimateTemplateResponseSchema },
      },
    },
  },
};

export const getBasicEstimateTemplateSchema = {
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
        data: basicEstimateTemplateResponseSchema,
      },
    },
  },
};

export const createBasicEstimateTemplateSchema = {
  body: {
    type: 'object',
    additionalProperties: false,
    required: ['name'],
    properties: {
      name: { type: 'string', minLength: 1 },
      discountValue: { type: 'number', minimum: 0, maximum: 99999999.99 },
      discountType: { type: 'string', minLength: 1 },
      depositValue: { type: 'number', minimum: 0, maximum: 99999999.99 },
      depositType: { type: 'string', minLength: 1 },
      terms: { type: 'string' },
      notes: { type: 'string' },
      items: { type: 'array', items: itemInputSchema },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: basicEstimateTemplateResponseSchema,
      },
    },
  },
};

export const updateBasicEstimateTemplateSchema = {
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
      discountValue: { type: 'number', minimum: 0, maximum: 99999999.99 },
      discountType: { type: 'string', minLength: 1 },
      depositValue: { type: 'number', minimum: 0, maximum: 99999999.99 },
      depositType: { type: 'string', minLength: 1 },
      terms: { type: 'string' },
      notes: { type: 'string' },
      items: { type: 'array', items: itemInputSchema },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: basicEstimateTemplateResponseSchema,
      },
    },
  },
};

export const deleteBasicEstimateTemplateSchema = {
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
