export class NoteTemplateController {
  constructor({ noteTemplateService }) {
    this.noteTemplateService = noteTemplateService;
  }

  async list(request, reply) {
    const { typeKey, query } = request.query;
    const data = await this.noteTemplateService.list({ typeKey, query });
    reply.send({ success: true, message: 'Note templates fetched', data });
  }

  async getById(request, reply) {
    const data = await this.noteTemplateService.getById(request.params.id);
    reply.send({ success: true, message: 'Note template fetched', data });
  }

  async create(request, reply) {
    const data = await this.noteTemplateService.create(request.body);
    reply
      .status(201)
      .send({ success: true, message: 'Note template created', data });
  }

  async update(request, reply) {
    const data = await this.noteTemplateService.update(
      request.params.id,
      request.body,
    );
    reply.send({ success: true, message: 'Note template updated', data });
  }

  async remove(request, reply) {
    await this.noteTemplateService.remove(request.params.id);
    reply.send({ success: true, message: 'Note template deleted', data: null });
  }
}
