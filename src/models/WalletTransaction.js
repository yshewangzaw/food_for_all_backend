const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const WalletTransaction = sequelize.define(
  "WalletTransaction",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    transactionType: {
      type: DataTypes.ENUM(
        "COMMISSION_CREDIT",
        "WITHDRAWAL_LOCK",
        "WITHDRAWAL_DEBIT",
        "WITHDRAWAL_REFUND",
        "ADJUSTMENT_CREDIT",
        "ADJUSTMENT_DEBIT",
        "REVERSAL"
      ),
      allowNull: false,
    },
    direction: {
      type: DataTypes.ENUM("CREDIT", "DEBIT"),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    balanceBefore: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    balanceAfter: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    referenceType: {
      type: DataTypes.ENUM("COMMISSION", "WITHDRAWAL", "MANUAL"),
      allowNull: true,
    },
    referenceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdById: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "wallet_transactions",
    timestamps: true,
    updatedAt: false, // Wallet transactions are immutable ledgers
    indexes: [
      {
        unique: true,
        fields: ["referenceType", "referenceId", "transactionType"],
        name: "unique_reference_transaction",
      },
    ],
  }
);

module.exports = WalletTransaction;