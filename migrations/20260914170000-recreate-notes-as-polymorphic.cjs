'use strict';

const NOTE_TYPE_VALUES = ['Job', 'Invoice', 'Estimate'];
const OLD_JOB_NOTE_TYPE_KEY_VALUES = ['Job', 'Top', 'WorkOrder'];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.dropTable('notes');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_notes_type_key";',
    );

    await queryInterface.createTable('notes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      parent_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM(...NOTE_TYPE_VALUES),
        allowNull: false,
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      author_user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('notes', ['type', 'parent_id'], {
      name: 'notes_type_parent_id_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('notes');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_notes_type";',
    );

    await queryInterface.createTable('notes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      job_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'jobs', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      type_key: {
        type: Sequelize.ENUM(...OLD_JOB_NOTE_TYPE_KEY_VALUES),
        allowNull: false,
      },
      source_template_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'note_templates', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('notes', ['job_id', 'type_key'], {
      unique: true,
      name: 'notes_job_id_type_key_unique',
    });
  },
};
