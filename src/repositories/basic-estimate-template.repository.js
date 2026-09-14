import { Baserepository } from '#common/base-repository.js';

export class BasicEstimateTemplateRepository extends Baserepository {
  constructor({ basicEstimateTemplateModel }) {
    super(basicEstimateTemplateModel);
  }

  itemsInclude() {
    return [{ association: 'items', separate: true, order: [['id', 'ASC']] }];
  }

  async findAllWithItems(options = {}) {
    return this.findAll({ include: this.itemsInclude(), ...options });
  }

  async findByIdWithItems(id, options = {}) {
    return this.findById(id, { include: this.itemsInclude(), ...options });
  }
}
