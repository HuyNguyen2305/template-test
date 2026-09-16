import { Baserepository } from '#common/base-repository.js';

export class TodoListTemplateItemRepository extends Baserepository {
  constructor({ todoListTemplateItemModel }) {
    super(todoListTemplateItemModel);
  }

  async deleteAllForList(todoListTemplateId, options = {}) {
    const { where, ...rest } = options;
    return this.setSchema().destroy({
      ...rest,
      where: { todoListTemplateId, ...where },
    });
  }

  async bulkCreate(items, options = {}) {
    return this.setSchema().bulkCreate(items, options);
  }
}
