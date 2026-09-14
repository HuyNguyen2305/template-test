import { Op } from 'sequelize';
import { Baserepository } from '#common/base-repository.js';

export class AllTemplateRepository extends Baserepository {
  constructor({ allTemplateModel }) {
    super(allTemplateModel);
  }

  async search({ category, query } = {}, options = {}) {
    const where = {};

    if (category) {
      where.category = category;
    }

    if (query) {
      where.name = { [Op.iLike]: `%${query}%` };
    }

    return this.findAll({ where, ...options });
  }
}
