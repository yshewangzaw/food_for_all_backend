const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Commission = sequelize.define(
  "Commission",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    beneficiaryUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sourceUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    commissionRuleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    commissionType: {
      type: DataTypes.ENUM("DIRECT_SALE", "REFERRAL"),
      allowNull: false,
    },
    levelId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    baseAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    commissionAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "CREDITED", "REVERSED"),
      defaultValue: "PENDING",
    },
    forfeitReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    creditedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // ADD these three attributes to your existing CommissionRule.js model:

    level: {
      type: DataTypes.INTEGER,
      allowNull: true, // null for DIRECT_SALE rules; 1/2/3 for REFERRAL rules
    },

    rateType: {
      type: DataTypes.ENUM("PERCENTAGE", "FLAT"),
      allowNull: false,
      defaultValue: "PERCENTAGE",
    },

    rateValue: {
      type: DataTypes.DECIMAL(8, 3),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "commissions",
    timestamps: true,
    updatedAt: false, // Schema only specifies createdAt
  },
);

module.exports = Commission;
