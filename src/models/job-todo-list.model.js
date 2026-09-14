import { DataTypes, Model } from 'sequelize';

export class JobTodoList extends Model {}

export function defineJobTodoListModel(sequelize) {
  JobTodoList.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      jobId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'JobTodoList',
      tableName: 'job_todo_lists',
      underscored: true,
    },
  );

  return JobTodoList;
}
