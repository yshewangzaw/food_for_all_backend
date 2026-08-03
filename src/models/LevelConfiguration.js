const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const LevelConfiguration = sequelize.define("LevelConfiguration", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  maximumDepth: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  isCommissionEligible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: "level_configurations",
  timestamps: true,
});

module.exports = LevelConfiguration;