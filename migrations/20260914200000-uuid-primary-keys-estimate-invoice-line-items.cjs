'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // 1. Add new UUID id columns alongside the existing integer ids so we
      // can capture an old-id -> new-id mapping before the old ids disappear.
      // (Using addColumn + a later addConstraint for the primary key, since
      // addColumn's `primaryKey: true` option is not applied by Postgres.)
      for (const table of ['estimates', 'invoices', 'customer_line_items']) {
        await queryInterface.addColumn(
          table,
          'new_id',
          {
            type: Sequelize.UUID,
            allowNull: false,
            defaultValue: Sequelize.literal('gen_random_uuid()'),
          },
          { transaction },
        );
      }

      // 2. Backfill customer_line_items' new parent id from whichever
      // parent (estimate or invoice) each row currently points at, so the
      // relationship survives the id type change instead of being lost.
      await queryInterface.addColumn(
        'customer_line_items',
        'new_parent_id',
        { type: Sequelize.UUID, allowNull: true },
        { transaction },
      );
      await queryInterface.sequelize.query(
        `UPDATE customer_line_items cli
         SET new_parent_id = e.new_id
         FROM estimates e
         WHERE cli.parent_type = 'estimate' AND cli.parent_id = e.id`,
        { transaction },
      );
      await queryInterface.sequelize.query(
        `UPDATE customer_line_items cli
         SET new_parent_id = i.new_id
         FROM invoices i
         WHERE cli.parent_type = 'invoice' AND cli.parent_id = i.id`,
        { transaction },
      );

      // 3. Swap the old integer id/parent_id columns out for the backfilled
      // UUID columns, and (re-)add the primary key constraints explicitly,
      // since the original migration's addColumn({ primaryKey: true }) was
      // silently a no-op on Postgres and left these tables with no PK at all.
      await queryInterface.removeColumn('estimates', 'id', { transaction });
      await queryInterface.renameColumn('estimates', 'new_id', 'id', {
        transaction,
      });
      await queryInterface.addConstraint('estimates', {
        fields: ['id'],
        type: 'primary key',
        name: 'estimates_pkey',
        transaction,
      });

      await queryInterface.removeColumn('invoices', 'id', { transaction });
      await queryInterface.renameColumn('invoices', 'new_id', 'id', {
        transaction,
      });
      await queryInterface.addConstraint('invoices', {
        fields: ['id'],
        type: 'primary key',
        name: 'invoices_pkey',
        transaction,
      });

      await queryInterface.removeColumn('customer_line_items', 'id', {
        transaction,
      });
      await queryInterface.renameColumn(
        'customer_line_items',
        'new_id',
        'id',
        { transaction },
      );
      await queryInterface.addConstraint('customer_line_items', {
        fields: ['id'],
        type: 'primary key',
        name: 'customer_line_items_pkey',
        transaction,
      });

      await queryInterface.removeColumn('customer_line_items', 'parent_id', {
        transaction,
      });
      await queryInterface.renameColumn(
        'customer_line_items',
        'new_parent_id',
        'parent_id',
        { transaction },
      );
      await queryInterface.changeColumn(
        'customer_line_items',
        'parent_id',
        { type: Sequelize.UUID, allowNull: false },
        { transaction },
      );

      // The parent_type/parent_id composite index from the original create
      // migration was implicitly dropped when parent_id was replaced above
      // (Postgres drops indexes on column removal) and never recreated;
      // restore it here since we're already fixing this migration.
      await queryInterface.addIndex(
        'customer_line_items',
        ['parent_type', 'parent_id'],
        { name: 'customer_line_items_parent_idx', transaction },
      );
    });
  },

  async down(queryInterface, Sequelize) {
    // NOTE: this rollback is structurally reverting only (UUID -> INTEGER
    // columns); it does not attempt to reconstruct the original integer ids
    // or preserve the estimate/invoice <-> line item relationship, matching
    // this migration's original rollback behavior. Rolling back after real
    // data has flowed through the UUID schema will orphan customer_line_items
    // the same way the original buggy up() did going forward - this path is
    // a best-effort schema revert, not a data-preserving one, and is not
    // expected to run in production.
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeIndex(
        'customer_line_items',
        'customer_line_items_parent_idx',
        { transaction },
      );

      await queryInterface.removeColumn('customer_line_items', 'parent_id', {
        transaction,
      });
      await queryInterface.addColumn(
        'customer_line_items',
        'parent_id',
        { type: Sequelize.INTEGER, allowNull: false },
        { transaction },
      );
      await queryInterface.removeColumn('customer_line_items', 'id', {
        transaction,
      });
      await queryInterface.addColumn(
        'customer_line_items',
        'id',
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
        },
        { transaction },
      );
      await queryInterface.addConstraint('customer_line_items', {
        fields: ['id'],
        type: 'primary key',
        name: 'customer_line_items_pkey',
        transaction,
      });

      await queryInterface.removeColumn('invoices', 'id', { transaction });
      await queryInterface.addColumn(
        'invoices',
        'id',
        { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true },
        { transaction },
      );
      await queryInterface.addConstraint('invoices', {
        fields: ['id'],
        type: 'primary key',
        name: 'invoices_pkey',
        transaction,
      });

      await queryInterface.removeColumn('estimates', 'id', { transaction });
      await queryInterface.addColumn(
        'estimates',
        'id',
        { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true },
        { transaction },
      );
      await queryInterface.addConstraint('estimates', {
        fields: ['id'],
        type: 'primary key',
        name: 'estimates_pkey',
        transaction,
      });
    });
  },
};
