import { DataTypes, Model } from 'sequelize';

export class AllTemplate extends Model {}

export function defineAllTemplateModel(sequelize) {
  AllTemplate.init(
    {
      // Not a real unique key - the same id repeats across source tables in
      // the union. Marked primaryKey only to satisfy Sequelize's model
      // validation; this repository never calls findByPk/save on this model.
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      sourceTable: {
        type: DataTypes.STRING,
      },
      category: {
        type: DataTypes.STRING,
      },
      name: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: 'AllTemplate',
      tableName: 'all_templates',
      underscored: true,
      timestamps: false,
    },
  );

  return AllTemplate;
}
