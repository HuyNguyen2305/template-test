import { NotFoundError, ValidationError } from '#configs/error/index.js';

export class JobTodoListService {
  constructor({
    sequelize,
    jobRepository,
    jobTodoListRepository,
    jobTodoListItemRepository,
    todoListTemplateRepository,
  }) {
    this.sequelize = sequelize;
    this.jobRepository = jobRepository;
    this.jobTodoListRepository = jobTodoListRepository;
    this.jobTodoListItemRepository = jobTodoListItemRepository;
    this.todoListTemplateRepository = todoListTemplateRepository;
  }

  async ensureJobExists(jobId) {
    const job = await this.jobRepository.findById(jobId);

    if (!job) {
      throw new NotFoundError(`Job ${jobId} not found`);
    }
  }

  async list(jobId) {
    await this.ensureJobExists(jobId);

    return this.jobTodoListRepository.findAllWithItems({ where: { jobId } });
  }

  async getById(jobId, id) {
    await this.ensureJobExists(jobId);

    const jobTodoList = await this.jobTodoListRepository.findByIdWithItems(id);

    if (!jobTodoList || Number(jobTodoList.jobId) !== Number(jobId)) {
      throw new NotFoundError(`Job todo list ${id} not found`);
    }

    return jobTodoList;
  }

  async resolveItems({ items, sourceTemplateId }) {
    if (items !== undefined) {
      return items;
    }

    if (sourceTemplateId === undefined) {
      return [];
    }

    const template =
      await this.todoListTemplateRepository.findByIdWithItems(sourceTemplateId);

    if (!template) {
      throw new ValidationError(
        `TodoListTemplate ${sourceTemplateId} not found`,
      );
    }

    return template.items.map((item) => ({ text: item.text }));
  }

  async create(jobId, { name, items, sourceTemplateId }) {
    await this.ensureJobExists(jobId);

    const resolvedItems = await this.resolveItems({ items, sourceTemplateId });

    return this.sequelize.transaction(async (transaction) => {
      const jobTodoList = await this.jobTodoListRepository.create(
        { jobId, name },
        { transaction },
      );

      await this.jobTodoListItemRepository.bulkCreate(
        resolvedItems.map((item, index) => ({
          jobTodoListId: jobTodoList.id,
          text: item.text,
          completed: item.completed ?? false,
          sortOrder: index,
        })),
        { transaction },
      );

      return this.jobTodoListRepository.findByIdWithItems(jobTodoList.id, {
        transaction,
      });
    });
  }

  async update(jobId, id, { name, items }) {
    await this.getById(jobId, id);

    return this.sequelize.transaction(async (transaction) => {
      if (name !== undefined) {
        await this.jobTodoListRepository.update(id, { name }, { transaction });
      }

      if (items !== undefined) {
        await this.jobTodoListItemRepository.deleteAllForList(id, {
          transaction,
        });
        await this.jobTodoListItemRepository.bulkCreate(
          items.map((item, index) => ({
            jobTodoListId: id,
            text: item.text,
            completed: item.completed ?? false,
            sortOrder: index,
          })),
          { transaction },
        );
      }

      return this.jobTodoListRepository.findByIdWithItems(id, {
        transaction,
      });
    });
  }

  async remove(jobId, id) {
    await this.getById(jobId, id);

    return this.jobTodoListRepository.delete(id);
  }
}
