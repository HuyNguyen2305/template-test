export class EstimateController {
  constructor({ estimateService }) {
    this.estimateService = estimateService;
  }

  async getByJobId(request, reply) {
    const data = await this.estimateService.getByJobId(request.params.jobId);
    reply.send({ success: true, message: 'Estimate fetched', data });
  }

  async create(request, reply) {
    const data = await this.estimateService.create(
      request.params.jobId,
      request.body,
    );
    reply
      .status(201)
      .send({ success: true, message: 'Estimate created', data });
  }

  async update(request, reply) {
    const data = await this.estimateService.update(
      request.params.jobId,
      request.body,
    );
    reply.send({ success: true, message: 'Estimate updated', data });
  }

  async remove(request, reply) {
    await this.estimateService.remove(request.params.jobId);
    reply.send({ success: true, message: 'Estimate deleted', data: null });
  }
}
