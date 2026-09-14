'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('estimates', 'id');
    await queryInterface.addColumn('estimates', 'id', {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: Sequelize.literal('gen_random_uuid()'),
    });

    await queryInterface.removeColumn('invoices', 'id');
    await queryInterface.addColumn('invoices', 'id', {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: Sequelize.literal('gen_random_uuid()'),
    });

    await queryInterface.removeColumn('customer_line_items', 'id');
    await queryInterface.addColumn('customer_line_items', 'id', {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: Sequelize.literal('gen_random_uuid()'),
    });
    await queryInterface.removeColumn('customer_line_items', 'parent_id');
    await queryInterface.addColumn('customer_line_items', 'parent_id', {
      type: Sequelize.UUID,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('customer_line_items', 'parent_id');
    await queryInterface.addColumn('customer_line_items', 'parent_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.removeColumn('customer_line_items', 'id');
    await queryInterface.addColumn('customer_line_items', 'id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    });

    await queryInterface.removeColumn('invoices', 'id');
    await queryInterface.addColumn('invoices', 'id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    });

    await queryInterface.removeColumn('estimates', 'id');
    await queryInterface.addColumn('estimates', 'id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    });
  },
};
