import { Baserepository } from '#common/base-repository.js';

export class BasicEstimateTemplateItemRepository extends Baserepository {
  constructor({ basicEstimateTemplateItemModel }) {
    super(basicEstimateTemplateItemModel);
  }

  async deleteAllForTemplate(basicEstimateTemplateId, options = {}) {
    const { where, ...rest } = options;
    return this.setSchema().destroy({
      ...rest,
      where: { basicEstimateTemplateId, ...where },
    });
  }

  async bulkCreate(items, options = {}) {
    return this.setSchema().bulkCreate(items, options);
  }
}
