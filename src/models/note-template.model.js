import { DataTypes, Model } from 'sequelize';

export const NOTE_TEMPLATE_TYPE_KEYS = [
  'Customer',
  'Estimate',
  'Invoice',
  'Job',
  'Top',
  'WorkOrder',
];

export class NoteTemplate extends Model {}

export function defineNoteTemplateModel(sequelize) {
  NoteTemplate.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      typeKey: {
        type: DataTypes.ENUM(...NOTE_TEMPLATE_TYPE_KEYS),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'NoteTemplate',
      tableName: 'note_templates',
      underscored: true,
    },
  );

  return NoteTemplate;
}
