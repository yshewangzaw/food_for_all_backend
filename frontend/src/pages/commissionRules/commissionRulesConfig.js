import * as yup from "yup";
import commissionRuleService from "../../services/commissionRuleService";
import levelConfigurationService from "../../services/levelConfigurationService";
import { COMMISSION_TYPES } from "../../constants/appConstants";
import { enumToOptions } from "../../utils/helpers";
import {
  requiredText,
  optionalText,
  optionalNumber,
  requiredId,
  requiredSelect,
} from "../../utils/validators";
import { levelConfigurationOptions } from "../crud/optionBuilders";
import {
  idColumn,
  strongColumn,
  enumColumn,
  refColumn,
  numberColumn,
  moneyColumn,
  boolColumn,
  dateColumn,
  detail,
  detailMoney,
  detailBool,
  timestampDetails,
} from "../crud/columnHelpers";

/** /api/commission-rules — backend routes/commissionRuleRoutes.js (full CRUD) */
export const commissionRulesConfig = {
  key: "commissionRules",
  title: "Commission rules",
  singular: "Commission rule",
  description: "How much is paid out, at which level, and the PV needed to qualify.",
  service: commissionRuleService,

  lookups: { levelConfigurations: levelConfigurationService },

  searchFields: ["name", "commissionType", "description"],
  initialSortKey: "name",
  initialSortDir: "asc",

  columns: [
    idColumn(),
    strongColumn("name", "Rule"),
    enumColumn("commissionType", "Type"),
    refColumn("levelConfigurationId", "Level config"),
    numberColumn("minimumPV", "Minimum PV"),
    moneyColumn("maximumCommissionAmount", "Max payout"),
    boolColumn("isActive", "Active"),
    dateColumn("createdAt", "Created"),
  ],

  buildFields: (lookups) => [
    { name: "name", label: "Rule name", type: "text", required: true },
    {
      name: "commissionType",
      label: "Commission type",
      type: "select",
      required: true,
      options: enumToOptions(COMMISSION_TYPES),
    },
    {
      name: "levelConfigurationId",
      label: "Level configuration",
      type: "select",
      required: true,
      options: levelConfigurationOptions(lookups),
    },
    { name: "minimumPV", label: "Minimum PV", type: "number", step: "0.01", min: 0 },
    {
      name: "maximumCommissionAmount",
      label: "Maximum commission amount",
      type: "number",
      step: "0.01",
      min: 0,
      hint: "Leave blank for no ceiling.",
    },
    { name: "description", label: "Description", type: "textarea", wide: true },
    { name: "isActive", label: "Rule is active", type: "checkbox", wide: true },
  ],

  schema: yup.object({
    name: requiredText("Rule name"),
    commissionType: requiredSelect("Commission type"),
    levelConfigurationId: requiredId("Level configuration"),
    minimumPV: optionalNumber("Minimum PV", 0),
    maximumCommissionAmount: optionalNumber("Maximum commission amount", 0),
    description: optionalText("Description", 2000),
    isActive: yup.boolean(),
  }),

  detailItems: (row) => [
    detail("Name", row.name),
    detail("Commission type", row.commissionType),
    detail("Level configuration id", `#${row.levelConfigurationId}`),
    detail("Minimum PV", row.minimumPV),
    detailMoney("Maximum commission", row.maximumCommissionAmount),
    detailBool("Active", row.isActive),
    detail("Description", row.description, true),
    ...timestampDetails(row),
  ],
};

export default commissionRulesConfig;
