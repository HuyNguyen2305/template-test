import { describe, expect, test } from '@jest/globals';
import { TaxRepository } from '#repositories/tax.repository.js';
import { Baserepository } from '#common/base-repository.js';

describe('TaxRepository', () => {
  test('wires the injected taxModel into the base repository', () => {
    const taxModel = { schema: () => taxModel };

    const repository = new TaxRepository({ taxModel });

    expect(repository).toBeInstanceOf(Baserepository);
    expect(repository.model).toBe(taxModel);
  });
});
