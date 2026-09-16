import { Baserepository } from '#common/base-repository.js';

export class CustomerLineItemRepository extends Baserepository {
  constructor({ customerLineItemModel }) {
    super(customerLineItemModel);
  }

  async findAllForParent(parentType, parentId, options = {}) {
    const { where, ...rest } = options;
    return this.findAll({
      order: [['sortOrder', 'ASC']],
      ...rest,
      where: { parentType, parentId, ...where },
    });
  }

  async deleteAllForParent(parentType, parentId, options = {}) {
    const { where, ...rest } = options;
    return this.setSchema().destroy({
      ...rest,
      where: { parentType, parentId, ...where },
    });
  }

  async bulkCreate(items, options = {}) {
    return this.setSchema().bulkCreate(items, options);
  }
}
