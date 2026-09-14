export const listAllTemplatesSchema = {
  querystring: {
    type: 'object',
    properties: {
      category: { type: 'string' },
      query: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              sourceTable: { type: 'string' },
              category: { type: 'string' },
              name: { type: 'string' },
            },
          },
        },
      },
    },
  },
};

export const getTemplateContentSchema = {
  params: {
    type: 'object',
    required: ['sourceTable', 'id'],
    properties: {
      sourceTable: {
        type: 'string',
        enum: ['NoteTemplate', 'PaymentTermTemplate'],
      },
      id: { type: 'integer' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            sourceTable: { type: 'string' },
            name: { type: 'string' },
            content: { type: 'string' },
          },
        },
      },
    },
  },
};
