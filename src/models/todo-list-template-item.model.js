import { DataTypes, Model } from 'sequelize';

export class TodoListTemplateItem extends Model {}

export function defineTodoListTemplateItemModel(sequelize) {
  TodoListTemplateItem.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      todoListTemplateId: {
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
    },
    {
      sequelize,
      modelName: 'TodoListTemplateItem',
      tableName: 'todo_list_template_items',
      underscored: true,
    },
  );

  return TodoListTemplateItem;
}
