const itemResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    text: { type: 'string' },
    sortOrder: { type: 'integer' },
  },
};

const todoListTemplateResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    items: { type: 'array', items: itemResponseSchema },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const itemInputSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['text'],
  properties: {
    text: { type: 'string', minLength: 1 },
  },
};

export const listTodoListTemplatesSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: { type: 'array', items: todoListTemplateResponseSchema },
      },
    },
  },
};

export const getTodoListTemplateSchema = {
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
        data: todoListTemplateResponseSchema,
      },
    },
  },
};

export const createTodoListTemplateSchema = {
  body: {
    type: 'object',
    additionalProperties: false,
    required: ['name'],
    properties: {
      name: { type: 'string', minLength: 1 },
      items: { type: 'array', items: itemInputSchema },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: todoListTemplateResponseSchema,
      },
    },
  },
};

export const updateTodoListTemplateSchema = {
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
      items: { type: 'array', items: itemInputSchema },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: todoListTemplateResponseSchema,
      },
    },
  },
};

export const deleteTodoListTemplateSchema = {
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
