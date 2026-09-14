import { CONTROLLER_KEYS } from '#constants/singleton.js';
import {
  listBasicEstimateTemplatesSchema,
  getBasicEstimateTemplateSchema,
  createBasicEstimateTemplateSchema,
  updateBasicEstimateTemplateSchema,
  deleteBasicEstimateTemplateSchema,
} from '#schemas/basic-estimate-template.schema.js';

export default async function basicEstimateTemplateRouter(fastify) {
  const controller = fastify.diContainer.resolve(
    CONTROLLER_KEYS.basicEstimateTemplateController,
  );

  fastify.get(
    '/basic-estimate-templates',
    { schema: listBasicEstimateTemplatesSchema },
    controller.list.bind(controller),
  );

  fastify.get(
    '/basic-estimate-templates/:id',
    { schema: getBasicEstimateTemplateSchema },
    controller.getById.bind(controller),
  );

  fastify.post(
    '/basic-estimate-templates',
    { schema: createBasicEstimateTemplateSchema },
    controller.create.bind(controller),
  );

  fastify.patch(
    '/basic-estimate-templates/:id',
    { schema: updateBasicEstimateTemplateSchema },
    controller.update.bind(controller),
  );

  fastify.delete(
    '/basic-estimate-templates/:id',
    { schema: deleteBasicEstimateTemplateSchema },
    controller.remove.bind(controller),
  );
}
