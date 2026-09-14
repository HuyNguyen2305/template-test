import { CONTROLLER_KEYS } from '#constants/singleton.js';
import {
  listTaxesSchema,
  getTaxSchema,
  createTaxSchema,
  updateTaxSchema,
  deleteTaxSchema,
} from '#schemas/tax.schema.js';

export default async function taxRouter(fastify) {
  const controller = fastify.diContainer.resolve(CONTROLLER_KEYS.taxController);

  fastify.get(
    '/taxes',
    { schema: listTaxesSchema },
    controller.list.bind(controller),
  );

  fastify.get(
    '/taxes/:id',
    { schema: getTaxSchema },
    controller.getById.bind(controller),
  );

  fastify.post(
    '/taxes',
    { schema: createTaxSchema },
    controller.create.bind(controller),
  );

  fastify.patch(
    '/taxes/:id',
    { schema: updateTaxSchema },
    controller.update.bind(controller),
  );

  fastify.delete(
    '/taxes/:id',
    { schema: deleteTaxSchema },
    controller.remove.bind(controller),
  );
}
