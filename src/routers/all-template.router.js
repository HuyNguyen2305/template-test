import { CONTROLLER_KEYS } from '#constants/singleton.js';
import {
  listAllTemplatesSchema,
  getTemplateContentSchema,
} from '#schemas/all-template.schema.js';

export default async function allTemplateRouter(fastify) {
  const controller = fastify.diContainer.resolve(
    CONTROLLER_KEYS.allTemplateController,
  );

  fastify.get(
    '/all-templates',
    { schema: listAllTemplatesSchema },
    controller.list.bind(controller),
  );

  fastify.get(
    '/all-templates/:sourceTable/:id/content',
    { schema: getTemplateContentSchema },
    controller.getContent.bind(controller),
  );
}
