import { UniqueConstraintError } from 'sequelize';
import { NotFoundError, ValidationError } from '#configs/error/index.js';
import { computeItemTotals } from '#common/money.js';

function toPlain(instance) {
  return typeof instance.toJSON === 'function' ? instance.toJSON() : instance;
}

export class EstimateService {
  constructor({
    sequelize,
    jobRepository,
    estimateRepository,
    customerLineItemRepository,
    taxRepository,
    paymentTermTemplateRepository,
    basicEstimateTemplateRepository,
    noteRepository,
  }) {
    this.sequelize = sequelize;
    this.jobRepository = jobRepository;
    this.estimateRepository = estimateRepository;
    this.customerLineItemRepository = customerLineItemRepository;
    this.taxRepository = taxRepository;
    this.paymentTermTemplateRepository = paymentTermTemplateRepository;
    this.basicEstimateTemplateRepository = basicEstimateTemplateRepository;
    this.noteRepository = noteRepository;
  }

  async ensureJobExists(jobId) {
    const job = await this.jobRepository.findById(jobId);

    if (!job) {
      throw new NotFoundError(`Job ${jobId} not found`);
    }
  }

  async loadSourceTemplate(basicEstimateTemplateId) {
    if (basicEstimateTemplateId === undefined) {
      return null;
    }

    const template =
      await this.basicEstimateTemplateRepository.findByIdWithItems(
        basicEstimateTemplateId,
      );

    if (!template) {
      throw new ValidationError(
        `BasicEstimateTemplate ${basicEstimateTemplateId} not found`,
      );
    }

    return template;
  }

  async resolveTerms({ terms, termsSourceTemplateId }, template) {
    if (terms !== undefined) {
      return { terms };
    }

    if (termsSourceTemplateId === null) {
      return { terms: null };
    }

    if (termsSourceTemplateId !== undefined) {
      const paymentTermTemplate =
        await this.paymentTermTemplateRepository.findById(
          termsSourceTemplateId,
        );

      if (!paymentTermTemplate) {
        throw new ValidationError(
          `PaymentTermTemplate ${termsSourceTemplateId} not found`,
        );
      }

      return { terms: paymentTermTemplate.description };
    }

    if (template?.terms) {
      return { terms: template.terms };
    }

    return { terms: null };
  }

  resolveItems(items, template) {
    if (items !== undefined) {
      return items;
    }

    if (template) {
      return template.items.map((item) => ({
        itemName: item.serviceName,
        description: item.description ?? null,
        cost: item.cost,
        qty: item.qty,
        tax1Id: item.tax1Id,
        tax2Id: item.tax2Id,
      }));
    }

    return [];
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

  resolvePairedFallback(data, template, valueKey, typeKey) {
    if (data[valueKey] !== undefined || data[typeKey] !== undefined) {
      return { [valueKey]: data[valueKey], [typeKey]: data[typeKey] };
    }

    if (template) {
      return { [valueKey]: template[valueKey], [typeKey]: template[typeKey] };
    }

    return {};
  }

  async resolveItemsForPersist(items = []) {
    const persistItems = [];

    for (const { tax1Id, tax2Id, ...item } of items) {
      const taxSlots = await this.buildTaxSlots(tax1Id, tax2Id);
      const { subtotal, total } = computeItemTotals(
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

    const estimate = await this.estimateRepository.findByJobId(jobId);

    if (!estimate) {
      throw new NotFoundError(`Job ${jobId} has no estimate`);
    }

    const items = await this.customerLineItemRepository.findAllForParent(
      'estimate',
      estimate.id,
    );

    return { ...toPlain(estimate), items };
  }

  async create(jobId, { items, basicEstimateTemplateId, ...data }) {
    await this.ensureJobExists(jobId);

    const existing = await this.estimateRepository.findByJobId(jobId);

    if (existing) {
      throw new ValidationError(`Job ${jobId} already has an estimate`);
    }

    const template = await this.loadSourceTemplate(basicEstimateTemplateId);
    const terms = await this.resolveTerms(data, template);
    const discount = this.resolvePairedFallback(
      data,
      template,
      'discountValue',
      'discountType',
    );
    const deposit = this.resolvePairedFallback(
      data,
      template,
      'depositValue',
      'depositType',
    );
    const resolvedItems = await this.resolveItemsForPersist(
      this.resolveItems(items, template),
    );

    try {
      return await this.sequelize.transaction(async (transaction) => {
        const estimate = await this.estimateRepository.create(
          {
            jobId,
            type: data.type,
            status: data.status,
            estimateNumber: data.estimateNumber,
            poNumber: data.poNumber,
            dateIssued: data.dateIssued,
            ...discount,
            ...deposit,
            ...terms,
          },
          { transaction },
        );

        await this.customerLineItemRepository.bulkCreate(
          resolvedItems.map((item, index) => ({
            ...item,
            parentType: 'estimate',
            parentId: estimate.id,
            sortOrder: index,
          })),
          { transaction },
        );

        if (template?.notes) {
          await this.noteRepository.create(
            {
              parentId: String(estimate.id),
              type: 'Estimate',
              body: template.notes,
              authorUserId: null,
            },
            { transaction },
          );
        }

        const createdItems =
          await this.customerLineItemRepository.findAllForParent(
            'estimate',
            estimate.id,
            { transaction },
          );

        return { ...toPlain(estimate), items: createdItems };
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new ValidationError(`Job ${jobId} already has an estimate`);
      }
      throw error;
    }
  }

  async update(jobId, { items, ...data }) {
    await this.ensureJobExists(jobId);

    const estimate = await this.estimateRepository.findByJobId(jobId);

    if (!estimate) {
      throw new NotFoundError(`Job ${jobId} has no estimate`);
    }

    const payload = { ...data };

    if (data.terms !== undefined || data.termsSourceTemplateId !== undefined) {
      Object.assign(payload, await this.resolveTerms(data, null));
    }

    const resolvedItems =
      items !== undefined
        ? await this.resolveItemsForPersist(items)
        : undefined;

    return this.sequelize.transaction(async (transaction) => {
      if (Object.keys(payload).length > 0) {
        await this.estimateRepository.update(estimate.id, payload, {
          transaction,
        });
      }

      if (resolvedItems !== undefined) {
        await this.customerLineItemRepository.deleteAllForParent(
          'estimate',
          estimate.id,
          { transaction },
        );
        await this.customerLineItemRepository.bulkCreate(
          resolvedItems.map((item, index) => ({
            ...item,
            parentType: 'estimate',
            parentId: estimate.id,
            sortOrder: index,
          })),
          { transaction },
        );
      }

      const updatedItems =
        await this.customerLineItemRepository.findAllForParent(
          'estimate',
          estimate.id,
          { transaction },
        );
      const updatedEstimate = await this.estimateRepository.findById(
        estimate.id,
        { transaction },
      );

      return { ...toPlain(updatedEstimate), items: updatedItems };
    });
  }

  async remove(jobId) {
    await this.ensureJobExists(jobId);

    const estimate = await this.estimateRepository.findByJobId(jobId);

    if (!estimate) {
      throw new NotFoundError(`Job ${jobId} has no estimate`);
    }

    return this.sequelize.transaction(async (transaction) => {
      await this.customerLineItemRepository.deleteAllForParent(
        'estimate',
        estimate.id,
        { transaction },
      );
      await this.noteRepository.deleteAllForParent('Estimate', estimate.id, {
        transaction,
      });

      return this.estimateRepository.delete(estimate.id, { transaction });
    });
  }
}
