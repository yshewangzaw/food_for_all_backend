const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/**
 * Schema gap #2. Your Payment approval notes say "the buyer's monthly
 * activity is updated" — but nothing stored it. Without this table the
 * commission engine re-derives qualification with a 3-table join for
 * every beneficiary on every sale (see commissionEngine.isQualifiedInMonth).
 *
 * One row per member per period. Written once when a qualifying payment
 * is approved, read constantly afterwards.
 */
const MemberQualification = sequelize.define(
  "MemberQualification",
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

    // "2026-07" — string, not a date, so the unique key is exact
    period: {
      type: DataTypes.STRING(7),
      allowNull: false,
    },

    orderId: {
      type: DataTypes.INTEGER,
      allowNull: true, // null when an admin grants it manually
    },

    isQualified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    qualifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    pvAchieved: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    source: {
      type: DataTypes.ENUM("ORDER", "MANUAL", "CARRIED_OVER"),
      allowNull: false,
      defaultValue: "ORDER",
    },

    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "member_qualifications",
    timestamps: true,
    indexes: [
      {
        name: "uq_member_period",
        unique: true,
        fields: ["userId", "period"],
      },
      { name: "idx_mq_period", fields: ["period", "isQualified"] },
    ],
  },
);

/** Turn a Date into the period key this table uses. */
MemberQualification.periodOf = (date = new Date()) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

module.exports = MemberQualification;