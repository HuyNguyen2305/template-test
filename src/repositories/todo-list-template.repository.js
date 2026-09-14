import { Baserepository } from '#common/base-repository.js';

export class TodoListTemplateRepository extends Baserepository {
  constructor({ todoListTemplateModel }) {
    super(todoListTemplateModel);
  }

  itemsInclude() {
    return [
      { association: 'items', separate: true, order: [['sortOrder', 'ASC']] },
    ];
  }

  async findAllWithItems(options = {}) {
    return this.findAll({ include: this.itemsInclude(), ...options });
  }

  async findByIdWithItems(id, options = {}) {
    return this.findById(id, { include: this.itemsInclude(), ...options });
  }
}
