const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const WithdrawalRequest = sequelize.define(
  "WithdrawalRequest",
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
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    paymentMethodId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "PENDING",
        "UNDER_REVIEW",
        "APPROVED",
        "REJECTED",
        "PAID",
        "CANCELLED"
      ),
      defaultValue: "PENDING",
    },
    reviewedById: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    paidById: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    paymentReference: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    proofImageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "withdrawal_requests",
    timestamps: true,
  }
);

module.exports = WithdrawalRequest;