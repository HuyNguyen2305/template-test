import { NotFoundError, ValidationError } from '#configs/error/index.js';

export class BasicEstimateTemplateService {
  constructor({
    sequelize,
    basicEstimateTemplateRepository,
    basicEstimateTemplateItemRepository,
    taxRepository,
  }) {
    this.sequelize = sequelize;
    this.basicEstimateTemplateRepository = basicEstimateTemplateRepository;
    this.basicEstimateTemplateItemRepository =
      basicEstimateTemplateItemRepository;
    this.taxRepository = taxRepository;
  }

  async list() {
    return this.basicEstimateTemplateRepository.findAllWithItems();
  }

  async getById(id) {
    const basicEstimateTemplate =
      await this.basicEstimateTemplateRepository.findByIdWithItems(id);

    if (!basicEstimateTemplate) {
      throw new NotFoundError(`Basic estimate template ${id} not found`);
    }

    return basicEstimateTemplate;
  }

  async validateItemTaxIds(items = []) {
    for (const item of items) {
      for (const taxId of [item.tax1Id, item.tax2Id]) {
        if (taxId === undefined || taxId === null) {
          continue;
        }

        const tax = await this.taxRepository.findById(taxId);

        if (!tax) {
          throw new ValidationError(`Tax ${taxId} not found`);
        }
      }
    }
  }

  async create({ items = [], ...data }) {
    await this.validateItemTaxIds(items);

    return this.sequelize.transaction(async (transaction) => {
      const basicEstimateTemplate =
        await this.basicEstimateTemplateRepository.create(data, {
          transaction,
        });

      await this.basicEstimateTemplateItemRepository.bulkCreate(
        items.map((item) => ({
          ...item,
          basicEstimateTemplateId: basicEstimateTemplate.id,
        })),
        { transaction },
      );

      return this.basicEstimateTemplateRepository.findByIdWithItems(
        basicEstimateTemplate.id,
        {
          transaction,
        },
      );
    });
  }

  async update(id, { items, ...data }) {
    await this.getById(id);

    if (items !== undefined) {
      await this.validateItemTaxIds(items);
    }

    return this.sequelize.transaction(async (transaction) => {
      if (Object.keys(data).length > 0) {
        await this.basicEstimateTemplateRepository.update(id, data, {
          transaction,
        });
      }

      if (items !== undefined) {
        await this.basicEstimateTemplateItemRepository.deleteAllForTemplate(
          id,
          { transaction },
        );
        await this.basicEstimateTemplateItemRepository.bulkCreate(
          items.map((item) => ({ ...item, basicEstimateTemplateId: id })),
          { transaction },
        );
      }

      return this.basicEstimateTemplateRepository.findByIdWithItems(id, {
        transaction,
      });
    });
  }

  async remove(id) {
    await this.getById(id);

    return this.basicEstimateTemplateRepository.delete(id);
  }
}
