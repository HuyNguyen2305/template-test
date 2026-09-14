'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payment_term_templates', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      due_date_value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      due_date_unit: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      late_fee_value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      late_fee_unit: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tax_1_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'taxes',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      tax_2_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'taxes',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      description: {
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('payment_term_templates');
  },
};
