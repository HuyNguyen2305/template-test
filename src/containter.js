import { diContainer } from '@fastify/awilix';
import { asClass, asFunction, asValue, Lifetime } from 'awilix';
import { createSequelize } from '#configs/database.js';
import { defineNoteTemplateModel } from '#models/note-template.model.js';
import { defineTodoListTemplateModel } from '#models/todo-list-template.model.js';
import { defineTodoListTemplateItemModel } from '#models/todo-list-template-item.model.js';
import { defineTaxModel } from '#models/tax.model.js';
import { definePaymentTermTemplateModel } from '#models/payment-term-template.model.js';
import { defineBasicEstimateTemplateModel } from '#models/basic-estimate-template.model.js';
import { defineBasicEstimateTemplateItemModel } from '#models/basic-estimate-template-item.model.js';
import { defineAllTemplateModel } from '#models/all-template.model.js';
import { defineJobModel } from '#models/job.model.js';
import { defineJobTodoListModel } from '#models/job-todo-list.model.js';
import { defineJobTodoListItemModel } from '#models/job-todo-list-item.model.js';
import { defineNoteModel } from '#models/note.model.js';
import { defineCustomerLineItemModel } from '#models/customer-line-item.model.js';
import { defineInvoiceModel } from '#models/invoice.model.js';
import { defineEstimateModel } from '#models/estimate.model.js';
import { NoteTemplateRepository } from '#repositories/note-template.repository.js';
import { TodoListTemplateRepository } from '#repositories/todo-list-template.repository.js';
import { TodoListTemplateItemRepository } from '#repositories/todo-list-template-item.repository.js';
import { TaxRepository } from '#repositories/tax.repository.js';
import { PaymentTermTemplateRepository } from '#repositories/payment-term-template.repository.js';
import { BasicEstimateTemplateRepository } from '#repositories/basic-estimate-template.repository.js';
import { BasicEstimateTemplateItemRepository } from '#repositories/basic-estimate-template-item.repository.js';
import { AllTemplateRepository } from '#repositories/all-template.repository.js';
import { JobRepository } from '#repositories/job.repository.js';
import { JobTodoListRepository } from '#repositories/job-todo-list.repository.js';
import { JobTodoListItemRepository } from '#repositories/job-todo-list-item.repository.js';
import { NoteRepository } from '#repositories/note.repository.js';
import { CustomerLineItemRepository } from '#repositories/customer-line-item.repository.js';
import { InvoiceRepository } from '#repositories/invoice.repository.js';
import { EstimateRepository } from '#repositories/estimate.repository.js';
import { NoteTemplateService } from '#services/note-template.service.js';
import { TodoListTemplateService } from '#services/todo-list-template.service.js';
import { TaxService } from '#services/tax.service.js';
import { PaymentTermTemplateService } from '#services/payment-term-template.service.js';
import { BasicEstimateTemplateService } from '#services/basic-estimate-template.service.js';
import { AllTemplateService } from '#services/all-template.service.js';
import { JobService } from '#services/job.service.js';
import { JobTodoListService } from '#services/job-todo-list.service.js';
import { NoteService } from '#services/note.service.js';
import { InvoiceService } from '#services/invoice.service.js';
import { EstimateService } from '#services/estimate.service.js';
import { NoteTemplateController } from '#controllers/note-template.controller.js';
import { TodoListTemplateController } from '#controllers/todo-list-template.controller.js';
import { TaxController } from '#controllers/tax.controller.js';
import { PaymentTermTemplateController } from '#controllers/payment-term-template.controller.js';
import { BasicEstimateTemplateController } from '#controllers/basic-estimate-template.controller.js';
import { AllTemplateController } from '#controllers/all-template.controller.js';
import { JobController } from '#controllers/job.controller.js';
import { JobTodoListController } from '#controllers/job-todo-list.controller.js';
import { NoteController } from '#controllers/note.controller.js';
import { InvoiceController } from '#controllers/invoice.controller.js';
import { EstimateController } from '#controllers/estimate.controller.js';
import {
  REPOSITORY_KEYS,
  SERVICE_KEYS,
  CONTROLLER_KEYS,
} from '#constants/singleton.js';

export function registerContainer() {
  const sequelize = createSequelize();
  diContainer.register({
    sequelize: asFunction(() => sequelize, {
      lifetime: Lifetime.SINGLETON,
    }).disposer(async (instance) => instance.close()),
  });

  const noteTemplateModel = defineNoteTemplateModel(sequelize);
  const todoListTemplateModel = defineTodoListTemplateModel(sequelize);
  const todoListTemplateItemModel = defineTodoListTemplateItemModel(sequelize);
  const taxModel = defineTaxModel(sequelize);
  const paymentTermTemplateModel = definePaymentTermTemplateModel(sequelize);
  const basicEstimateTemplateModel =
    defineBasicEstimateTemplateModel(sequelize);
  const basicEstimateTemplateItemModel =
    defineBasicEstimateTemplateItemModel(sequelize);
  const allTemplateModel = defineAllTemplateModel(sequelize);
  const jobModel = defineJobModel(sequelize);
  const jobTodoListModel = defineJobTodoListModel(sequelize);
  const jobTodoListItemModel = defineJobTodoListItemModel(sequelize);
  const noteModel = defineNoteModel(sequelize);
  const customerLineItemModel = defineCustomerLineItemModel(sequelize);
  const invoiceModel = defineInvoiceModel(sequelize);
  const estimateModel = defineEstimateModel(sequelize);

  todoListTemplateModel.hasMany(todoListTemplateItemModel, {
    as: 'items',
    foreignKey: 'todoListTemplateId',
  });
  todoListTemplateItemModel.belongsTo(todoListTemplateModel, {
    foreignKey: 'todoListTemplateId',
  });

  basicEstimateTemplateModel.hasMany(basicEstimateTemplateItemModel, {
    as: 'items',
    foreignKey: 'basicEstimateTemplateId',
  });
  basicEstimateTemplateItemModel.belongsTo(basicEstimateTemplateModel, {
    foreignKey: 'basicEstimateTemplateId',
  });

  jobTodoListModel.hasMany(jobTodoListItemModel, {
    as: 'items',
    foreignKey: 'jobTodoListId',
  });
  jobTodoListItemModel.belongsTo(jobTodoListModel, {
    foreignKey: 'jobTodoListId',
  });

  diContainer.register({
    noteTemplateModel: asValue(noteTemplateModel),
    todoListTemplateModel: asValue(todoListTemplateModel),
    todoListTemplateItemModel: asValue(todoListTemplateItemModel),
    taxModel: asValue(taxModel),
    paymentTermTemplateModel: asValue(paymentTermTemplateModel),
    basicEstimateTemplateModel: asValue(basicEstimateTemplateModel),
    basicEstimateTemplateItemModel: asValue(basicEstimateTemplateItemModel),
    allTemplateModel: asValue(allTemplateModel),
    jobModel: asValue(jobModel),
    jobTodoListModel: asValue(jobTodoListModel),
    jobTodoListItemModel: asValue(jobTodoListItemModel),
    noteModel: asValue(noteModel),
    customerLineItemModel: asValue(customerLineItemModel),
    invoiceModel: asValue(invoiceModel),
    estimateModel: asValue(estimateModel),
  });

  diContainer.register({
    [REPOSITORY_KEYS.noteTemplateRepository]: asClass(NoteTemplateRepository),
    [REPOSITORY_KEYS.todoListTemplateRepository]: asClass(
      TodoListTemplateRepository,
    ),
    [REPOSITORY_KEYS.todoListTemplateItemRepository]: asClass(
      TodoListTemplateItemRepository,
    ),
    [REPOSITORY_KEYS.taxRepository]: asClass(TaxRepository),
    [REPOSITORY_KEYS.paymentTermTemplateRepository]: asClass(
      PaymentTermTemplateRepository,
    ),
    [REPOSITORY_KEYS.basicEstimateTemplateRepository]: asClass(
      BasicEstimateTemplateRepository,
    ),
    [REPOSITORY_KEYS.basicEstimateTemplateItemRepository]: asClass(
      BasicEstimateTemplateItemRepository,
    ),
    [REPOSITORY_KEYS.allTemplateRepository]: asClass(AllTemplateRepository),
    [REPOSITORY_KEYS.jobRepository]: asClass(JobRepository),
    [REPOSITORY_KEYS.jobTodoListRepository]: asClass(JobTodoListRepository),
    [REPOSITORY_KEYS.jobTodoListItemRepository]: asClass(
      JobTodoListItemRepository,
    ),
    [REPOSITORY_KEYS.noteRepository]: asClass(NoteRepository),
    [REPOSITORY_KEYS.customerLineItemRepository]: asClass(
      CustomerLineItemRepository,
    ),
    [REPOSITORY_KEYS.invoiceRepository]: asClass(InvoiceRepository),
    [REPOSITORY_KEYS.estimateRepository]: asClass(EstimateRepository),
    [SERVICE_KEYS.noteTemplateService]: asClass(NoteTemplateService),
    [SERVICE_KEYS.todoListTemplateService]: asClass(TodoListTemplateService),
    [SERVICE_KEYS.taxService]: asClass(TaxService),
    [SERVICE_KEYS.paymentTermTemplateService]: asClass(
      PaymentTermTemplateService,
    ),
    [SERVICE_KEYS.basicEstimateTemplateService]: asClass(
      BasicEstimateTemplateService,
    ),
    [SERVICE_KEYS.allTemplateService]: asClass(AllTemplateService),
    [SERVICE_KEYS.jobService]: asClass(JobService),
    [SERVICE_KEYS.jobTodoListService]: asClass(JobTodoListService),
    [SERVICE_KEYS.noteService]: asClass(NoteService),
    [SERVICE_KEYS.invoiceService]: asClass(InvoiceService),
    [SERVICE_KEYS.estimateService]: asClass(EstimateService),
    [CONTROLLER_KEYS.noteTemplateController]: asClass(NoteTemplateController),
    [CONTROLLER_KEYS.todoListTemplateController]: asClass(
      TodoListTemplateController,
    ),
    [CONTROLLER_KEYS.taxController]: asClass(TaxController),
    [CONTROLLER_KEYS.paymentTermTemplateController]: asClass(
      PaymentTermTemplateController,
    ),
    [CONTROLLER_KEYS.basicEstimateTemplateController]: asClass(
      BasicEstimateTemplateController,
    ),
    [CONTROLLER_KEYS.allTemplateController]: asClass(AllTemplateController),
    [CONTROLLER_KEYS.jobController]: asClass(JobController),
    [CONTROLLER_KEYS.jobTodoListController]: asClass(JobTodoListController),
    [CONTROLLER_KEYS.noteController]: asClass(NoteController),
    [CONTROLLER_KEYS.invoiceController]: asClass(InvoiceController),
    [CONTROLLER_KEYS.estimateController]: asClass(EstimateController),
  });

  return diContainer;
}
