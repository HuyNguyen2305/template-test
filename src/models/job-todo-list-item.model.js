import { DataTypes, Model } from 'sequelize';

export class JobTodoListItem extends Model {}

export function defineJobTodoListItemModel(sequelize) {
  JobTodoListItem.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      jobTodoListId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      text: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'JobTodoListItem',
      tableName: 'job_todo_list_items',
      underscored: true,
    },
  );

  return JobTodoListItem;
}
