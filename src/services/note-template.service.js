import { NotFoundError, ValidationError } from '#configs/error/index.js';
import { NOTE_TEMPLATE_TYPE_KEYS } from '#models/note-template.model.js';

export class NoteTemplateService {
  constructor({ noteTemplateRepository }) {
    this.noteTemplateRepository = noteTemplateRepository;
  }

  async list({ typeKey, query } = {}) {
    return this.noteTemplateRepository.search({ typeKey, query });
  }

  async getById(id) {
    const noteTemplate = await this.noteTemplateRepository.findById(id);

    if (!noteTemplate) {
      throw new NotFoundError(`Note template ${id} not found`);
    }

    return noteTemplate;
  }

  async create(data) {
    if (!NOTE_TEMPLATE_TYPE_KEYS.includes(data.typeKey)) {
      throw new ValidationError(
        `typeKey must be one of: ${NOTE_TEMPLATE_TYPE_KEYS.join(', ')}`,
      );
    }

    return this.noteTemplateRepository.create(data);
  }

  async update(id, data) {
    const current = await this.getById(id);

    if (data.typeKey && !NOTE_TEMPLATE_TYPE_KEYS.includes(data.typeKey)) {
      throw new ValidationError(
        `typeKey must be one of: ${NOTE_TEMPLATE_TYPE_KEYS.join(', ')}`,
      );
    }

    if (Object.keys(data).length === 0) {
      return current;
    }

    return this.noteTemplateRepository.update(id, data);
  }

  async remove(id) {
    await this.getById(id);

    return this.noteTemplateRepository.delete(id);
  }
}
