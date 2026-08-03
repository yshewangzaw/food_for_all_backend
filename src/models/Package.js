const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Package = sequelize.define("Package", {
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
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  pvValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cycle: {
    type: DataTypes.ENUM("MONTHLY", "ONE_TIME"),
    allowNull: false,
  },
  isEntryPackage: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  isQualifying: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  effectiveFrom: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  effectiveTo: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: "packages",
  timestamps: true, // covers createdAt / updatedAt from the entity spec
});

module.exports = Package;