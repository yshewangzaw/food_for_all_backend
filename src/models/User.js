const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    role: {
      type: DataTypes.ENUM("ADMIN", "MEMBER"),
      allowNull: false,
      defaultValue: "MEMBER",
    },

    referralCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    qrImageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    sponsorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    depth: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    directReferralCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    status: {
      type: DataTypes.ENUM(
        "PENDING",
        "ACTIVE",
        "INACTIVE",
        "SUSPENDED",
        "BLOCKED"
      ),
      allowNull: false,
      defaultValue: "PENDING",
    },

    activatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    phoneVerifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    kycStatus: {
      type: DataTypes.ENUM(
        "NOT_SUBMITTED",
        "PENDING",
        "APPROVED",
        "REJECTED"
      ),
      allowNull: false,
      defaultValue: "NOT_SUBMITTED",
    },

    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },

   wallet: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.0,
      comment: "AVAILABLE balance — spendable, withdrawable",
    },

    // ---- ADD THIS ----
    lockedBalance: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.0,
      comment: "Committed to a pending withdrawal. Not spendable.",
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    avatarUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // ---- Auth session fields (added for login/refresh/logout/reset/OTP) ----

    refreshTokenHash: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    resetTokenHash: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    resetTokenExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    otpHash: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    otpExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
  }
);

const NetworkPath = require("./NetworkPath");

User.hasMany(NetworkPath, {
  foreignKey: "ancestorId",
  as: "downline",
});

User.hasMany(NetworkPath, {
  foreignKey: "descendantId",
  as: "upline",
});

module.exports = User;