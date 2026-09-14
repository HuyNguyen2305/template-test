import { describe, expect, test } from '@jest/globals';
import { PaymentTermTemplateRepository } from '#repositories/payment-term-template.repository.js';
import { Baserepository } from '#common/base-repository.js';

describe('PaymentTermTemplateRepository', () => {
  test('wires the injected paymentTermTemplateModel into the base repository', () => {
    const paymentTermTemplateModel = { schema: () => paymentTermTemplateModel };

    const repository = new PaymentTermTemplateRepository({
      paymentTermTemplateModel,
    });

    expect(repository).toBeInstanceOf(Baserepository);
    expect(repository.model).toBe(paymentTermTemplateModel);
  });
});
