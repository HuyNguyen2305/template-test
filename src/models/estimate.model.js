import { DataTypes, Model } from 'sequelize';

export const ESTIMATE_TYPES = ['Basic'];
export const ESTIMATE_STATUSES = ['Draft', 'Pending', 'Won', 'Lost'];

export class Estimate extends Model {}

export function defineEstimateModel(sequelize) {
  Estimate.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      jobId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Basic',
      },
      status: {
        type: DataTypes.ENUM(...ESTIMATE_STATUSES),
        allowNull: false,
        defaultValue: 'Draft',
      },
      estimateNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      poNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      dateIssued: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
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
    },
    {
      sequelize,
      modelName: 'Estimate',
      tableName: 'estimates',
      underscored: true,
    },
  );

  return Estimate;
}
