import * as yup from "yup";
import productService from "../../services/productService";
import {
  requiredText,
  optionalText,
  requiredNumber,
  optionalNumber,
  optionalUrl,
} from "../../utils/validators";
import {
  idColumn,
  monoColumn,
  strongColumn,
  textColumn,
  moneyColumn,
  numberColumn,
  boolColumn,
  dateColumn,
  detail,
  detailMoney,
  detailBool,
  timestampDetails,
} from "../crud/columnHelpers";

/** /api/products — backend routes/productRoutes.js (full CRUD) */
export const productsConfig = {
  key: "products",
  title: "Products",
  singular: "Product",
  description: "Individual items that can be sold on their own or bundled into a package.",
  service: productService,

  searchFields: ["sku", "name", "category", "description", "unitOfMeasure"],
  initialSortKey: "name",
  initialSortDir: "asc",

  columns: [
    idColumn(),
    monoColumn("sku", "SKU", { width: 130 }),
    strongColumn("name", "Product"),
    textColumn("category", "Category"),
    moneyColumn("unitPrice", "Unit price"),
    numberColumn("pvValue", "PV"),
    textColumn("unitOfMeasure", "Unit"),
    boolColumn("isActive", "Active"),
    dateColumn("createdAt", "Added"),
  ],

  fields: [
    { name: "sku", label: "SKU", type: "text", required: true, hint: "Must be unique." },
    { name: "name", label: "Product name", type: "text", required: true },
    { name: "category", label: "Category", type: "text" },
    { name: "unitOfMeasure", label: "Unit of measure", type: "text", placeholder: "piece, box, litre" },
    { name: "unitPrice", label: "Unit price", type: "number", step: "0.01", required: true },
    { name: "pvValue", label: "PV value", type: "number", step: "0.01" },
    { name: "imageUrl", label: "Image URL", type: "text", wide: true },
    { name: "description", label: "Description", type: "textarea", wide: true },
    { name: "isActive", label: "Product is active and sellable", type: "checkbox", wide: true },
  ],

  schema: yup.object({
    sku: requiredText("SKU", 2, 60),
    name: requiredText("Product name"),
    category: optionalText("Category", 80),
    unitOfMeasure: optionalText("Unit of measure", 40),
    unitPrice: requiredNumber("Unit price", 0),
    pvValue: optionalNumber("PV value", 0),
    imageUrl: optionalUrl("Image URL"),
    description: optionalText("Description", 2000),
    isActive: yup.boolean(),
  }),

  detailItems: (row) => [
    detail("SKU", row.sku),
    detail("Name", row.name),
    detail("Category", row.category),
    detailMoney("Unit price", row.unitPrice),
    detail("PV value", row.pvValue),
    detail("Unit of measure", row.unitOfMeasure),
    detailBool("Active", row.isActive),
    detail("Image URL", row.imageUrl, true),
    detail("Description", row.description, true),
    ...timestampDetails(row),
  ],
};

export default productsConfig;
