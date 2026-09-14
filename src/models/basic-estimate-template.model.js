import { DataTypes, Model } from 'sequelize';

export class BasicEstimateTemplate extends Model {}

export function defineBasicEstimateTemplateModel(sequelize) {
  BasicEstimateTemplate.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      discountValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      discountType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '%',
      },
      depositValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      depositType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '%',
      },
      terms: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'BasicEstimateTemplate',
      tableName: 'basic_estimate_templates',
      underscored: true,
    },
  );

  return BasicEstimateTemplate;
}
