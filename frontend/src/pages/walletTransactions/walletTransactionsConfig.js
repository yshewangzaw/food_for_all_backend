import * as yup from "yup";
import walletTransactionService from "../../services/walletTransactionService";
import userService from "../../services/userService";
import {
  WALLET_TRANSACTION_TYPES,
  WALLET_DIRECTIONS,
  WALLET_REFERENCE_TYPES,
} from "../../constants/appConstants";
import { enumToOptions } from "../../utils/helpers";
import {
  optionalText,
  requiredNumber,
  requiredId,
  optionalId,
  requiredSelect,
  optionalSelect,
} from "../../utils/validators";
import { userOptions } from "../crud/optionBuilders";
import {
  idColumn,
  refColumn,
  enumColumn,
  badgeColumn,
  moneyColumn,
  dateColumn,
  detail,
  detailBadge,
  detailMoney,
  detailDate,
} from "../crud/columnHelpers";

/**
 * /api/wallet-transactions — backend routes/walletTransactionRoutes.js
 *
 * This router exposes GET and POST only. The WalletTransaction model sets
 * updatedAt:false because the ledger is append-only, so editing and deleting
 * are switched off here on purpose.
 * TODO(backend): add PUT/DELETE only if entries are ever meant to be amended.
 */
export const walletTransactionsConfig = {
  key: "walletTransactions",
  title: "Wallet ledger",
  singular: "Ledger entry",
  description: "Append-only record of every credit and debit against a member wallet.",
  service: walletTransactionService,

  lookups: { users: userService },

  canEdit: false,
  canDelete: false,

  notice:
    "The wallet ledger is append-only. Entries can be added and read, but never edited or deleted — post a reversal instead.",

  searchFields: ["transactionType", "direction", "description", "referenceType"],
  initialSortKey: "createdAt",
  initialSortDir: "desc",

  columns: [
    idColumn(),
    refColumn("userId", "Member"),
    enumColumn("transactionType", "Transaction type"),
    badgeColumn("direction", "Direction"),
    moneyColumn("amount", "Amount"),
    moneyColumn("balanceBefore", "Balance before"),
    moneyColumn("balanceAfter", "Balance after"),
    enumColumn("referenceType", "Reference"),
    dateColumn("createdAt", "Posted"),
  ],

  buildFields: (lookups) => [
    { name: "userId", label: "Member", type: "select", required: true, options: userOptions(lookups) },
    {
      name: "transactionType",
      label: "Transaction type",
      type: "select",
      required: true,
      options: enumToOptions(WALLET_TRANSACTION_TYPES),
    },
    {
      name: "direction",
      label: "Direction",
      type: "select",
      required: true,
      options: enumToOptions(WALLET_DIRECTIONS),
    },
    { name: "amount", label: "Amount", type: "number", step: "0.01", required: true },
    {
      name: "balanceBefore",
      label: "Balance before",
      type: "number",
      step: "0.01",
      required: true,
    },
    {
      name: "balanceAfter",
      label: "Balance after",
      type: "number",
      step: "0.01",
      required: true,
    },
    {
      name: "referenceType",
      label: "Reference type",
      type: "select",
      options: enumToOptions(WALLET_REFERENCE_TYPES),
    },
    { name: "referenceId", label: "Reference id", type: "number" },
    { name: "createdById", label: "Posted by (user id)", type: "select", options: userOptions(lookups) },
    { name: "description", label: "Description", type: "textarea", wide: true },
  ],

  schema: yup.object({
    userId: requiredId("Member"),
    transactionType: requiredSelect("Transaction type"),
    direction: requiredSelect("Direction"),
    amount: requiredNumber("Amount", 0),
    balanceBefore: requiredNumber("Balance before", 0),
    balanceAfter: requiredNumber("Balance after", 0),
    referenceType: optionalSelect(),
    referenceId: optionalId("Reference id"),
    createdById: optionalId("Posted by"),
    description: optionalText("Description", 1000),
  }),

  detailItems: (row) => [
    detail("Member user id", `#${row.userId}`),
    detail("Transaction type", row.transactionType),
    detailBadge("Direction", row.direction),
    detailMoney("Amount", row.amount),
    detailMoney("Balance before", row.balanceBefore),
    detailMoney("Balance after", row.balanceAfter),
    detail("Reference type", row.referenceType),
    detail("Reference id", row.referenceId ? `#${row.referenceId}` : "—"),
    detail("Posted by", row.createdById ? `#${row.createdById}` : "System"),
    detailDate("Posted", row.createdAt),
    detail("Description", row.description, true),
  ],
};

export default walletTransactionsConfig;
