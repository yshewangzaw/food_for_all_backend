require("dotenv").config();

const { DataTypes } = require("sequelize");
const app = require("./app");
const { sequelize } = require("./models");

const PORT = process.env.PORT || 5000;

async function ensureUserBalanceColumns() {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const table = await queryInterface.describeTable("users");

    if (!table.wallet) {
      await queryInterface.addColumn("users", "wallet", {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.0,
      });
      console.log("✅ Added missing wallet column to users");
    }

    if (!table.lockedBalance) {
      await queryInterface.addColumn("users", "lockedBalance", {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.0,
      });
      console.log("✅ Added missing lockedBalance column to users");
    }
  } catch (error) {
    if (
      error?.message?.includes("doesn't exist") ||
      error?.message?.includes("does not exist")
    ) {
      return;
    }
    throw error;
  }
}

async function ensureCommissionColumns() {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const table = await queryInterface.describeTable("commissions");

    if (!table.levelId) {
      await queryInterface.addColumn("commissions", "levelId", {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      });
      console.log("✅ Added missing levelId column to commissions");
    }

    if (!table.level) {
      await queryInterface.addColumn("commissions", "level", {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      });
      console.log("✅ Added missing level column to commissions");
    }

    if (!table.rateType) {
      await queryInterface.addColumn("commissions", "rateType", {
        type: DataTypes.ENUM("PERCENTAGE", "FLAT"),
        allowNull: false,
        defaultValue: "PERCENTAGE",
      });
      console.log("✅ Added missing rateType column to commissions");
    }

    if (!table.rateValue) {
      await queryInterface.addColumn("commissions", "rateValue", {
        type: DataTypes.DECIMAL(8, 3),
        allowNull: false,
        defaultValue: 0,
      });
      console.log("✅ Added missing rateValue column to commissions");
    }
  } catch (error) {
    if (
      error?.message?.includes("doesn't exist") ||
      error?.message?.includes("does not exist")
    ) {
      return;
    }
    throw error;
  }
}

async function ensureWithdrawalColumns() {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const table = await queryInterface.describeTable("withdrawal_requests");

    if (!table.reviewedById) {
      await queryInterface.addColumn("withdrawal_requests", "reviewedById", {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      });
      console.log("✅ Added missing reviewedById column to withdrawal_requests");
    }

    if (!table.reviewedAt) {
      await queryInterface.addColumn("withdrawal_requests", "reviewedAt", {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      });
      console.log("✅ Added missing reviewedAt column to withdrawal_requests");
    }

    if (!table.paidById) {
      await queryInterface.addColumn("withdrawal_requests", "paidById", {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      });
      console.log("✅ Added missing paidById column to withdrawal_requests");
    }

    if (!table.rejectionReason) {
      await queryInterface.addColumn("withdrawal_requests", "rejectionReason", {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      });
      console.log("✅ Added missing rejectionReason column to withdrawal_requests");
    }

    if (!table.paidAt) {
      await queryInterface.addColumn("withdrawal_requests", "paidAt", {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      });
      console.log("✅ Added missing paidAt column to withdrawal_requests");
    }

    if (!table.paymentReference) {
      await queryInterface.addColumn("withdrawal_requests", "paymentReference", {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      });
      console.log("✅ Added missing paymentReference column to withdrawal_requests");
    }

    if (!table.proofImageUrl) {
      await queryInterface.addColumn("withdrawal_requests", "proofImageUrl", {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      });
      console.log("✅ Added missing proofImageUrl column to withdrawal_requests");
    }
  } catch (error) {
    if (
      error?.message?.includes("doesn't exist") ||
      error?.message?.includes("does not exist")
    ) {
      return;
    }
    throw error;
  }
}

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database Connected");

    await ensureUserBalanceColumns();
    await ensureCommissionColumns();
    await ensureWithdrawalColumns();
    await sequelize.sync();
    console.log("✅ Models synchronized");

    app.listen(PORT, () => {
      console.log(`✅ Server Running on Port ${PORT}`);
      console.log(`🌍 API: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server");
    console.error(error);
    process.exit(1);
  }
}

startServer();
