import { CONTROLLER_KEYS } from '#constants/singleton.js';
import { deleteNoteSchema } from '#schemas/note.schema.js';

export default async function noteRouter(fastify) {
  const controller = fastify.diContainer.resolve(
    CONTROLLER_KEYS.noteController,
  );

  fastify.delete(
    '/notes/:id',
    { schema: deleteNoteSchema },
    controller.remove.bind(controller),
  );
}
