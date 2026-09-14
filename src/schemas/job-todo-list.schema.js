const itemResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    text: { type: 'string' },
    sortOrder: { type: 'integer' },
    completed: { type: 'boolean' },
  },
};

const jobTodoListResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    jobId: { type: 'integer' },
    name: { type: 'string' },
    items: { type: 'array', items: itemResponseSchema },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const itemInputSchema = {
  type: 'object',
  required: ['text'],
  properties: {
    text: { type: 'string', minLength: 1 },
    completed: { type: 'boolean', default: false },
  },
};

const jobIdParam = { jobId: { type: 'integer' } };

export const listJobTodoListsSchema = {
  params: {
    type: 'object',
    required: ['jobId'],
    properties: jobIdParam,
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: { type: 'array', items: jobTodoListResponseSchema },
      },
    },
  },
};

export const getJobTodoListSchema = {
  params: {
    type: 'object',
    required: ['jobId', 'id'],
    properties: { ...jobIdParam, id: { type: 'integer' } },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: jobTodoListResponseSchema,
      },
    },
  },
};

export const createJobTodoListSchema = {
  params: {
    type: 'object',
    required: ['jobId'],
    properties: jobIdParam,
  },
  body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', minLength: 1 },
      items: { type: 'array', items: itemInputSchema },
      sourceTemplateId: { type: 'integer' },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: jobTodoListResponseSchema,
      },
    },
  },
};

export const updateJobTodoListSchema = {
  params: {
    type: 'object',
    required: ['jobId', 'id'],
    properties: { ...jobIdParam, id: { type: 'integer' } },
  },
  body: {
    type: 'object',
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
        data: jobTodoListResponseSchema,
      },
    },
  },
};

export const deleteJobTodoListSchema = {
  params: {
    type: 'object',
    required: ['jobId', 'id'],
    properties: { ...jobIdParam, id: { type: 'integer' } },
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
