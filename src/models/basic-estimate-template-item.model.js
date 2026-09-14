import { DataTypes, Model } from 'sequelize';

export class BasicEstimateTemplateItem extends Model {}

export function defineBasicEstimateTemplateItemModel(sequelize) {
  BasicEstimateTemplateItem.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      basicEstimateTemplateId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      serviceName: {
        type: DataTypes.STRING,
        allowNull: false,
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
      tax1Id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'tax_1_id',
      },
      tax2Id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'tax_2_id',
      },
    },
    {
      sequelize,
      modelName: 'BasicEstimateTemplateItem',
      tableName: 'basic_estimate_template_items',
      underscored: true,
    },
  );

  return BasicEstimateTemplateItem;
}
