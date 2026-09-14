export class InvoiceController {
  constructor({ invoiceService }) {
    this.invoiceService = invoiceService;
  }

  async getByJobId(request, reply) {
    const data = await this.invoiceService.getByJobId(request.params.jobId);
    reply.send({ success: true, message: 'Invoice fetched', data });
  }

  async create(request, reply) {
    const data = await this.invoiceService.create(
      request.params.jobId,
      request.body,
    );
    reply.status(201).send({ success: true, message: 'Invoice created', data });
  }

  async update(request, reply) {
    const data = await this.invoiceService.update(
      request.params.jobId,
      request.body,
    );
    reply.send({ success: true, message: 'Invoice updated', data });
  }

  async remove(request, reply) {
    await this.invoiceService.remove(request.params.jobId);
    reply.send({ success: true, message: 'Invoice deleted', data: null });
  }
}
