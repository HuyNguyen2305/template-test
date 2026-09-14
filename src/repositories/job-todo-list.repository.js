import { Baserepository } from '#common/base-repository.js';

export class JobTodoListRepository extends Baserepository {
  constructor({ jobTodoListModel }) {
    super(jobTodoListModel);
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
