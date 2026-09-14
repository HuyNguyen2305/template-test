export class JobController {
  constructor({ jobService }) {
    this.jobService = jobService;
  }

  async list(request, reply) {
    const data = await this.jobService.list();
    reply.send({ success: true, message: 'Jobs fetched', data });
  }

  async getById(request, reply) {
    const data = await this.jobService.getById(request.params.id);
    reply.send({ success: true, message: 'Job fetched', data });
  }

  async create(request, reply) {
    const data = await this.jobService.create(request.body);
    reply.status(201).send({ success: true, message: 'Job created', data });
  }

  async update(request, reply) {
    const data = await this.jobService.update(request.params.id, request.body);
    reply.send({ success: true, message: 'Job updated', data });
  }

  async remove(request, reply) {
    await this.jobService.remove(request.params.id);
    reply.send({ success: true, message: 'Job deleted', data: null });
  }
}
