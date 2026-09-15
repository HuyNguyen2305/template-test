'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query('DROP VIEW all_templates;');

    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_note_templates_type_key" RENAME TO "enum_note_templates_type_key_old";
    `);
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_note_templates_type_key" AS ENUM('Customer', 'Estimate', 'Invoice', 'Job');
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE note_templates
      ALTER COLUMN type_key TYPE "enum_note_templates_type_key"
      USING type_key::text::"enum_note_templates_type_key";
    `);
    await queryInterface.sequelize.query(`
      DROP TYPE "enum_note_templates_type_key_old";
    `);

    await queryInterface.sequelize.query(`
      CREATE VIEW all_templates AS
      SELECT id,
             'NoteTemplate' AS source_table,
             type_key || ' Notes' AS category,
             name
      FROM note_templates
      UNION ALL
      SELECT id, 'PaymentTermTemplate' AS source_table, 'Payment Terms' AS category, name
      FROM payment_term_templates
      UNION ALL
      SELECT id, 'TodoListTemplate' AS source_table, 'Todo Lists' AS category, name
      FROM todo_list_templates
      UNION ALL
      SELECT id, 'BasicEstimateTemplate' AS source_table, 'Basic Estimates' AS category, name
      FROM basic_estimate_templates;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP VIEW all_templates;');

    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_note_templates_type_key" RENAME TO "enum_note_templates_type_key_new";
    `);
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_note_templates_type_key" AS ENUM('Customer', 'Estimate', 'Invoice', 'Job', 'Top', 'WorkOrder');
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE note_templates
      ALTER COLUMN type_key TYPE "enum_note_templates_type_key"
      USING type_key::text::"enum_note_templates_type_key";
    `);
    await queryInterface.sequelize.query(`
      DROP TYPE "enum_note_templates_type_key_new";
    `);

    await queryInterface.sequelize.query(`
      CREATE VIEW all_templates AS
      SELECT id,
             'NoteTemplate' AS source_table,
             CASE type_key
               WHEN 'WorkOrder' THEN 'Work Order Notes'
               ELSE type_key || ' Notes'
             END AS category,
             name
      FROM note_templates
      UNION ALL
      SELECT id, 'PaymentTermTemplate' AS source_table, 'Payment Terms' AS category, name
      FROM payment_term_templates
      UNION ALL
      SELECT id, 'TodoListTemplate' AS source_table, 'Todo Lists' AS category, name
      FROM todo_list_templates
      UNION ALL
      SELECT id, 'BasicEstimateTemplate' AS source_table, 'Basic Estimates' AS category, name
      FROM basic_estimate_templates;
    `);
  },
};
