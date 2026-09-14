import { DataTypes, Model } from 'sequelize';

export class Job extends Model {}

export function defineJobModel(sequelize) {
  Job.init(
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
    },
    {
      sequelize,
      modelName: 'Job',
      tableName: 'jobs',
      underscored: true,
    },
  );

  return Job;
}
