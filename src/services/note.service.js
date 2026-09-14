import { NotFoundError, ValidationError } from '#configs/error/index.js';

export class NoteService {
  constructor({
    jobRepository,
    invoiceRepository,
    estimateRepository,
    noteRepository,
    noteTemplateRepository,
  }) {
    this.jobRepository = jobRepository;
    this.invoiceRepository = invoiceRepository;
    this.estimateRepository = estimateRepository;
    this.noteRepository = noteRepository;
    this.noteTemplateRepository = noteTemplateRepository;
  }

  async resolveJobParent(jobId) {
    const job = await this.jobRepository.findById(jobId);

    if (!job) {
      throw new NotFoundError(`Job ${jobId} not found`);
    }

    return { type: 'Job', parentId: String(jobId) };
  }

  async resolveInvoiceParent(jobId) {
    await this.resolveJobParent(jobId);

    const invoice = await this.invoiceRepository.findByJobId(jobId);

    if (!invoice) {
      throw new NotFoundError(`Job ${jobId} has no invoice`);
    }

    return { type: 'Invoice', parentId: String(invoice.id) };
  }

  async resolveEstimateParent(jobId) {
    await this.resolveJobParent(jobId);

    const estimate = await this.estimateRepository.findByJobId(jobId);

    if (!estimate) {
      throw new NotFoundError(`Job ${jobId} has no estimate`);
    }

    return { type: 'Estimate', parentId: String(estimate.id) };
  }

  async resolveBody({ body, sourceTemplateId }, type) {
    if (body !== undefined) {
      return body;
    }

    if (sourceTemplateId === undefined) {
      throw new ValidationError('body or sourceTemplateId is required');
    }

    const template =
      await this.noteTemplateRepository.findById(sourceTemplateId);

    if (!template) {
      throw new ValidationError(`NoteTemplate ${sourceTemplateId} not found`);
    }

    if (template.typeKey !== type) {
      throw new ValidationError(
        `NoteTemplate ${sourceTemplateId} is a ${template.typeKey} template and cannot be used for a ${type} note`,
      );
    }

    return template.body;
  }

  async listForJob(jobId) {
    const { type, parentId } = await this.resolveJobParent(jobId);

    return this.noteRepository.findAllForParent(type, parentId);
  }

  async listForInvoice(jobId) {
    const { type, parentId } = await this.resolveInvoiceParent(jobId);

    return this.noteRepository.findAllForParent(type, parentId);
  }

  async listForEstimate(jobId) {
    const { type, parentId } = await this.resolveEstimateParent(jobId);

    return this.noteRepository.findAllForParent(type, parentId);
  }

  async createForJob(jobId, data) {
    const { type, parentId } = await this.resolveJobParent(jobId);
    const body = await this.resolveBody(data, type);

    return this.noteRepository.create({
      parentId,
      type,
      body,
      authorUserId: data.authorUserId ?? null,
    });
  }

  async createForInvoice(jobId, data) {
    const { type, parentId } = await this.resolveInvoiceParent(jobId);
    const body = await this.resolveBody(data, type);

    return this.noteRepository.create({
      parentId,
      type,
      body,
      authorUserId: data.authorUserId ?? null,
    });
  }

  async createForEstimate(jobId, data) {
    const { type, parentId } = await this.resolveEstimateParent(jobId);
    const body = await this.resolveBody(data, type);

    return this.noteRepository.create({
      parentId,
      type,
      body,
      authorUserId: data.authorUserId ?? null,
    });
  }

  async remove(id) {
    const note = await this.noteRepository.findById(id);

    if (!note) {
      throw new NotFoundError(`Note ${id} not found`);
    }

    return this.noteRepository.delete(id);
  }
}
