import { Baserepository } from '#common/base-repository.js';

export class NoteRepository extends Baserepository {
  constructor({ noteModel }) {
    super(noteModel);
  }

  async findAllForParent(type, parentId, options = {}) {
    const { where, ...rest } = options;
    return this.setSchema().findAll({
      order: [['createdAt', 'ASC']],
      ...rest,
      where: { type, parentId: String(parentId), ...where },
    });
  }

  async deleteAllForParent(type, parentId, options = {}) {
    const { where, ...rest } = options;
    return this.setSchema().destroy({
      ...rest,
      where: { type, parentId: String(parentId), ...where },
    });
  }
}
