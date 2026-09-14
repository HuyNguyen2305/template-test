import { NotFoundError } from '#configs/error/index.js';

export class TaxService {
  constructor({ taxRepository }) {
    this.taxRepository = taxRepository;
  }

  async list() {
    return this.taxRepository.findAll();
  }

  async getById(id) {
    const tax = await this.taxRepository.findById(id);

    if (!tax) {
      throw new NotFoundError(`Tax ${id} not found`);
    }

    return tax;
  }

  async create(data) {
    return this.taxRepository.create(data);
  }

  async update(id, data) {
    const current = await this.getById(id);

    if (Object.keys(data).length === 0) {
      return current;
    }

    return this.taxRepository.update(id, data);
  }

  async remove(id) {
    await this.getById(id);

    return this.taxRepository.delete(id);
  }
}
