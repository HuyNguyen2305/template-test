import { getSchemaName } from '#common/request-context.js';

export class Baserepository {
  constructor(model) {
    this.model = model;
  }

  setSchema() {
    return this.model.schema(getSchemaName());
  }

  async findAll(options = {}) {
    return this.setSchema().findAll(options);
  }

  async findById(id, options = {}) {
    return this.setSchema().findByPk(id, options);
  }

  async create(data, options = {}) {
    return this.setSchema().create(data, options);
  }

  async update(id, data, options = {}) {
    const [, [updated]] = await this.setSchema().update(data, {
      where: { id },
      returning: true,
      ...options,
    });
    return updated;
  }

  async delete(id, options = {}) {
    return this.setSchema().destroy({ where: { id }, ...options });
  }
}
