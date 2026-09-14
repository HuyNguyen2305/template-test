import { Baserepository } from '#common/base-repository.js';

export class InvoiceRepository extends Baserepository {
  constructor({ invoiceModel }) {
    super(invoiceModel);
  }

  async findByJobId(jobId, options = {}) {
    return this.setSchema().findOne({
      where: { jobId },
      ...options,
    });
  }
}
