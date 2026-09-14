export class PaymentTermTemplateController {
  constructor({ paymentTermTemplateService }) {
    this.paymentTermTemplateService = paymentTermTemplateService;
  }

  async list(request, reply) {
    const data = await this.paymentTermTemplateService.list();
    reply.send({
      success: true,
      message: 'Payment term templates fetched',
      data,
    });
  }

  async getById(request, reply) {
    const data = await this.paymentTermTemplateService.getById(
      request.params.id,
    );
    reply.send({
      success: true,
      message: 'Payment term template fetched',
      data,
    });
  }

  async create(request, reply) {
    const data = await this.paymentTermTemplateService.create(request.body);
    reply
      .status(201)
      .send({ success: true, message: 'Payment term template created', data });
  }

  async update(request, reply) {
    const data = await this.paymentTermTemplateService.update(
      request.params.id,
      request.body,
    );
    reply.send({
      success: true,
      message: 'Payment term template updated',
      data,
    });
  }

  async remove(request, reply) {
    await this.paymentTermTemplateService.remove(request.params.id);
    reply.send({
      success: true,
      message: 'Payment term template deleted',
      data: null,
    });
  }
}
