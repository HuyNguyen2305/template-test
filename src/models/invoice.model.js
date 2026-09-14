import { DataTypes, Model } from 'sequelize';

export const INVOICE_STATUSES = ['Draft', 'Sent', 'Void', 'Write Off'];

export class Invoice extends Model {}

export function defineInvoiceModel(sequelize) {
  Invoice.init(
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
      invoiceNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(...INVOICE_STATUSES),
        allowNull: false,
        defaultValue: 'Draft',
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
      repeatsWithJob: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
      amountPaid: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      terms: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Invoice',
      tableName: 'invoices',
      underscored: true,
    },
  );

  return Invoice;
}
