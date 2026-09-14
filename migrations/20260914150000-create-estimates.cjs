'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('estimates', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      job_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'jobs',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Basic',
      },
      estimate_number: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      po_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      date_issued: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      discount_value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      discount_type: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '%',
      },
      deposit_value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      deposit_type: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '%',
      },
      terms_content: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      terms_source_template_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'payment_term_templates',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      notes_content: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      notes_source_template_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'note_templates',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      basic_estimate_template_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'basic_estimate_templates',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('estimates');
  },
};
