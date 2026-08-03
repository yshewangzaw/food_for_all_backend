import * as yup from "yup";
import commissionService from "../../services/commissionService";
import userService from "../../services/userService";
import commissionRuleService from "../../services/commissionRuleService";
import { COMMISSION_TYPES, COMMISSION_STATUSES } from "../../constants/appConstants";
import { enumToOptions } from "../../utils/helpers";
import {
  optionalText,
  requiredNumber,
  requiredId,
  optionalId,
  requiredSelect,
  optionalSelect,
  optionalDate,
} from "../../utils/validators";
import { userOptions, commissionRuleOptions } from "../crud/optionBuilders";
import {
  idColumn,
  refColumn,
  enumColumn,
  moneyColumn,
  numberColumn,
  badgeColumn,
  dateColumn,
  detail,
  detailBadge,
  detailMoney,
  detailDate,
} from "../crud/columnHelpers";

/**
 * /api/commissions — backend routes/commissionRoutes.js
 * Full CRUD plus GET /commissions/user/:userId (used by the Profile page).
 *
 * NOTE: the Commission model sets updatedAt:false, so these records only have
 * a createdAt timestamp.
 */
export const commissionsConfig = {
  key: "commissions",
  title: "Commissions",
  singular: "Commission",
  description: "Every direct-sale and referral commission earned across the network.",
  service: commissionService,

  lookups: { users: userService, commissionRules: commissionRuleService },

  searchFields: ["commissionType", "status", "remarks", "forfeitReason"],
  initialSortKey: "createdAt",
  initialSortDir: "desc",

  columns: [
    idColumn(),
    refColumn("beneficiaryUserId", "Beneficiary"),
    refColumn("sourceUserId", "Source"),
    enumColumn("commissionType", "Type"),
    numberColumn("levelId", "Level"),
    moneyColumn("baseAmount", "Base"),
    moneyColumn("commissionAmount", "Commission"),
    badgeColumn("status", "Status"),
    dateColumn("createdAt", "Earned"),
  ],

  buildFields: (lookups) => [
    {
      name: "beneficiaryUserId",
      label: "Beneficiary",
      type: "select",
      required: true,
      options: userOptions(lookups),
      hint: "The member who earns this commission.",
    },
    {
      name: "sourceUserId",
      label: "Source member",
      type: "select",
      required: true,
      options: userOptions(lookups),
      hint: "The member whose purchase generated it.",
    },
    {
      name: "commissionType",
      label: "Commission type",
      type: "select",
      required: true,
      options: enumToOptions(COMMISSION_TYPES),
    },
    {
      name: "commissionRuleId",
      label: "Commission rule",
      type: "select",
      options: commissionRuleOptions(lookups),
    },
    { name: "levelId", label: "Level", type: "number", min: 0 },
    { name: "baseAmount", label: "Base amount", type: "number", step: "0.01", required: true },
    {
      name: "commissionAmount",
      label: "Commission amount",
      type: "number",
      step: "0.01",
      required: true,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: enumToOptions(COMMISSION_STATUSES),
    },
    { name: "creditedAt", label: "Credited at", type: "datetime" },
    { name: "forfeitReason", label: "Forfeit reason", type: "textarea", wide: true },
    { name: "remarks", label: "Remarks", type: "textarea", wide: true },
  ],

  schema: yup.object({
    beneficiaryUserId: requiredId("Beneficiary"),
    sourceUserId: requiredId("Source member"),
    commissionType: requiredSelect("Commission type"),
    commissionRuleId: optionalId("Commission rule"),
    levelId: optionalId("Level"),
    baseAmount: requiredNumber("Base amount", 0),
    commissionAmount: requiredNumber("Commission amount", 0),
    status: optionalSelect(),
    creditedAt: optionalDate("Credited at"),
    forfeitReason: optionalText("Forfeit reason", 1000),
    remarks: optionalText("Remarks", 1000),
  }),

  detailItems: (row) => [
    detail("Beneficiary user id", `#${row.beneficiaryUserId}`),
    detail("Source user id", `#${row.sourceUserId}`),
    detail("Commission type", row.commissionType),
    detail("Commission rule id", row.commissionRuleId ? `#${row.commissionRuleId}` : "—"),
    detail("Level", row.levelId),
    detailMoney("Base amount", row.baseAmount),
    detailMoney("Commission amount", row.commissionAmount),
    detailBadge("Status", row.status),
    detailDate("Credited at", row.creditedAt),
    detailDate("Created", row.createdAt),
    detail("Forfeit reason", row.forfeitReason, true),
    detail("Remarks", row.remarks, true),
  ],
};

export default commissionsConfig;
