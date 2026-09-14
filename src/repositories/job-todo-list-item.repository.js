import { Baserepository } from '#common/base-repository.js';

export class JobTodoListItemRepository extends Baserepository {
  constructor({ jobTodoListItemModel }) {
    super(jobTodoListItemModel);
  }

  async deleteAllForList(jobTodoListId, options = {}) {
    return this.setSchema().destroy({
      where: { jobTodoListId },
      ...options,
    });
  }

  async bulkCreate(items, options = {}) {
    return this.setSchema().bulkCreate(items, options);
  }
}
