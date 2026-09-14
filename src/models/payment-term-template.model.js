import { DataTypes, Model } from 'sequelize';

export class PaymentTermTemplate extends Model {}

export function definePaymentTermTemplateModel(sequelize) {
  PaymentTermTemplate.init(
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
      dueDateValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      dueDateUnit: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lateFeeValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      lateFeeUnit: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tax1Id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'tax_1_id',
      },
      tax2Id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'tax_2_id',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'PaymentTermTemplate',
      tableName: 'payment_term_templates',
      underscored: true,
    },
  );

  return PaymentTermTemplate;
}
