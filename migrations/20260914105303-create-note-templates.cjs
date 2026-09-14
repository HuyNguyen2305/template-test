'use strict';

const TYPE_KEY_VALUES = [
  'Customer',
  'Estimate',
  'Invoice',
  'Job',
  'Top',
  'WorkOrder',
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('note_templates', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      type_key: {
        type: Sequelize.ENUM(...TYPE_KEY_VALUES),
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      body: {
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
    await queryInterface.dropTable('note_templates');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_note_templates_type_key";',
    );
  },
};
