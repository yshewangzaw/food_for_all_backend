const sequelize = require("../config/database");

const NetworkPath = require("./NetworkPath");
const KycDocument = require("./KycDocument");
const User = require("./User");
const Product = require("./Product");
const Package = require("./Package");
const PackageItem = require("./PackageItem");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const WalletTransaction = require("./WalletTransaction");
const Commission = require("./Commission");
const CommissionRule = require("./CommissionRule");
const LevelConfiguration = require("./LevelConfiguration");
const PaymentMethod = require("./PaymentMethod");
const Payment = require("./Payment");
const WithdrawalRequest = require("./WithdrawalRequest");
const Notification = require("./Notification");
const MemberQualification = require("./MemberQualification");

// ============================================================
// User — sponsor chain
// ============================================================
User.belongsTo(User, { as: "sponsor", foreignKey: "sponsorId" });
User.hasMany(User, { as: "referrals", foreignKey: "sponsorId" });

// ============================================================
// NetworkPath (closure table)
// ============================================================
NetworkPath.belongsTo(User, { as: "ancestor", foreignKey: "ancestorId" });
NetworkPath.belongsTo(User, { as: "descendant", foreignKey: "descendantId" });
User.hasMany(NetworkPath, { as: "descendantPaths", foreignKey: "ancestorId" });
User.hasMany(NetworkPath, { as: "ancestorPaths", foreignKey: "descendantId" });

// ============================================================
// Orders
// ============================================================
User.hasMany(Order, { foreignKey: "buyerUserId" });
Order.belongsTo(User, { foreignKey: "buyerUserId" });
Order.hasMany(OrderItem, { as: "items", foreignKey: "orderId" });

OrderItem.belongsTo(Order, { foreignKey: "orderId", as: "order" });
OrderItem.belongsTo(Product, { foreignKey: "productId", as: "product" });
OrderItem.belongsTo(Package, { foreignKey: "packageId", as: "package" });

// ============================================================
// Commissions
// ============================================================
User.hasMany(Commission, {
  foreignKey: "beneficiaryUserId",
  as: "receivedCommissions",
});
Commission.belongsTo(User, {
  foreignKey: "beneficiaryUserId",
  as: "beneficiaryUser",
});

User.hasMany(Commission, {
  foreignKey: "sourceUserId",
  as: "sourceCommissions",
});
Commission.belongsTo(User, { foreignKey: "sourceUserId", as: "sourceUser" });

CommissionRule.hasMany(Commission, {
  foreignKey: "commissionRuleId",
  as: "commissions",
});
Commission.belongsTo(CommissionRule, {
  foreignKey: "commissionRuleId",
  as: "rule",
});

// Needed for GET /commissions/:id/order and idempotent per-order processing
Order.hasMany(Commission, { foreignKey: "orderId", as: "commissions" });
Commission.belongsTo(Order, { foreignKey: "orderId", as: "order" });

LevelConfiguration.hasMany(CommissionRule, {
  foreignKey: "levelConfigurationId",
});
CommissionRule.belongsTo(LevelConfiguration, {
  foreignKey: "levelConfigurationId",
});

// ============================================================
// Packages & products
// ============================================================
Package.hasMany(PackageItem, { as: "items", foreignKey: "packageId" });
PackageItem.belongsTo(Package, { foreignKey: "packageId", as: "package" });
Product.hasMany(PackageItem, { foreignKey: "productId" });
PackageItem.belongsTo(Product, { foreignKey: "productId", as: "product" });

// ============================================================
// Wallet
// ============================================================
User.hasMany(WalletTransaction, { as: "transactions", foreignKey: "userId" });
WalletTransaction.belongsTo(User, { foreignKey: "userId" });

// ============================================================
// Payments
// ============================================================
PaymentMethod.hasMany(Payment, { foreignKey: "paymentMethodId" });
Payment.belongsTo(PaymentMethod, { foreignKey: "paymentMethodId" });

Order.hasMany(Payment, { foreignKey: "orderId" });
Payment.belongsTo(Order, { foreignKey: "orderId" });

User.hasMany(Payment, { foreignKey: "userId", as: "payments" });
Payment.belongsTo(User, { foreignKey: "userId", as: "payer" });

User.hasMany(Payment, { foreignKey: "reviewedById", as: "reviewedPayments" });
Payment.belongsTo(User, { foreignKey: "reviewedById", as: "reviewer" });

// ============================================================
// Withdrawals
// ============================================================
User.hasMany(WithdrawalRequest, {
  foreignKey: "userId",
  as: "withdrawalRequests",
});
WithdrawalRequest.belongsTo(User, { foreignKey: "userId", as: "user" });

// Requires the reviewedById column — see WithdrawalRequest patch
User.hasMany(WithdrawalRequest, {
  foreignKey: "reviewedById",
  as: "reviewedWithdrawals",
});
WithdrawalRequest.belongsTo(User, {
  foreignKey: "reviewedById",
  as: "reviewer",
});

PaymentMethod.hasMany(WithdrawalRequest, { foreignKey: "paymentMethodId" });
WithdrawalRequest.belongsTo(PaymentMethod, { foreignKey: "paymentMethodId" });

// ============================================================
// KYC
// ============================================================
User.hasMany(KycDocument, { foreignKey: "userId", as: "kycDocuments" });
KycDocument.belongsTo(User, { foreignKey: "userId", as: "user" });

// NOTE: KycDocument has no reviewedById column yet. Add it to the model
// and the table before enabling this line, or GET /kyc-documents/:id/reviewer
// will fail. See schema gaps #9.
// KycDocument.belongsTo(User, { foreignKey: "reviewedById", as: "reviewer" });

// ============================================================
// Notifications
// ============================================================
User.hasMany(Notification, { foreignKey: "userId", as: "notifications" });
Notification.belongsTo(User, { foreignKey: "userId", as: "user" });

// ============================================================
// Member qualification (schema gap #2)
// ============================================================
User.hasMany(MemberQualification, {
  foreignKey: "userId",
  as: "qualifications",
});
MemberQualification.belongsTo(User, { foreignKey: "userId", as: "user" });
Order.hasMany(MemberQualification, { foreignKey: "orderId" });
MemberQualification.belongsTo(Order, { foreignKey: "orderId", as: "order" });

module.exports = {
  sequelize,
  User,
  NetworkPath,
  KycDocument,
  Product,
  Package,
  PackageItem,
  Order,
  OrderItem,
  WalletTransaction,
  Commission,
  CommissionRule,
  LevelConfiguration,
  PaymentMethod,
  Payment,
  WithdrawalRequest,
  Notification,
  MemberQualification,
};