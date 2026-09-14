import 'dotenv/config';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { createSequelize } from '#configs/database.js';
import { defineJobModel } from '#models/job.model.js';
import { defineNoteModel } from '#models/note.model.js';
import { JobRepository } from '#repositories/job.repository.js';
import { NoteRepository } from '#repositories/note.repository.js';
import fixture from '../../fixtures/notes.fixture.cjs';
import { seedWithTransaction } from '../../helpers/seed-fixture.js';

describe('NoteRepository (integration)', () => {
  let sequelize;
  let jobRepository;
  let noteRepository;

  beforeAll(() => {
    sequelize = createSequelize();
    const jobModel = defineJobModel(sequelize);
    const noteModel = defineNoteModel(sequelize);

    jobRepository = new JobRepository({ jobModel });
    noteRepository = new NoteRepository({ noteModel });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('finds notes for a parent, ordered oldest first', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      const job = await jobRepository.create(fixture.job, { transaction });
      const first = await noteRepository.create(
        { parentId: String(job.id), type: 'Job', body: 'First note' },
        { transaction },
      );
      const second = await noteRepository.create(
        { parentId: String(job.id), type: 'Job', body: 'Second note' },
        { transaction },
      );

      const found = await noteRepository.findAllForParent('Job', job.id, {
        transaction,
      });

      expect(found.map((note) => note.id)).toEqual([first.id, second.id]);
    });
  });

  test('a second note for the same parent and type is allowed (append-only)', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      const job = await jobRepository.create(fixture.job, { transaction });
      await noteRepository.create(
        { parentId: String(job.id), ...fixture.note },
        { transaction },
      );
      await noteRepository.create(
        { parentId: String(job.id), ...fixture.note },
        { transaction },
      );

      const found = await noteRepository.findAllForParent('Job', job.id, {
        transaction,
      });
      expect(found).toHaveLength(2);
    });
  });

  test('findAllForParent scopes by type, not just parentId', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      const job = await jobRepository.create(fixture.job, { transaction });
      await noteRepository.create(
        { parentId: String(job.id), type: 'Job', body: 'Job note' },
        { transaction },
      );

      const foundAsInvoice = await noteRepository.findAllForParent(
        'Invoice',
        job.id,
        { transaction },
      );
      expect(foundAsInvoice).toHaveLength(0);
    });
  });

  test('deleteAllForParent removes only notes for that exact parent and type', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      await noteRepository.create(
        { parentId: '5', type: 'Job', body: 'Job 5 note' },
        { transaction },
      );
      await noteRepository.create(
        { parentId: '6', type: 'Job', body: 'Job 6 note' },
        { transaction },
      );

      await noteRepository.deleteAllForParent('Job', 5, { transaction });

      const removedParent = await noteRepository.findAllForParent('Job', 5, {
        transaction,
      });
      const untouchedParent = await noteRepository.findAllForParent('Job', 6, {
        transaction,
      });

      expect(removedParent).toHaveLength(0);
      expect(untouchedParent).toHaveLength(1);
    });
  });

  test('deleting the parent job does NOT cascade to its notes (no DB FK, by design)', async () => {
    await seedWithTransaction(sequelize, async (transaction) => {
      const job = await jobRepository.create(fixture.job, { transaction });
      const note = await noteRepository.create(
        { parentId: String(job.id), ...fixture.note },
        { transaction },
      );

      await jobRepository.delete(job.id, { transaction });

      const found = await noteRepository.findById(note.id, { transaction });
      expect(found).not.toBeNull();

      await noteRepository.delete(note.id, { transaction });
    });
  });

  test('rolls back cleanly, leaving no rows after the transaction', async () => {
    let createdId;

    await seedWithTransaction(sequelize, async (transaction) => {
      const job = await jobRepository.create(fixture.job, { transaction });
      const note = await noteRepository.create(
        { parentId: String(job.id), ...fixture.note },
        { transaction },
      );
      createdId = note.id;
    });

    const found = await noteRepository.findById(createdId);
    expect(found).toBeNull();
  });
});
