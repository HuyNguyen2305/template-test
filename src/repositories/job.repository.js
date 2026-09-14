import { Baserepository } from '#common/base-repository.js';

export class JobRepository extends Baserepository {
  constructor({ jobModel }) {
    super(jobModel);
  }
}
