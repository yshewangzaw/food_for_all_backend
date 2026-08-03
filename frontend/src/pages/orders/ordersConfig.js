import * as yup from "yup";
import orderService from "../../services/orderService";
import userService from "../../services/userService";
import {
  ORDER_TYPES,
  ORDER_STATUSES,
  ORDER_COMMISSION_STATUSES,
} from "../../constants/appConstants";
import { enumToOptions } from "../../utils/helpers";
import {
  requiredText,
  optionalText,
  requiredNumber,
  optionalNumber,
  requiredSelect,
  optionalSelect,
  optionalId,
} from "../../utils/validators";
import { userOptions } from "../crud/optionBuilders";
import {
  idColumn,
  monoColumn,
  enumColumn,
  refColumn,
  moneyColumn,
  numberColumn,
  badgeColumn,
  dateColumn,
  detail,
  detailBadge,
  detailMoney,
  timestampDetails,
} from "../crud/columnHelpers";

/** /api/orders — backend routes/orderRoutes.js (full CRUD) */
export const ordersConfig = {
  key: "orders",
  title: "Orders",
  singular: "Order",
  description: "Activation, qualification, resale and customer purchases.",
  service: orderService,

  lookups: { users: userService },

  searchFields: ["orderNumber", "orderType", "status", "commissionStatus", "note"],
  initialSortKey: "createdAt",
  initialSortDir: "desc",

  columns: [
    idColumn(),
    monoColumn("orderNumber", "Order no."),
    enumColumn("orderType", "Type"),
    refColumn("buyerUserId", "Buyer"),
    moneyColumn("subtotal", "Subtotal"),
    moneyColumn("totalAmount", "Total"),
    numberColumn("totalPv", "PV"),
    badgeColumn("status", "Status"),
    badgeColumn("commissionStatus", "Commission"),
    dateColumn("createdAt", "Placed"),
  ],

  buildFields: (lookups) => [
    { name: "orderNumber", label: "Order number", type: "text", required: true, hint: "Must be unique." },
    {
      name: "orderType",
      label: "Order type",
      type: "select",
      required: true,
      options: enumToOptions(ORDER_TYPES),
    },
    {
      name: "buyerUserId",
      label: "Buyer",
      type: "select",
      options: userOptions(lookups),
      hint: "Leave empty for a walk-in customer with no member account.",
    },
    { name: "subtotal", label: "Subtotal", type: "number", step: "0.01", required: true },
    { name: "totalAmount", label: "Total amount", type: "number", step: "0.01", required: true },
    { name: "totalPv", label: "Total PV", type: "number", step: "0.01" },
    {
      name: "status",
      label: "Payment status",
      type: "select",
      options: enumToOptions(ORDER_STATUSES),
    },
    {
      name: "commissionStatus",
      label: "Commission status",
      type: "select",
      options: enumToOptions(ORDER_COMMISSION_STATUSES),
    },
    { name: "note", label: "Note", type: "textarea", wide: true },
  ],

  schema: yup.object({
    orderNumber: requiredText("Order number", 2, 60),
    orderType: requiredSelect("Order type"),
    buyerUserId: optionalId("Buyer"),
    subtotal: requiredNumber("Subtotal", 0),
    totalAmount: requiredNumber("Total amount", 0),
    totalPv: optionalNumber("Total PV", 0),
    status: optionalSelect(),
    commissionStatus: optionalSelect(),
    note: optionalText("Note", 1000),
  }),

  detailItems: (row) => [
    detail("Order number", row.orderNumber),
    detail("Order type", row.orderType),
    detail("Buyer user id", row.buyerUserId ? `#${row.buyerUserId}` : "Walk-in customer"),
    detailMoney("Subtotal", row.subtotal),
    detailMoney("Total amount", row.totalAmount),
    detail("Total PV", row.totalPv),
    detailBadge("Status", row.status),
    detailBadge("Commission status", row.commissionStatus),
    detail("Note", row.note, true),
    ...timestampDetails(row),
  ],
};

export default ordersConfig;
