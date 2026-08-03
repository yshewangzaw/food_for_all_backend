const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CommissionRule = sequelize.define("CommissionRule", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  commissionType: {
    type: DataTypes.ENUM("DIRECT_SALE", "REFERRAL"),
    allowNull: false,
  },
  levelConfigurationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  minimumPV: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  maximumCommissionAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: "commission_rules",
  timestamps: true,
});

module.exports = CommissionRule;