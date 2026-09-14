'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn(
      'customer_line_items',
      'service_name',
      'item_name',
    );
    await queryInterface.removeColumn('customer_line_items', 'tax_1_id');
    await queryInterface.removeColumn('customer_line_items', 'tax_2_id');
    await queryInterface.removeColumn('customer_line_items', 'one_time');

    await queryInterface.addColumn('customer_line_items', 'tax_slots', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
    });
    await queryInterface.addColumn('customer_line_items', 'subtotal', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('customer_line_items', 'total', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('customer_line_items', 'total');
    await queryInterface.removeColumn('customer_line_items', 'subtotal');
    await queryInterface.removeColumn('customer_line_items', 'tax_slots');

    await queryInterface.addColumn('customer_line_items', 'one_time', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('customer_line_items', 'tax_2_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'taxes', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addColumn('customer_line_items', 'tax_1_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'taxes', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    await queryInterface.renameColumn(
      'customer_line_items',
      'item_name',
      'service_name',
    );
  },
};
