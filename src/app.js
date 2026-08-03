require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// =======================
// Middleware
// =======================
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images/files
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// =======================
// Routes
// =======================
const authRoutes = require("./routes/authRoutes");
const authSessionRoutes = require("./routes/authSessionRoutes");
const userRoutes = require("./routes/userRoutes");
const userRelationshipRoutes = require("./routes/userRelationshipRoutes");
const networkPathRoutes = require("./routes/networkPathRoutes");
const packageRoutes = require("./routes/packageRoutes");
const packageItemRoutes = require("./routes/packageItemRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const orderItemRoutes = require("./routes/orderItemRoutes");
const kycRoutes = require("./routes/kycRoutes");
const walletTransactionRoutes = require("./routes/walletTransactionRoutes");
const levelConfigExtendedRoutes = require("./routes/levelConfigExtendedRoutes");
const commissionRuleExtendedRoutes = require("./routes/commissionRuleExtendedRoutes");
const commissionRoutes = require("./routes/commissionRoutes");
const commissionRuleRoutes = require("./routes/commissionRuleRoutes");
const levelConfigurationRoutes = require("./routes/levelConfigurationRoutes");
const paymentMethodRoutes = require("./routes/paymentMethodRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const withdrawalRequestRoutes = require("./routes/withdrawalRequestRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const networkRelationshipRoutes = require("./routes/networkRelationshipRoutes");
const networkBusinessRoutes = require("./routes/networkBusinessRoutes");
const networkAdminRoutes = require("./routes/networkAdminRoutes");
const networkFilterRoutes = require("./routes/networkFilterRoutes");
const productExtendedRoutes = require("./routes/productExtendedRoutes");
const packageExtendedRoutes = require("./routes/packageExtendedRoutes");
const packageItemExtendedRoutes = require("./routes/packageItemExtendedRoutes");
const commissionExtendedRoutes = require("./routes/commissionExtendedRoutes");
const orderExtendedRoutes = require("./routes/orderExtendedRoutes");
const paymentExtendedRoutes = require("./routes/paymentExtendedRoutes");
const paymentMethodExtendedRoutes = require("./routes/paymentMethodExtendedRoutes");
const walletExtendedRoutes = require("./routes/walletExtendedRoutes");
const withdrawalExtendedRoutes = require("./routes/withdrawalExtendedRoutes");
const notificationExtendedRoutes = require("./routes/notificationExtendedRoutes");
const profileRoutes = require("./routes/profileRoutes");
const reportRoutes = require("./routes/reportRoutes");
const jobRoutes = require("./routes/jobRoutes");
// =======================
// API Endpoints
// =======================
app.use("/api/auth", authRoutes);
app.use("/api", authSessionRoutes);

app.use("/api", profileRoutes);
app.use("/api", userRelationshipRoutes);
app.use("/api/users", userRoutes);

app.use("/api", networkRelationshipRoutes);
app.use("/api", networkBusinessRoutes);
app.use("/api", networkAdminRoutes);
app.use("/api", networkFilterRoutes);
app.use("/api/network-paths", networkPathRoutes);

// Extended routes (static/specific paths) MUST come before the generic
// CRUD routes below, or Express matches things like "entry"/"categories"
// as if they were an :id value on the generic /:id route.
app.use("/api", productExtendedRoutes);
app.use("/api/products", productRoutes);

app.use("/api", packageExtendedRoutes);
app.use("/api", packageItemExtendedRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/package-items", packageItemRoutes);

app.use("/api", orderExtendedRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/order-items", orderItemRoutes);

app.use("/api/kyc", kycRoutes);

app.use("/api", walletExtendedRoutes);
app.use("/api/wallet-transactions", walletTransactionRoutes);
app.use("/api", levelConfigExtendedRoutes);
app.use("/api", commissionRuleExtendedRoutes);
app.use("/api/commissions", commissionRoutes);
app.use("/api/commission-rules", commissionRuleRoutes);
app.use("/api/level-configurations", levelConfigurationRoutes);

app.use("/api", paymentMethodExtendedRoutes);
app.use("/api", paymentExtendedRoutes);
app.use("/api/payment-methods", paymentMethodRoutes);
app.use("/api/payments", paymentRoutes);

app.use("/api", withdrawalExtendedRoutes);
app.use("/api/withdrawal-requests", withdrawalRequestRoutes);

app.use("/api", notificationExtendedRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api", commissionExtendedRoutes);

app.use("/api", reportRoutes);
app.use("/api", jobRoutes);
// =======================
// Health Check
// =======================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API is running successfully 🚀",
  });
});

// =======================
// 404 Handler
// =======================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// =======================
// Global Error Handler
// =======================
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;