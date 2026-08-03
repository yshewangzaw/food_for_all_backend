const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PackageItem = sequelize.define("PackageItem", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  packageId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
}, {
  tableName: "package_items",
  timestamps: true,
});

module.exports = PackageItem;