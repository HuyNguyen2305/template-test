export class AllTemplateController {
  constructor({ allTemplateService }) {
    this.allTemplateService = allTemplateService;
  }

  async list(request, reply) {
    const { category, query } = request.query;
    const data = await this.allTemplateService.list({ category, query });
    reply.send({ success: true, message: 'All templates fetched', data });
  }

  async getContent(request, reply) {
    const { sourceTable, id } = request.params;
    const data = await this.allTemplateService.getContent(sourceTable, id);
    reply.send({ success: true, message: 'Template content fetched', data });
  }
}
