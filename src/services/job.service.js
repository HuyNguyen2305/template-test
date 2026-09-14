import { NotFoundError } from '#configs/error/index.js';

export class JobService {
  constructor({
    sequelize,
    jobRepository,
    invoiceRepository,
    estimateRepository,
    customerLineItemRepository,
    noteRepository,
  }) {
    this.sequelize = sequelize;
    this.jobRepository = jobRepository;
    this.invoiceRepository = invoiceRepository;
    this.estimateRepository = estimateRepository;
    this.customerLineItemRepository = customerLineItemRepository;
    this.noteRepository = noteRepository;
  }

  async list() {
    return this.jobRepository.findAll();
  }

  async getById(id) {
    const job = await this.jobRepository.findById(id);

    if (!job) {
      throw new NotFoundError(`Job ${id} not found`);
    }

    return job;
  }

  async create(data) {
    return this.jobRepository.create(data);
  }

  async update(id, data) {
    const current = await this.getById(id);

    if (Object.keys(data).length === 0) {
      return current;
    }

    return this.jobRepository.update(id, data);
  }

  async remove(id) {
    await this.getById(id);

    return this.sequelize.transaction(async (transaction) => {
      const invoice = await this.invoiceRepository.findByJobId(id, {
        transaction,
      });

      if (invoice) {
        await this.customerLineItemRepository.deleteAllForParent(
          'invoice',
          invoice.id,
          { transaction },
        );
        await this.noteRepository.deleteAllForParent('Invoice', invoice.id, {
          transaction,
        });
      }

      const estimate = await this.estimateRepository.findByJobId(id, {
        transaction,
      });

      if (estimate) {
        await this.customerLineItemRepository.deleteAllForParent(
          'estimate',
          estimate.id,
          { transaction },
        );
        await this.noteRepository.deleteAllForParent('Estimate', estimate.id, {
          transaction,
        });
      }

      await this.noteRepository.deleteAllForParent('Job', id, { transaction });

      return this.jobRepository.delete(id, { transaction });
    });
  }
}
