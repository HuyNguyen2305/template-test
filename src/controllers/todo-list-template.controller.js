export class TodoListTemplateController {
  constructor({ todoListTemplateService }) {
    this.todoListTemplateService = todoListTemplateService;
  }

  async list(request, reply) {
    const data = await this.todoListTemplateService.list();
    reply.send({ success: true, message: 'Todo list templates fetched', data });
  }

  async getById(request, reply) {
    const data = await this.todoListTemplateService.getById(request.params.id);
    reply.send({ success: true, message: 'Todo list template fetched', data });
  }

  async create(request, reply) {
    const data = await this.todoListTemplateService.create(request.body);
    reply
      .status(201)
      .send({ success: true, message: 'Todo list template created', data });
  }

  async update(request, reply) {
    const data = await this.todoListTemplateService.update(
      request.params.id,
      request.body,
    );
    reply.send({ success: true, message: 'Todo list template updated', data });
  }

  async remove(request, reply) {
    await this.todoListTemplateService.remove(request.params.id);
    reply.send({
      success: true,
      message: 'Todo list template deleted',
      data: null,
    });
  }
}
