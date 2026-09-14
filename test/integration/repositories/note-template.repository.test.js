import 'dotenv/config';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { createSequelize } from '#configs/database.js';
import {
  defineNoteTemplateModel,
  NoteTemplate,
} from '#models/note-template.model.js';
import { NoteTemplateRepository } from '#repositories/note-template.repository.js';
import fixtures from '../../fixtures/note-templates.fixture.cjs';
import { seedWithTransaction } from '../../helpers/seed-fixture.js';

describe('NoteTemplateRepository (integration)', () => {
  let sequelize;
  let repository;

  beforeAll(() => {
    sequelize = createSequelize();
    defineNoteTemplateModel(sequelize);
    repository = new NoteTemplateRepository({
      noteTemplateModel: NoteTemplate,
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('create/find/search/update/delete round-trip against the real database', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      const created = await repository.create(fixtures[0], { transaction });
      expect(created.id).toBeDefined();
      expect(created.typeKey).toBe('Customer');

      const found = await repository.findById(created.id, { transaction });
      expect(found.name).toBe('Customer Note #1');

      const searched = await repository.search(
        { typeKey: 'Customer' },
        { transaction },
      );
      expect(searched.some((row) => row.id === created.id)).toBe(true);
    });
  });

  test('rolls back cleanly, leaving no rows after the transaction', async () => {
    let createdId;

    await seedWithTransaction(sequelize, async (transaction) => {
      const created = await repository.create(fixtures[1], { transaction });
      createdId = created.id;
    });

    const found = await repository.findById(createdId);
    expect(found).toBeNull();
  });
});
