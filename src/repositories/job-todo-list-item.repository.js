import { Baserepository } from '#common/base-repository.js';

export class JobTodoListItemRepository extends Baserepository {
  constructor({ jobTodoListItemModel }) {
    super(jobTodoListItemModel);
  }

  async deleteAllForList(jobTodoListId, options = {}) {
    const { where, ...rest } = options;
    return this.setSchema().destroy({
      ...rest,
      where: { jobTodoListId, ...where },
    });
  }

  async bulkCreate(items, options = {}) {
    return this.setSchema().bulkCreate(items, options);
  }
}
