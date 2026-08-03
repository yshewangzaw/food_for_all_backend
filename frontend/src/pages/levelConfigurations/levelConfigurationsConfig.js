import * as yup from "yup";
import levelConfigurationService from "../../services/levelConfigurationService";
import { requiredText, optionalText, requiredInteger } from "../../utils/validators";
import {
  idColumn,
  strongColumn,
  textColumn,
  numberColumn,
  boolColumn,
  dateColumn,
  detail,
  detailBool,
  timestampDetails,
} from "../crud/columnHelpers";

/** /api/level-configurations — backend routes/levelConfigurationRoutes.js (full CRUD) */
export const levelConfigurationsConfig = {
  key: "levelConfigurations",
  title: "Level configuration",
  singular: "Level configuration",
  description: "How deep the referral tree pays out, and which levels earn at all.",
  service: levelConfigurationService,

  searchFields: ["name", "description"],
  initialSortKey: "maximumDepth",
  initialSortDir: "asc",

  columns: [
    idColumn(),
    strongColumn("name", "Configuration"),
    numberColumn("maximumDepth", "Max depth"),
    boolColumn("isCommissionEligible", "Earns commission"),
    boolColumn("isActive", "Active"),
    textColumn("description", "Description", { truncate: true }),
    dateColumn("createdAt", "Created"),
  ],

  fields: [
    { name: "name", label: "Configuration name", type: "text", required: true },
    {
      name: "maximumDepth",
      label: "Maximum depth",
      type: "number",
      required: true,
      min: 1,
      hint: "How many levels below a member this configuration reaches.",
    },
    { name: "description", label: "Description", type: "textarea", wide: true },
    {
      name: "isCommissionEligible",
      label: "Levels in this configuration earn commission",
      type: "checkbox",
      wide: true,
    },
    { name: "isActive", label: "Configuration is active", type: "checkbox", wide: true },
  ],

  schema: yup.object({
    name: requiredText("Configuration name"),
    maximumDepth: requiredInteger("Maximum depth", 1),
    description: optionalText("Description", 2000),
    isCommissionEligible: yup.boolean(),
    isActive: yup.boolean(),
  }),

  detailItems: (row) => [
    detail("Name", row.name),
    detail("Maximum depth", row.maximumDepth),
    detailBool("Commission eligible", row.isCommissionEligible),
    detailBool("Active", row.isActive),
    detail("Description", row.description, true),
    ...timestampDetails(row),
  ],
};

export default levelConfigurationsConfig;
