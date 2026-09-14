import { describe, expect, test } from '@jest/globals';
import { JobRepository } from '#repositories/job.repository.js';
import { Baserepository } from '#common/base-repository.js';

describe('JobRepository', () => {
  test('wires the injected jobModel into the base repository', () => {
    const jobModel = { schema: () => jobModel };

    const repository = new JobRepository({ jobModel });

    expect(repository).toBeInstanceOf(Baserepository);
    expect(repository.model).toBe(jobModel);
  });
});
