import { CONTROLLER_KEYS } from '#constants/singleton.js';
import {
  listPaymentTermTemplatesSchema,
  getPaymentTermTemplateSchema,
  createPaymentTermTemplateSchema,
  updatePaymentTermTemplateSchema,
  deletePaymentTermTemplateSchema,
} from '#schemas/payment-term-template.schema.js';

export default async function paymentTermTemplateRouter(fastify) {
  const controller = fastify.diContainer.resolve(
    CONTROLLER_KEYS.paymentTermTemplateController,
  );

  fastify.get(
    '/payment-term-templates',
    { schema: listPaymentTermTemplatesSchema },
    controller.list.bind(controller),
  );

  fastify.get(
    '/payment-term-templates/:id',
    { schema: getPaymentTermTemplateSchema },
    controller.getById.bind(controller),
  );

  fastify.post(
    '/payment-term-templates',
    { schema: createPaymentTermTemplateSchema },
    controller.create.bind(controller),
  );

  fastify.patch(
    '/payment-term-templates/:id',
    { schema: updatePaymentTermTemplateSchema },
    controller.update.bind(controller),
  );

  fastify.delete(
    '/payment-term-templates/:id',
    { schema: deletePaymentTermTemplateSchema },
    controller.remove.bind(controller),
  );
}
