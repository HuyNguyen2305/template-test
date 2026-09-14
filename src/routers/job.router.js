import { CONTROLLER_KEYS } from '#constants/singleton.js';
import {
  listJobsSchema,
  getJobSchema,
  createJobSchema,
  updateJobSchema,
  deleteJobSchema,
} from '#schemas/job.schema.js';
import {
  listJobTodoListsSchema,
  getJobTodoListSchema,
  createJobTodoListSchema,
  updateJobTodoListSchema,
  deleteJobTodoListSchema,
} from '#schemas/job-todo-list.schema.js';
import {
  listJobNotesSchema,
  createJobNoteSchema,
  listInvoiceNotesSchema,
  createInvoiceNoteSchema,
  listEstimateNotesSchema,
  createEstimateNoteSchema,
} from '#schemas/note.schema.js';
import {
  getInvoiceSchema,
  createInvoiceSchema,
  updateInvoiceSchema,
  deleteInvoiceSchema,
} from '#schemas/invoice.schema.js';
import {
  getEstimateSchema,
  createEstimateSchema,
  updateEstimateSchema,
  deleteEstimateSchema,
} from '#schemas/estimate.schema.js';

export default async function jobRouter(fastify) {
  const jobController = fastify.diContainer.resolve(
    CONTROLLER_KEYS.jobController,
  );
  const jobTodoListController = fastify.diContainer.resolve(
    CONTROLLER_KEYS.jobTodoListController,
  );
  const noteController = fastify.diContainer.resolve(
    CONTROLLER_KEYS.noteController,
  );
  const invoiceController = fastify.diContainer.resolve(
    CONTROLLER_KEYS.invoiceController,
  );
  const estimateController = fastify.diContainer.resolve(
    CONTROLLER_KEYS.estimateController,
  );

  fastify.get(
    '/jobs',
    { schema: listJobsSchema },
    jobController.list.bind(jobController),
  );

  fastify.get(
    '/jobs/:id',
    { schema: getJobSchema },
    jobController.getById.bind(jobController),
  );

  fastify.post(
    '/jobs',
    { schema: createJobSchema },
    jobController.create.bind(jobController),
  );

  fastify.patch(
    '/jobs/:id',
    { schema: updateJobSchema },
    jobController.update.bind(jobController),
  );

  fastify.delete(
    '/jobs/:id',
    { schema: deleteJobSchema },
    jobController.remove.bind(jobController),
  );

  fastify.get(
    '/jobs/:jobId/todo-lists',
    { schema: listJobTodoListsSchema },
    jobTodoListController.list.bind(jobTodoListController),
  );

  fastify.get(
    '/jobs/:jobId/todo-lists/:id',
    { schema: getJobTodoListSchema },
    jobTodoListController.getById.bind(jobTodoListController),
  );

  fastify.post(
    '/jobs/:jobId/todo-lists',
    { schema: createJobTodoListSchema },
    jobTodoListController.create.bind(jobTodoListController),
  );

  fastify.patch(
    '/jobs/:jobId/todo-lists/:id',
    { schema: updateJobTodoListSchema },
    jobTodoListController.update.bind(jobTodoListController),
  );

  fastify.delete(
    '/jobs/:jobId/todo-lists/:id',
    { schema: deleteJobTodoListSchema },
    jobTodoListController.remove.bind(jobTodoListController),
  );

  fastify.get(
    '/jobs/:jobId/notes',
    { schema: listJobNotesSchema },
    noteController.listForJob.bind(noteController),
  );

  fastify.post(
    '/jobs/:jobId/notes',
    { schema: createJobNoteSchema },
    noteController.createForJob.bind(noteController),
  );

  fastify.get(
    '/jobs/:jobId/invoice/notes',
    { schema: listInvoiceNotesSchema },
    noteController.listForInvoice.bind(noteController),
  );

  fastify.post(
    '/jobs/:jobId/invoice/notes',
    { schema: createInvoiceNoteSchema },
    noteController.createForInvoice.bind(noteController),
  );

  fastify.get(
    '/jobs/:jobId/estimate/notes',
    { schema: listEstimateNotesSchema },
    noteController.listForEstimate.bind(noteController),
  );

  fastify.post(
    '/jobs/:jobId/estimate/notes',
    { schema: createEstimateNoteSchema },
    noteController.createForEstimate.bind(noteController),
  );

  fastify.get(
    '/jobs/:jobId/invoice',
    { schema: getInvoiceSchema },
    invoiceController.getByJobId.bind(invoiceController),
  );

  fastify.post(
    '/jobs/:jobId/invoice',
    { schema: createInvoiceSchema },
    invoiceController.create.bind(invoiceController),
  );

  fastify.patch(
    '/jobs/:jobId/invoice',
    { schema: updateInvoiceSchema },
    invoiceController.update.bind(invoiceController),
  );

  fastify.delete(
    '/jobs/:jobId/invoice',
    { schema: deleteInvoiceSchema },
    invoiceController.remove.bind(invoiceController),
  );

  fastify.get(
    '/jobs/:jobId/estimate',
    { schema: getEstimateSchema },
    estimateController.getByJobId.bind(estimateController),
  );

  fastify.post(
    '/jobs/:jobId/estimate',
    { schema: createEstimateSchema },
    estimateController.create.bind(estimateController),
  );

  fastify.patch(
    '/jobs/:jobId/estimate',
    { schema: updateEstimateSchema },
    estimateController.update.bind(estimateController),
  );

  fastify.delete(
    '/jobs/:jobId/estimate',
    { schema: deleteEstimateSchema },
    estimateController.remove.bind(estimateController),
  );
}
