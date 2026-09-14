import { Op } from 'sequelize';
import { Baserepository } from '#common/base-repository.js';

export class NoteTemplateRepository extends Baserepository {
  constructor({ noteTemplateModel }) {
    super(noteTemplateModel);
  }

  async search({ typeKey, query } = {}, options = {}) {
    const where = {};

    if (typeKey) {
      where.typeKey = typeKey;
    }

    if (query) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${query}%` } },
        { body: { [Op.iLike]: `%${query}%` } },
      ];
    }

    return this.findAll({ where, ...options });
  }
}
