/**
 * Values copied from the backend Sequelize models (backend/src/models/*.js).
 * If the backend enum changes, change it here too — nothing else needs editing.
 */

export const APP_NAME = "Network CMS";

export const PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export const USER_ROLES = ["ADMIN", "MEMBER"];

export const USER_STATUSES = [
  "PENDING",
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
  "BLOCKED",
];

export const KYC_STATUSES = ["NOT_SUBMITTED", "PENDING", "APPROVED", "REJECTED"];

export const KYC_DOCUMENT_STATUSES = ["PENDING", "APPROVED", "REJECTED"];

export const KYC_DOCUMENT_TYPES = [
  "NATIONAL_ID",
  "PASSPORT",
  "DRIVING_LICENCE",
];

export const ORDER_TYPES = [
  "ACTIVATION",
  "MONTHLY_QUALIFICATION",
  "RESALE",
  "CUSTOMER_PURCHASE",
];

export const ORDER_STATUSES = ["PENDING_PAYMENT", "PAID", "CANCELLED", "REFUNDED"];

export const ORDER_COMMISSION_STATUSES = ["NOT_PROCESSED", "PROCESSED", "REVERSED"];

export const ORDER_ITEM_TYPES = ["PACKAGE", "PRODUCT"];

export const PACKAGE_CYCLES = ["MONTHLY", "ONE_TIME"];

export const COMMISSION_TYPES = ["DIRECT_SALE", "REFERRAL"];

export const COMMISSION_STATUSES = ["PENDING", "CREDITED", "REVERSED"];

export const PAYMENT_METHOD_TYPES = ["BANK_TRANSFER", "MOBILE_MONEY", "CASH"];

export const PAYMENT_STATUSES = ["SUBMITTED", "APPROVED", "REJECTED", "CANCELLED"];

export const WITHDRAWAL_STATUSES = [
  "PENDING",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "PAID",
  "CANCELLED",
];

export const WALLET_TRANSACTION_TYPES = [
  "COMMISSION_CREDIT",
  "WITHDRAWAL_LOCK",
  "WITHDRAWAL_DEBIT",
  "WITHDRAWAL_REFUND",
  "ADJUSTMENT_CREDIT",
  "ADJUSTMENT_DEBIT",
  "REVERSAL",
];

export const WALLET_DIRECTIONS = ["CREDIT", "DEBIT"];

export const WALLET_REFERENCE_TYPES = ["COMMISSION", "WITHDRAWAL", "MANUAL"];

export const NOTIFICATION_CATEGORIES = [
  "NEWS",
  "COMMISSION",
  "WITHDRAWAL",
  "ORDER",
  "NETWORK",
  "KYC",
  "SYSTEM",
];

/** Maps any backend enum value to a badge colour. Used by StatusBadge. */
export const STATUS_TONES = {
  // positive / settled
  ACTIVE: "success",
  APPROVED: "success",
  PAID: "success",
  CREDITED: "success",
  PROCESSED: "success",
  CREDIT: "success",
  // waiting on someone
  PENDING: "warning",
  PENDING_PAYMENT: "warning",
  SUBMITTED: "warning",
  UNDER_REVIEW: "warning",
  NOT_PROCESSED: "warning",
  // failed / stopped
  REJECTED: "danger",
  BLOCKED: "danger",
  SUSPENDED: "danger",
  CANCELLED: "danger",
  REVERSED: "danger",
  REFUNDED: "danger",
  DEBIT: "danger",
  // informational
  ADMIN: "info",
  MEMBER: "neutral",
  INACTIVE: "neutral",
  NOT_SUBMITTED: "neutral",
};

/** Friendly copy for every HTTP status the axios interceptor can meet. */
export const ERROR_MESSAGES = {
  400: "That request wasn't valid. Check the highlighted fields and try again.",
  401: "Your session expired. Sign in again to continue.",
  403: "You don't have permission to do that.",
  404: "We couldn't find that record. It may have been deleted.",
  422: "Some fields didn't pass validation. Review them and resubmit.",
  500: "The server hit an error. Try again in a moment.",
  NETWORK: "Can't reach the server. Check your connection or the API URL.",
  UNKNOWN: "Something went wrong. Try again.",
};

export default APP_NAME;
