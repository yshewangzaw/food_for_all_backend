import * as yup from "yup";
import withdrawalRequestService from "../../services/withdrawalRequestService";
import userService from "../../services/userService";
import paymentMethodService from "../../services/paymentMethodService";
import { WITHDRAWAL_STATUSES } from "../../constants/appConstants";
import { enumToOptions } from "../../utils/helpers";
import {
  requiredText,
  optionalText,
  requiredNumber,
  requiredId,
  optionalSelect,
  optionalDate,
  optionalUrl,
} from "../../utils/validators";
import { userOptions, paymentMethodOptions } from "../crud/optionBuilders";
import {
  idColumn,
  refColumn,
  moneyColumn,
  monoColumn,
  badgeColumn,
  dateColumn,
  detail,
  detailBadge,
  detailMoney,
  detailDate,
  timestampDetails,
} from "../crud/columnHelpers";

/** /api/withdrawal-requests — backend routes/withdrawalRequestRoutes.js (full CRUD + /user/:userId) */
export const withdrawalRequestsConfig = {
  key: "withdrawalRequests",
  title: "Withdrawals",
  singular: "Withdrawal request",
  description: "Payout requests from member wallets, from first submission through to paid.",
  service: withdrawalRequestService,

  lookups: { users: userService, paymentMethods: paymentMethodService },

  searchFields: ["accountNumber", "status", "paymentReference", "rejectionReason"],
  initialSortKey: "createdAt",
  initialSortDir: "desc",

  columns: [
    idColumn(),
    refColumn("userId", "Member"),
    moneyColumn("amount", "Amount"),
    refColumn("paymentMethodId", "Method"),
    monoColumn("accountNumber", "Account"),
    badgeColumn("status", "Status"),
    monoColumn("paymentReference", "Payment ref"),
    dateColumn("createdAt", "Requested"),
  ],

  buildFields: (lookups) => [
    { name: "userId", label: "Member", type: "select", required: true, options: userOptions(lookups) },
    { name: "amount", label: "Amount", type: "number", step: "0.01", required: true },
    {
      name: "paymentMethodId",
      label: "Payment method",
      type: "select",
      required: true,
      options: paymentMethodOptions(lookups),
    },
    { name: "accountNumber", label: "Account number", type: "text", required: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: enumToOptions(WITHDRAWAL_STATUSES),
    },
    { name: "paymentReference", label: "Payment reference", type: "text" },
    { name: "paidAt", label: "Paid at", type: "datetime" },
    { name: "proofImageUrl", label: "Proof image URL", type: "text", wide: true },
    { name: "rejectionReason", label: "Rejection reason", type: "textarea", wide: true },
  ],

  schema: yup.object({
    userId: requiredId("Member"),
    amount: requiredNumber("Amount", 0),
    paymentMethodId: requiredId("Payment method"),
    accountNumber: requiredText("Account number", 3, 120),
    status: optionalSelect(),
    paymentReference: optionalText("Payment reference", 120),
    paidAt: optionalDate("Paid at"),
    proofImageUrl: optionalUrl("Proof image URL"),
    rejectionReason: optionalText("Rejection reason", 1000),
  }),

  detailItems: (row) => [
    detail("Member user id", `#${row.userId}`),
    detailMoney("Amount", row.amount),
    detail("Payment method id", `#${row.paymentMethodId}`),
    detail("Account number", row.accountNumber),
    detailBadge("Status", row.status),
    detail("Payment reference", row.paymentReference),
    detailDate("Paid at", row.paidAt),
    detail("Proof image URL", row.proofImageUrl, true),
    detail("Rejection reason", row.rejectionReason, true),
    ...timestampDetails(row),
  ],
};

export default withdrawalRequestsConfig;
