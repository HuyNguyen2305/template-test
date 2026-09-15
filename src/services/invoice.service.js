import { UniqueConstraintError } from 'sequelize';
import { NotFoundError, ValidationError } from '#configs/error/index.js';

function toPlain(instance) {
  return typeof instance.toJSON === 'function' ? instance.toJSON() : instance;
}

export class InvoiceService {
  constructor({
    sequelize,
    jobRepository,
    invoiceRepository,
    customerLineItemRepository,
    taxRepository,
    paymentTermTemplateRepository,
    noteRepository,
  }) {
    this.sequelize = sequelize;
    this.jobRepository = jobRepository;
    this.invoiceRepository = invoiceRepository;
    this.customerLineItemRepository = customerLineItemRepository;
    this.taxRepository = taxRepository;
    this.paymentTermTemplateRepository = paymentTermTemplateRepository;
    this.noteRepository = noteRepository;
  }

  async ensureJobExists(jobId) {
    const job = await this.jobRepository.findById(jobId);

    if (!job) {
      throw new NotFoundError(`Job ${jobId} not found`);
    }
  }

  async resolveTerms({ terms, termsSourceTemplateId }) {
    if (terms !== undefined) {
      return { terms };
    }

    if (termsSourceTemplateId === undefined || termsSourceTemplateId === null) {
      return { terms: null };
    }

    const template = await this.paymentTermTemplateRepository.findById(
      termsSourceTemplateId,
    );

    if (!template) {
      throw new ValidationError(
        `PaymentTermTemplate ${termsSourceTemplateId} not found`,
      );
    }

    return { terms: template.description };
  }

  async buildTaxSlots(tax1Id, tax2Id) {
    const taxSlots = [];

    for (const taxId of [tax1Id, tax2Id]) {
      if (taxId === undefined || taxId === null) {
        continue;
      }

      const tax = await this.taxRepository.findById(taxId);

      if (!tax) {
        throw new ValidationError(`Tax ${taxId} not found`);
      }

      taxSlots.push({ taxId: tax.id, name: tax.name, rate: tax.rate });
    }

    return taxSlots;
  }

  computeItemTotals(cost, qty, taxSlots) {
    const subtotal = Math.round(Number(cost) * Number(qty) * 100) / 100;
    const taxSum = taxSlots.reduce(
      (sum, slot) => sum + (subtotal * Number(slot.rate)) / 100,
      0,
    );
    const total = Math.round((subtotal + taxSum) * 100) / 100;

    return { subtotal, total };
  }

  async resolveItemsForPersist(items = []) {
    const persistItems = [];

    for (const rawItem of items) {
      const item = { ...rawItem };
      const tax1Id = item.tax1Id;
      const tax2Id = item.tax2Id;
      delete item.tax1Id;
      delete item.tax2Id;
      delete item.oneTime;

      const taxSlots = await this.buildTaxSlots(tax1Id, tax2Id);
      const { subtotal, total } = this.computeItemTotals(
        item.cost,
        item.qty ?? 1,
        taxSlots,
      );

      persistItems.push({ ...item, taxSlots, subtotal, total });
    }

    return persistItems;
  }

  async getByJobId(jobId) {
    await this.ensureJobExists(jobId);

    const invoice = await this.invoiceRepository.findByJobId(jobId);

    if (!invoice) {
      throw new NotFoundError(`Job ${jobId} has no invoice`);
    }

    const items = await this.customerLineItemRepository.findAllForParent(
      'invoice',
      invoice.id,
    );

    return { ...toPlain(invoice), items };
  }

  async create(jobId, { items = [], ...data }) {
    await this.ensureJobExists(jobId);

    const existing = await this.invoiceRepository.findByJobId(jobId);

    if (existing) {
      throw new ValidationError(`Job ${jobId} already has an invoice`);
    }

    const terms = await this.resolveTerms(data);
    const resolvedItems = await this.resolveItemsForPersist(items);

    try {
      return await this.sequelize.transaction(async (transaction) => {
        const invoice = await this.invoiceRepository.create(
          {
            jobId,
            invoiceNumber: data.invoiceNumber,
            status: data.status,
            poNumber: data.poNumber,
            dateIssued: data.dateIssued,
            repeatsWithJob: data.repeatsWithJob,
            discountValue: data.discountValue,
            discountType: data.discountType,
            amountPaid: data.amountPaid,
            ...terms,
          },
          { transaction },
        );

        await this.customerLineItemRepository.bulkCreate(
          resolvedItems.map((item, index) => ({
            ...item,
            parentType: 'invoice',
            parentId: invoice.id,
            sortOrder: index,
          })),
          { transaction },
        );

        const createdItems =
          await this.customerLineItemRepository.findAllForParent(
            'invoice',
            invoice.id,
            { transaction },
          );

        return { ...toPlain(invoice), items: createdItems };
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new ValidationError(`Job ${jobId} already has an invoice`);
      }
      throw error;
    }
  }

  async update(jobId, { items, ...data }) {
    await this.ensureJobExists(jobId);

    const invoice = await this.invoiceRepository.findByJobId(jobId);

    if (!invoice) {
      throw new NotFoundError(`Job ${jobId} has no invoice`);
    }

    const payload = { ...data };

    if (data.terms !== undefined || data.termsSourceTemplateId !== undefined) {
      Object.assign(payload, await this.resolveTerms(data));
    }

    const resolvedItems =
      items !== undefined
        ? await this.resolveItemsForPersist(items)
        : undefined;

    return this.sequelize.transaction(async (transaction) => {
      if (Object.keys(payload).length > 0) {
        await this.invoiceRepository.update(invoice.id, payload, {
          transaction,
        });
      }

      if (resolvedItems !== undefined) {
        await this.customerLineItemRepository.deleteAllForParent(
          'invoice',
          invoice.id,
          { transaction },
        );
        await this.customerLineItemRepository.bulkCreate(
          resolvedItems.map((item, index) => ({
            ...item,
            parentType: 'invoice',
            parentId: invoice.id,
            sortOrder: index,
          })),
          { transaction },
        );
      }

      const updatedItems =
        await this.customerLineItemRepository.findAllForParent(
          'invoice',
          invoice.id,
          { transaction },
        );
      const updatedInvoice = await this.invoiceRepository.findById(invoice.id, {
        transaction,
      });

      return { ...toPlain(updatedInvoice), items: updatedItems };
    });
  }

  async remove(jobId) {
    await this.ensureJobExists(jobId);

    const invoice = await this.invoiceRepository.findByJobId(jobId);

    if (!invoice) {
      throw new NotFoundError(`Job ${jobId} has no invoice`);
    }

    return this.sequelize.transaction(async (transaction) => {
      await this.customerLineItemRepository.deleteAllForParent(
        'invoice',
        invoice.id,
        { transaction },
      );
      await this.noteRepository.deleteAllForParent('Invoice', invoice.id, {
        transaction,
      });

      return this.invoiceRepository.delete(invoice.id, { transaction });
    });
  }
}
