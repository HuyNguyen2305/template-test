import { DataTypes, Model } from 'sequelize';

export class Tax extends Model {}

export function defineTaxModel(sequelize) {
  Tax.init(
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
      rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Tax',
      tableName: 'taxes',
      underscored: true,
    },
  );

  return Tax;
}
