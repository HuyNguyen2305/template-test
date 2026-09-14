export class BasicEstimateTemplateController {
  constructor({ basicEstimateTemplateService }) {
    this.basicEstimateTemplateService = basicEstimateTemplateService;
  }

  async list(request, reply) {
    const data = await this.basicEstimateTemplateService.list();
    reply.send({
      success: true,
      message: 'Basic estimate templates fetched',
      data,
    });
  }

  async getById(request, reply) {
    const data = await this.basicEstimateTemplateService.getById(
      request.params.id,
    );
    reply.send({
      success: true,
      message: 'Basic estimate template fetched',
      data,
    });
  }

  async create(request, reply) {
    const data = await this.basicEstimateTemplateService.create(request.body);
    reply.status(201).send({
      success: true,
      message: 'Basic estimate template created',
      data,
    });
  }

  async update(request, reply) {
    const data = await this.basicEstimateTemplateService.update(
      request.params.id,
      request.body,
    );
    reply.send({
      success: true,
      message: 'Basic estimate template updated',
      data,
    });
  }

  async remove(request, reply) {
    await this.basicEstimateTemplateService.remove(request.params.id);
    reply.send({
      success: true,
      message: 'Basic estimate template deleted',
      data: null,
    });
  }
}
