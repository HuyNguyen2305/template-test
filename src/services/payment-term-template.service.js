import { NotFoundError, ValidationError } from '#configs/error/index.js';

function formatNumber(value) {
  return String(Number(value));
}

function generateSummary({
  dueDateValue,
  dueDateUnit,
  lateFeeValue,
  lateFeeUnit,
}) {
  const dueDate = formatNumber(dueDateValue);
  const lateFee = formatNumber(lateFeeValue);

  return `Net ${dueDate}, Due date: ${dueDate} ${dueDateUnit.toLowerCase()}, Late payment fee ${lateFee}${lateFeeUnit}`;
}

function generateDescription({
  dueDateValue,
  dueDateUnit,
  lateFeeValue,
  lateFeeUnit,
}) {
  const dueDate = formatNumber(dueDateValue);
  const lateFee = formatNumber(lateFeeValue);

  return `Net ${dueDate} Terms: Payment is due within ${dueDate} ${dueDateUnit.toLowerCase()} from the invoice date. Invoices that are not settled within this period will incur a late payment fee of ${lateFee}${lateFeeUnit}.`;
}

export class PaymentTermTemplateService {
  constructor({ paymentTermTemplateRepository, taxRepository }) {
    this.paymentTermTemplateRepository = paymentTermTemplateRepository;
    this.taxRepository = taxRepository;
  }

  async list() {
    return this.paymentTermTemplateRepository.findAll();
  }

  async getById(id) {
    const paymentTermTemplate =
      await this.paymentTermTemplateRepository.findById(id);

    if (!paymentTermTemplate) {
      throw new NotFoundError(`Payment term template ${id} not found`);
    }

    return paymentTermTemplate;
  }

  async validateTaxIds({ tax1Id, tax2Id }) {
    for (const taxId of [tax1Id, tax2Id]) {
      if (taxId === undefined || taxId === null) {
        continue;
      }

      const tax = await this.taxRepository.findById(taxId);

      if (!tax) {
        throw new ValidationError(`Tax ${taxId} not found`);
      }
    }
  }

  async create(data) {
    await this.validateTaxIds(data);

    const name = data.name ?? generateSummary(data);
    const description = data.description ?? generateDescription(data);

    return this.paymentTermTemplateRepository.create({
      ...data,
      name,
      description,
    });
  }

  async update(id, data) {
    const current = await this.getById(id);
    await this.validateTaxIds(data);

    const payload = { ...data };
    const merged = {
      dueDateValue: data.dueDateValue ?? current.dueDateValue,
      dueDateUnit: data.dueDateUnit ?? current.dueDateUnit,
      lateFeeValue: data.lateFeeValue ?? current.lateFeeValue,
      lateFeeUnit: data.lateFeeUnit ?? current.lateFeeUnit,
    };

    if (data.name === undefined) {
      payload.name = generateSummary(merged);
    }

    if (data.description === undefined) {
      payload.description = generateDescription(merged);
    }

    return this.paymentTermTemplateRepository.update(id, payload);
  }

  async remove(id) {
    await this.getById(id);

    return this.paymentTermTemplateRepository.delete(id);
  }
}
