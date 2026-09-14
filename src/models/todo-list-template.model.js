import { DataTypes, Model } from 'sequelize';

export class TodoListTemplate extends Model {}

export function defineTodoListTemplateModel(sequelize) {
  TodoListTemplate.init(
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
      modelName: 'TodoListTemplate',
      tableName: 'todo_list_templates',
      underscored: true,
    },
  );

  return TodoListTemplate;
}
