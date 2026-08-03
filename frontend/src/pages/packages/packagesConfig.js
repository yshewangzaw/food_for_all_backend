import * as yup from "yup";
import packageService from "../../services/packageService";
import { PACKAGE_CYCLES } from "../../constants/appConstants";
import { enumToOptions } from "../../utils/helpers";
import {
  requiredText,
  optionalText,
  requiredNumber,
  optionalNumber,
  requiredSelect,
  requiredDate,
  optionalDate,
  optionalUrl,
} from "../../utils/validators";
import {
  idColumn,
  monoColumn,
  strongColumn,
  moneyColumn,
  numberColumn,
  enumColumn,
  boolColumn,
  dateColumn,
  detail,
  detailMoney,
  detailBool,
  detailDate,
  timestampDetails,
} from "../crud/columnHelpers";

/** /api/packages — backend routes/packageRoutes.js (full CRUD) */
export const packagesConfig = {
  key: "packages",
  title: "Packages",
  singular: "Package",
  description:
    "Bundles members buy to join or to stay qualified. Entry packages activate an account.",
  service: packageService,

  searchFields: ["code", "name", "description", "cycle"],
  initialSortKey: "name",
  initialSortDir: "asc",

  columns: [
    idColumn(),
    monoColumn("code", "Code", { width: 120 }),
    strongColumn("name", "Package"),
    moneyColumn("price", "Price"),
    numberColumn("pvValue", "PV"),
    enumColumn("cycle", "Cycle"),
    boolColumn("isEntryPackage", "Entry"),
    boolColumn("isQualifying", "Qualifying"),
    boolColumn("isActive", "Active"),
    dateColumn("effectiveFrom", "Effective from"),
  ],

  fields: [
    { name: "code", label: "Package code", type: "text", required: true, hint: "Must be unique." },
    { name: "name", label: "Package name", type: "text", required: true },
    { name: "price", label: "Price", type: "number", step: "0.01", required: true },
    { name: "pvValue", label: "PV value", type: "number", step: "0.01" },
    {
      name: "cycle",
      label: "Billing cycle",
      type: "select",
      required: true,
      options: enumToOptions(PACKAGE_CYCLES),
    },
    { name: "effectiveFrom", label: "Effective from", type: "date", required: true },
    { name: "effectiveTo", label: "Effective to", type: "date" },
    { name: "imageUrl", label: "Image URL", type: "text" },
    { name: "description", label: "Description", type: "textarea", wide: true },
    {
      name: "isEntryPackage",
      label: "This is an entry package (activates a new member)",
      type: "checkbox",
      wide: true,
    },
    {
      name: "isQualifying",
      label: "Counts towards monthly qualification",
      type: "checkbox",
      wide: true,
    },
    { name: "isActive", label: "Package is active and purchasable", type: "checkbox", wide: true },
  ],

  schema: yup.object({
    code: requiredText("Package code", 2, 60),
    name: requiredText("Package name"),
    price: requiredNumber("Price", 0),
    pvValue: optionalNumber("PV value", 0),
    cycle: requiredSelect("Cycle"),
    effectiveFrom: requiredDate("Effective from"),
    effectiveTo: optionalDate("Effective to"),
    imageUrl: optionalUrl("Image URL"),
    description: optionalText("Description", 2000),
    isEntryPackage: yup.boolean(),
    isQualifying: yup.boolean(),
    isActive: yup.boolean(),
  }),

  detailItems: (row) => [
    detail("Code", row.code),
    detail("Name", row.name),
    detailMoney("Price", row.price),
    detail("PV value", row.pvValue),
    detail("Cycle", row.cycle),
    detailBool("Entry package", row.isEntryPackage),
    detailBool("Qualifying", row.isQualifying),
    detailBool("Active", row.isActive),
    detailDate("Effective from", row.effectiveFrom),
    detailDate("Effective to", row.effectiveTo),
    detail("Description", row.description, true),
    ...timestampDetails(row),
  ],
};

export default packagesConfig;
