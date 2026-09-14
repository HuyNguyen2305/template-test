import { NotFoundError } from '#configs/error/index.js';

export class TodoListTemplateService {
  constructor({
    sequelize,
    todoListTemplateRepository,
    todoListTemplateItemRepository,
  }) {
    this.sequelize = sequelize;
    this.todoListTemplateRepository = todoListTemplateRepository;
    this.todoListTemplateItemRepository = todoListTemplateItemRepository;
  }

  async list() {
    return this.todoListTemplateRepository.findAllWithItems();
  }

  async getById(id) {
    const todoListTemplate =
      await this.todoListTemplateRepository.findByIdWithItems(id);

    if (!todoListTemplate) {
      throw new NotFoundError(`Todo list template ${id} not found`);
    }

    return todoListTemplate;
  }

  async create({ name, items = [] }) {
    return this.sequelize.transaction(async (transaction) => {
      const todoListTemplate = await this.todoListTemplateRepository.create(
        { name },
        { transaction },
      );

      await this.todoListTemplateItemRepository.bulkCreate(
        items.map((item, index) => ({
          todoListTemplateId: todoListTemplate.id,
          text: item.text,
          sortOrder: index,
        })),
        { transaction },
      );

      return this.todoListTemplateRepository.findByIdWithItems(
        todoListTemplate.id,
        {
          transaction,
        },
      );
    });
  }

  async update(id, { name, items }) {
    await this.getById(id);

    return this.sequelize.transaction(async (transaction) => {
      if (name !== undefined) {
        await this.todoListTemplateRepository.update(
          id,
          { name },
          { transaction },
        );
      }

      if (items !== undefined) {
        await this.todoListTemplateItemRepository.deleteAllForList(id, {
          transaction,
        });
        await this.todoListTemplateItemRepository.bulkCreate(
          items.map((item, index) => ({
            todoListTemplateId: id,
            text: item.text,
            sortOrder: index,
          })),
          { transaction },
        );
      }

      return this.todoListTemplateRepository.findByIdWithItems(id, {
        transaction,
      });
    });
  }

  async remove(id) {
    await this.getById(id);

    return this.todoListTemplateRepository.delete(id);
  }
}
