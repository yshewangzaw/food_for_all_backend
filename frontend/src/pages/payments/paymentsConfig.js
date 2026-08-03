import * as yup from "yup";
import paymentService from "../../services/paymentService";
import orderService from "../../services/orderService";
import userService from "../../services/userService";
import paymentMethodService from "../../services/paymentMethodService";
import { PAYMENT_STATUSES } from "../../constants/appConstants";
import { enumToOptions } from "../../utils/helpers";
import {
  optionalText,
  requiredNumber,
  requiredId,
  optionalId,
  optionalSelect,
  optionalDate,
  optionalUrl,
} from "../../utils/validators";
import { orderOptions, userOptions, paymentMethodOptions } from "../crud/optionBuilders";
import {
  idColumn,
  refColumn,
  monoColumn,
  moneyColumn,
  badgeColumn,
  dateColumn,
  detail,
  detailBadge,
  detailMoney,
  detailDate,
  timestampDetails,
} from "../crud/columnHelpers";

/** /api/payments — backend routes/paymentRoutes.js (full CRUD) */
export const paymentsConfig = {
  key: "payments",
  title: "Payments",
  singular: "Payment",
  description: "Proof-of-payment submissions waiting on review, and the ones already settled.",
  service: paymentService,

  lookups: { orders: orderService, users: userService, paymentMethods: paymentMethodService },

  searchFields: ["referenceNo", "status", "rejectionReason"],
  initialSortKey: "createdAt",
  initialSortDir: "desc",

  columns: [
    idColumn(),
    refColumn("orderId", "Order"),
    refColumn("userId", "Payer"),
    refColumn("paymentMethodId", "Method"),
    moneyColumn("amount", "Amount"),
    monoColumn("referenceNo", "Reference"),
    badgeColumn("status", "Status"),
    refColumn("reviewedById", "Reviewer"),
    dateColumn("createdAt", "Submitted"),
  ],

  buildFields: (lookups) => [
    { name: "orderId", label: "Order", type: "select", required: true, options: orderOptions(lookups) },
    { name: "userId", label: "Payer", type: "select", options: userOptions(lookups) },
    {
      name: "paymentMethodId",
      label: "Payment method",
      type: "select",
      required: true,
      options: paymentMethodOptions(lookups),
    },
    { name: "amount", label: "Amount", type: "number", step: "0.01", required: true },
    { name: "referenceNo", label: "Reference number", type: "text" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: enumToOptions(PAYMENT_STATUSES),
    },
    { name: "reviewedById", label: "Reviewed by (user id)", type: "select", options: userOptions(lookups) },
    { name: "reviewedAt", label: "Reviewed at", type: "datetime" },
    { name: "proofImageUrl", label: "Proof image URL", type: "text", wide: true },
    {
      name: "rejectionReason",
      label: "Rejection reason",
      type: "textarea",
      wide: true,
      hint: "Explain what was wrong so the member can resubmit.",
    },
  ],

  schema: yup.object({
    orderId: requiredId("Order"),
    userId: optionalId("Payer"),
    paymentMethodId: requiredId("Payment method"),
    amount: requiredNumber("Amount", 0),
    referenceNo: optionalText("Reference number", 120),
    status: optionalSelect(),
    reviewedById: optionalId("Reviewer"),
    reviewedAt: optionalDate("Reviewed at"),
    proofImageUrl: optionalUrl("Proof image URL"),
    rejectionReason: optionalText("Rejection reason", 1000),
  }),

  detailItems: (row) => [
    detail("Order id", `#${row.orderId}`),
    detail("Payer user id", row.userId ? `#${row.userId}` : "—"),
    detail("Payment method id", `#${row.paymentMethodId}`),
    detailMoney("Amount", row.amount),
    detail("Reference number", row.referenceNo),
    detailBadge("Status", row.status),
    detail("Reviewed by", row.reviewedById ? `#${row.reviewedById}` : "Not reviewed"),
    detailDate("Reviewed at", row.reviewedAt),
    detail("Proof image URL", row.proofImageUrl, true),
    detail("Rejection reason", row.rejectionReason, true),
    ...timestampDetails(row),
  ],
};

export default paymentsConfig;
