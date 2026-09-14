import { Baserepository } from '#common/base-repository.js';

export class BasicEstimateTemplateItemRepository extends Baserepository {
  constructor({ basicEstimateTemplateItemModel }) {
    super(basicEstimateTemplateItemModel);
  }

  async deleteAllForTemplate(basicEstimateTemplateId, options = {}) {
    return this.setSchema().destroy({
      where: { basicEstimateTemplateId },
      ...options,
    });
  }

  async bulkCreate(items, options = {}) {
    return this.setSchema().bulkCreate(items, options);
  }
}
