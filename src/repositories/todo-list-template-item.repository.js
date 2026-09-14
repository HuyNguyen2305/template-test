import { Baserepository } from '#common/base-repository.js';

export class TodoListTemplateItemRepository extends Baserepository {
  constructor({ todoListTemplateItemModel }) {
    super(todoListTemplateItemModel);
  }

  async deleteAllForList(todoListTemplateId, options = {}) {
    return this.setSchema().destroy({
      where: { todoListTemplateId },
      ...options,
    });
  }

  async bulkCreate(items, options = {}) {
    return this.setSchema().bulkCreate(items, options);
  }
}
