import { Baserepository } from '#common/base-repository.js';

export class CustomerLineItemRepository extends Baserepository {
  constructor({ customerLineItemModel }) {
    super(customerLineItemModel);
  }

  async findAllForParent(parentType, parentId, options = {}) {
    return this.findAll({
      where: { parentType, parentId },
      order: [['sortOrder', 'ASC']],
      ...options,
    });
  }

  async deleteAllForParent(parentType, parentId, options = {}) {
    return this.setSchema().destroy({
      where: { parentType, parentId },
      ...options,
    });
  }

  async bulkCreate(items, options = {}) {
    return this.setSchema().bulkCreate(items, options);
  }
}
