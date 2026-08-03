import * as yup from "yup";
import paymentMethodService from "../../services/paymentMethodService";
import { PAYMENT_METHOD_TYPES } from "../../constants/appConstants";
import { enumToOptions } from "../../utils/helpers";
import {
  requiredText,
  optionalText,
  optionalNumber,
  requiredSelect,
} from "../../utils/validators";
import {
  idColumn,
  monoColumn,
  strongColumn,
  enumColumn,
  textColumn,
  moneyColumn,
  boolColumn,
  detail,
  detailMoney,
  detailBool,
  timestampDetails,
} from "../crud/columnHelpers";

/** /api/payment-methods — backend routes/paymentMethodRoutes.js (full CRUD) */
export const paymentMethodsConfig = {
  key: "paymentMethods",
  title: "Payment methods",
  singular: "Payment method",
  description: "The bank accounts, mobile money numbers and cash points members can pay into.",
  service: paymentMethodService,

  searchFields: ["code", "name", "methodType", "accountDetails", "instructions"],
  initialSortKey: "name",
  initialSortDir: "asc",

  columns: [
    idColumn(),
    monoColumn("code", "Code", { width: 120 }),
    strongColumn("name", "Method"),
    enumColumn("methodType", "Type"),
    textColumn("accountDetails", "Account details", { truncate: true }),
    moneyColumn("minAmount", "Min"),
    moneyColumn("maxAmount", "Max"),
    boolColumn("isActive", "Active"),
  ],

  fields: [
    { name: "code", label: "Code", type: "text", required: true, hint: "Must be unique." },
    { name: "name", label: "Display name", type: "text", required: true },
    {
      name: "methodType",
      label: "Method type",
      type: "select",
      required: true,
      options: enumToOptions(PAYMENT_METHOD_TYPES),
    },
    { name: "minAmount", label: "Minimum amount", type: "number", step: "0.01", min: 0 },
    { name: "maxAmount", label: "Maximum amount", type: "number", step: "0.01", min: 0 },
    {
      name: "accountDetails",
      label: "Account details",
      type: "textarea",
      required: true,
      wide: true,
      hint: "Bank name, account number, account holder — whatever the member needs to pay.",
    },
    {
      name: "instructions",
      label: "Instructions for members",
      type: "textarea",
      wide: true,
    },
    { name: "isActive", label: "Method is active", type: "checkbox", wide: true },
  ],

  schema: yup.object({
    code: requiredText("Code", 2, 60),
    name: requiredText("Display name"),
    methodType: requiredSelect("Method type"),
    minAmount: optionalNumber("Minimum amount", 0),
    maxAmount: optionalNumber("Maximum amount", 0),
    accountDetails: requiredText("Account details", 3, 1000),
    instructions: optionalText("Instructions", 2000),
    isActive: yup.boolean(),
  }),

  detailItems: (row) => [
    detail("Code", row.code),
    detail("Name", row.name),
    detail("Method type", row.methodType),
    detailMoney("Minimum amount", row.minAmount),
    detailMoney("Maximum amount", row.maxAmount),
    detailBool("Active", row.isActive),
    detail("Account details", row.accountDetails, true),
    detail("Instructions", row.instructions, true),
    ...timestampDetails(row),
  ],
};

export default paymentMethodsConfig;
