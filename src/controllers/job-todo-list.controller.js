export class JobTodoListController {
  constructor({ jobTodoListService }) {
    this.jobTodoListService = jobTodoListService;
  }

  async list(request, reply) {
    const data = await this.jobTodoListService.list(request.params.jobId);
    reply.send({ success: true, message: 'Job todo lists fetched', data });
  }

  async getById(request, reply) {
    const data = await this.jobTodoListService.getById(
      request.params.jobId,
      request.params.id,
    );
    reply.send({ success: true, message: 'Job todo list fetched', data });
  }

  async create(request, reply) {
    const data = await this.jobTodoListService.create(
      request.params.jobId,
      request.body,
    );
    reply
      .status(201)
      .send({ success: true, message: 'Job todo list created', data });
  }

  async update(request, reply) {
    const data = await this.jobTodoListService.update(
      request.params.jobId,
      request.params.id,
      request.body,
    );
    reply.send({ success: true, message: 'Job todo list updated', data });
  }

  async remove(request, reply) {
    await this.jobTodoListService.remove(
      request.params.jobId,
      request.params.id,
    );
    reply.send({ success: true, message: 'Job todo list deleted', data: null });
  }
}
