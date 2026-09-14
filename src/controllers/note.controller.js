export class NoteController {
  constructor({ noteService }) {
    this.noteService = noteService;
  }

  async listForJob(request, reply) {
    const data = await this.noteService.listForJob(request.params.jobId);
    reply.send({ success: true, message: 'Notes fetched', data });
  }

  async createForJob(request, reply) {
    const data = await this.noteService.createForJob(
      request.params.jobId,
      request.body,
    );
    reply.status(201).send({ success: true, message: 'Note created', data });
  }

  async listForInvoice(request, reply) {
    const data = await this.noteService.listForInvoice(request.params.jobId);
    reply.send({ success: true, message: 'Notes fetched', data });
  }

  async createForInvoice(request, reply) {
    const data = await this.noteService.createForInvoice(
      request.params.jobId,
      request.body,
    );
    reply.status(201).send({ success: true, message: 'Note created', data });
  }

  async listForEstimate(request, reply) {
    const data = await this.noteService.listForEstimate(request.params.jobId);
    reply.send({ success: true, message: 'Notes fetched', data });
  }

  async createForEstimate(request, reply) {
    const data = await this.noteService.createForEstimate(
      request.params.jobId,
      request.body,
    );
    reply.status(201).send({ success: true, message: 'Note created', data });
  }

  async remove(request, reply) {
    await this.noteService.remove(request.params.id);
    reply.send({ success: true, message: 'Note deleted', data: null });
  }
}
