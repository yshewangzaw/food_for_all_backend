import * as yup from "yup";
import packageItemService from "../../services/packageItemService";
import packageService from "../../services/packageService";
import productService from "../../services/productService";
import { requiredId, requiredInteger } from "../../utils/validators";
import { packageOptions, productOptions } from "../crud/optionBuilders";
import {
  idColumn,
  refColumn,
  numberColumn,
  dateColumn,
  detail,
  timestampDetails,
} from "../crud/columnHelpers";

/**
 * /api/package-items — backend routes/packageItemRoutes.js (full CRUD)
 * Join table: which products, and how many, make up a package.
 */
export const packageItemsConfig = {
  key: "packageItems",
  title: "Package items",
  singular: "Package item",
  description: "The products inside each package, and the quantity of each.",
  service: packageItemService,

  // Dropdown sources — CrudPage fetches these and passes them to buildFields.
  lookups: { packages: packageService, products: productService },

  searchFields: ["packageId", "productId", "quantity"],
  initialSortKey: "packageId",
  initialSortDir: "asc",

  columns: [
    idColumn(),
    refColumn("packageId", "Package"),
    refColumn("productId", "Product"),
    numberColumn("quantity", "Quantity"),
    dateColumn("createdAt", "Added"),
  ],

  buildFields: (lookups) => [
    {
      name: "packageId",
      label: "Package",
      type: "select",
      required: true,
      options: packageOptions(lookups),
    },
    {
      name: "productId",
      label: "Product",
      type: "select",
      required: true,
      options: productOptions(lookups),
    },
    { name: "quantity", label: "Quantity", type: "number", required: true, min: 1 },
  ],

  schema: yup.object({
    packageId: requiredId("Package"),
    productId: requiredId("Product"),
    quantity: requiredInteger("Quantity", 1),
  }),

  detailItems: (row, lookups) => {
    const pack = (lookups?.packages || []).find((item) => item.id === row.packageId);
    const product = (lookups?.products || []).find((item) => item.id === row.productId);
    return [
      detail("Package", pack ? `#${pack.id} · ${pack.name}` : `#${row.packageId}`),
      detail("Product", product ? `#${product.id} · ${product.name}` : `#${row.productId}`),
      detail("Quantity", row.quantity),
      ...timestampDetails(row),
    ];
  },
};

export default packageItemsConfig;
