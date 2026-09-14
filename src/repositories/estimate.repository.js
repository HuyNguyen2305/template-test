import { Baserepository } from '#common/base-repository.js';

export class EstimateRepository extends Baserepository {
  constructor({ estimateModel }) {
    super(estimateModel);
  }

  async findByJobId(jobId, options = {}) {
    return this.setSchema().findOne({
      where: { jobId },
      ...options,
    });
  }
}
