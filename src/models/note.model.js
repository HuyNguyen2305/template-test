import { DataTypes, Model } from 'sequelize';

export const NOTE_TYPES = ['Job', 'Invoice', 'Estimate'];

export class Note extends Model {}

export function defineNoteModel(sequelize) {
  Note.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      parentId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM(...NOTE_TYPES),
        allowNull: false,
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      authorUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Note',
      tableName: 'notes',
      underscored: true,
      updatedAt: false,
    },
  );

  return Note;
}
