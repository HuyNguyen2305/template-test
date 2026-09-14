import { CONTROLLER_KEYS } from '#constants/singleton.js';
import {
  listNoteTemplatesSchema,
  getNoteTemplateSchema,
  createNoteTemplateSchema,
  updateNoteTemplateSchema,
  deleteNoteTemplateSchema,
} from '#schemas/note-template.schema.js';

export default async function noteTemplateRouter(fastify) {
  const controller = fastify.diContainer.resolve(
    CONTROLLER_KEYS.noteTemplateController,
  );

  fastify.get(
    '/note-templates',
    { schema: listNoteTemplatesSchema },
    controller.list.bind(controller),
  );

  fastify.get(
    '/note-templates/:id',
    { schema: getNoteTemplateSchema },
    controller.getById.bind(controller),
  );

  fastify.post(
    '/note-templates',
    { schema: createNoteTemplateSchema },
    controller.create.bind(controller),
  );

  fastify.patch(
    '/note-templates/:id',
    { schema: updateNoteTemplateSchema },
    controller.update.bind(controller),
  );

  fastify.delete(
    '/note-templates/:id',
    { schema: deleteNoteTemplateSchema },
    controller.remove.bind(controller),
  );
}
