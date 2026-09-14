import { NotFoundError, ValidationError } from '#configs/error/index.js';

const CONTENT_SOURCES = {
  NoteTemplate: { repository: 'noteTemplateRepository', field: 'body' },
  PaymentTermTemplate: {
    repository: 'paymentTermTemplateRepository',
    field: 'description',
  },
};

export class AllTemplateService {
  constructor({
    allTemplateRepository,
    noteTemplateRepository,
    paymentTermTemplateRepository,
  }) {
    this.allTemplateRepository = allTemplateRepository;
    this.noteTemplateRepository = noteTemplateRepository;
    this.paymentTermTemplateRepository = paymentTermTemplateRepository;
  }

  async list({ category, query } = {}) {
    return this.allTemplateRepository.search({ category, query });
  }

  async getContent(sourceTable, id) {
    const source = CONTENT_SOURCES[sourceTable];

    if (!source) {
      throw new ValidationError(
        `Cannot fetch content for sourceTable "${sourceTable}"; must be one of: ${Object.keys(CONTENT_SOURCES).join(', ')}`,
      );
    }

    const row = await this[source.repository].findById(id);

    if (!row) {
      throw new NotFoundError(`${sourceTable} ${id} not found`);
    }

    return {
      id: row.id,
      sourceTable,
      name: row.name,
      content: row[source.field],
    };
  }
}
