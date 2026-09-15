import { NotFoundError, ValidationError } from '#configs/error/index.js';

function formatNumber(value) {
  return String(Number(value));
}

function generateSummary(
  { dueDateValue, dueDateUnit, lateFeeValue, lateFeeUnit },
  taxNames = [],
) {
  const dueDate = formatNumber(dueDateValue);
  const lateFee = formatNumber(lateFeeValue);
  const taxSuffix =
    taxNames.length > 0 ? ` plus ${taxNames.join(' and ')}` : '';

  return `Net ${dueDate}, Due date: ${dueDate} ${dueDateUnit.toLowerCase()}, Late payment fee ${lateFee}${lateFeeUnit}${taxSuffix}`;
}

function generateDescription(
  { dueDateValue, dueDateUnit, lateFeeValue, lateFeeUnit },
  taxNames = [],
) {
  const dueDate = formatNumber(dueDateValue);
  const lateFee = formatNumber(lateFeeValue);
  const taxSuffix =
    taxNames.length > 0 ? ` plus applicable ${taxNames.join(' and ')}` : '';

  return `Net ${dueDate} Terms: Payment is due within ${dueDate} ${dueDateUnit.toLowerCase()} from the invoice date. Invoices that are not settled within this period will incur a late payment fee of ${lateFee}${lateFeeUnit}${taxSuffix}.`;
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

  async resolveTax(taxId) {
    if (taxId === undefined || taxId === null) {
      return null;
    }

    const tax = await this.taxRepository.findById(taxId);

    if (!tax) {
      throw new ValidationError(`Tax ${taxId} not found`);
    }

    return tax;
  }

  async create(data) {
    const tax1 = await this.resolveTax(data.tax1Id);
    const tax2 = await this.resolveTax(data.tax2Id);
    const taxNames = [tax1, tax2].filter(Boolean).map((tax) => tax.name);

    const name = data.name ?? generateSummary(data, taxNames);
    const description = data.description ?? generateDescription(data, taxNames);

    return this.paymentTermTemplateRepository.create({
      ...data,
      name,
      description,
    });
  }

  async update(id, data) {
    const current = await this.getById(id);

    const tax1 =
      data.tax1Id !== undefined
        ? await this.resolveTax(data.tax1Id)
        : await this.resolveTax(current.tax1Id);
    const tax2 =
      data.tax2Id !== undefined
        ? await this.resolveTax(data.tax2Id)
        : await this.resolveTax(current.tax2Id);
    const taxNames = [tax1, tax2].filter(Boolean).map((tax) => tax.name);

    const payload = { ...data };
    const merged = {
      dueDateValue: data.dueDateValue ?? current.dueDateValue,
      dueDateUnit: data.dueDateUnit ?? current.dueDateUnit,
      lateFeeValue: data.lateFeeValue ?? current.lateFeeValue,
      lateFeeUnit: data.lateFeeUnit ?? current.lateFeeUnit,
    };

    if (data.name === undefined) {
      payload.name = generateSummary(merged, taxNames);
    }

    if (data.description === undefined) {
      payload.description = generateDescription(merged, taxNames);
    }

    return this.paymentTermTemplateRepository.update(id, payload);
  }

  async remove(id) {
    await this.getById(id);

    return this.paymentTermTemplateRepository.delete(id);
  }
}
