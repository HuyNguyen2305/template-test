'use strict';

const PARENT_TYPE_VALUES = ['estimate', 'invoice'];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('customer_line_items', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      parent_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      parent_type: {
        type: Sequelize.ENUM(...PARENT_TYPE_VALUES),
        allowNull: false,
      },
      service_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      qty: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 1,
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
      one_time: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      sort_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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

    await queryInterface.addIndex(
      'customer_line_items',
      ['parent_type', 'parent_id'],
      { name: 'customer_line_items_parent_idx' },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('customer_line_items');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_customer_line_items_parent_type";',
    );
  },
};
