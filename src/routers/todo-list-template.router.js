import { CONTROLLER_KEYS } from '#constants/singleton.js';
import {
  listTodoListTemplatesSchema,
  getTodoListTemplateSchema,
  createTodoListTemplateSchema,
  updateTodoListTemplateSchema,
  deleteTodoListTemplateSchema,
} from '#schemas/todo-list-template.schema.js';

export default async function todoListTemplateRouter(fastify) {
  const controller = fastify.diContainer.resolve(
    CONTROLLER_KEYS.todoListTemplateController,
  );

  fastify.get(
    '/todo-list-templates',
    { schema: listTodoListTemplatesSchema },
    controller.list.bind(controller),
  );

  fastify.get(
    '/todo-list-templates/:id',
    { schema: getTodoListTemplateSchema },
    controller.getById.bind(controller),
  );

  fastify.post(
    '/todo-list-templates',
    { schema: createTodoListTemplateSchema },
    controller.create.bind(controller),
  );

  fastify.patch(
    '/todo-list-templates/:id',
    { schema: updateTodoListTemplateSchema },
    controller.update.bind(controller),
  );

  fastify.delete(
    '/todo-list-templates/:id',
    { schema: deleteTodoListTemplateSchema },
    controller.remove.bind(controller),
  );
}
