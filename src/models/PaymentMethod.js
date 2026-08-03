const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PaymentMethod = sequelize.define("PaymentMethod", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  methodType: {
    type: DataTypes.ENUM("BANK_TRANSFER", "MOBILE_MONEY", "CASH"),
    allowNull: false,
  },
  accountDetails: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  minAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  },
  maxAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: "payment_methods",
  timestamps: true,
});

module.exports = PaymentMethod;