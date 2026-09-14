import { Baserepository } from '#common/base-repository.js';

export class NoteRepository extends Baserepository {
  constructor({ noteModel }) {
    super(noteModel);
  }

  async findAllForParent(type, parentId, options = {}) {
    return this.setSchema().findAll({
      where: { type, parentId: String(parentId) },
      order: [['createdAt', 'ASC']],
      ...options,
    });
  }

  async deleteAllForParent(type, parentId, options = {}) {
    return this.setSchema().destroy({
      where: { type, parentId: String(parentId) },
      ...options,
    });
  }
}
