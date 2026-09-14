'use strict';

const ESTIMATE_STATUS_VALUES = ['Draft', 'Pending', 'Won', 'Lost'];
const INVOICE_STATUS_VALUES = ['Draft', 'Sent', 'Void', 'Write Off'];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('estimates', 'terms_source_template_id');
    await queryInterface.removeColumn(
      'estimates',
      'basic_estimate_template_id',
    );
    await queryInterface.removeColumn('estimates', 'notes_content');
    await queryInterface.removeColumn('estimates', 'notes_source_template_id');
    await queryInterface.renameColumn('estimates', 'terms_content', 'terms');
    await queryInterface.addColumn('estimates', 'status', {
      type: Sequelize.ENUM(...ESTIMATE_STATUS_VALUES),
      allowNull: false,
      defaultValue: 'Draft',
    });

    await queryInterface.removeColumn('invoices', 'terms_source_template_id');
    await queryInterface.removeColumn('invoices', 'notes_content');
    await queryInterface.removeColumn('invoices', 'notes_source_template_id');
    await queryInterface.renameColumn('invoices', 'terms_content', 'terms');
    await queryInterface.addColumn('invoices', 'status', {
      type: Sequelize.ENUM(...INVOICE_STATUS_VALUES),
      allowNull: false,
      defaultValue: 'Draft',
    });
    await queryInterface.addColumn('invoices', 'amount_paid', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('invoices', 'amount_paid');
    await queryInterface.removeColumn('invoices', 'status');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_invoices_status";',
    );
    await queryInterface.renameColumn('invoices', 'terms', 'terms_content');
    await queryInterface.addColumn('invoices', 'notes_source_template_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'note_templates', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addColumn('invoices', 'notes_content', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('invoices', 'terms_source_template_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'payment_term_templates', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    await queryInterface.removeColumn('estimates', 'status');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_estimates_status";',
    );
    await queryInterface.renameColumn('estimates', 'terms', 'terms_content');
    await queryInterface.addColumn('estimates', 'notes_source_template_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'note_templates', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addColumn('estimates', 'notes_content', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('estimates', 'basic_estimate_template_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'basic_estimate_templates', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addColumn('estimates', 'terms_source_template_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'payment_term_templates', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },
};
