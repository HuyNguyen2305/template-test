export class TaxController {
  constructor({ taxService }) {
    this.taxService = taxService;
  }

  async list(request, reply) {
    const data = await this.taxService.list();
    reply.send({ success: true, message: 'Taxes fetched', data });
  }

  async getById(request, reply) {
    const data = await this.taxService.getById(request.params.id);
    reply.send({ success: true, message: 'Tax fetched', data });
  }

  async create(request, reply) {
    const data = await this.taxService.create(request.body);
    reply.status(201).send({ success: true, message: 'Tax created', data });
  }

  async update(request, reply) {
    const data = await this.taxService.update(request.params.id, request.body);
    reply.send({ success: true, message: 'Tax updated', data });
  }

  async remove(request, reply) {
    await this.taxService.remove(request.params.id);
    reply.send({ success: true, message: 'Tax deleted', data: null });
  }
}
