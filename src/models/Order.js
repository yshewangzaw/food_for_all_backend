const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Order = sequelize.define("Order", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  orderType: {
    type: DataTypes.ENUM(
      "ACTIVATION",
      "MONTHLY_QUALIFICATION",
      "RESALE",
      "CUSTOMER_PURCHASE"
    ),
    allowNull: false,
  },
  buyerUserId: {
    type: DataTypes.INTEGER,
    allowNull: true, // nullable per spec — covers outside/customer purchases with no member account
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  totalPv: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM("PENDING_PAYMENT", "PAID", "CANCELLED", "REFUNDED"),
    allowNull: false,
    defaultValue: "PENDING_PAYMENT",
  },
  commissionStatus: {
    type: DataTypes.ENUM("NOT_PROCESSED", "PROCESSED", "REVERSED"),
    allowNull: false,
    defaultValue: "NOT_PROCESSED",
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: "orders",
  timestamps: true, // covers createdAt / updatedAt from the entity spec
});

module.exports = Order;