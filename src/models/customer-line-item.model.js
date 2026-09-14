import { DataTypes, Model } from 'sequelize';

export const LINE_ITEM_PARENT_TYPES = ['estimate', 'invoice'];

export class CustomerLineItem extends Model {}

export function defineCustomerLineItemModel(sequelize) {
  CustomerLineItem.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      parentId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      parentType: {
        type: DataTypes.ENUM(...LINE_ITEM_PARENT_TYPES),
        allowNull: false,
      },
      itemName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'item_name',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      qty: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 1,
      },
      taxSlots: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
        field: 'tax_slots',
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'CustomerLineItem',
      tableName: 'customer_line_items',
      underscored: true,
    },
  );

  return CustomerLineItem;
}
