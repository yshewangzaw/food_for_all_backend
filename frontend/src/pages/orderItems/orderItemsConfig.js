import * as yup from "yup";
import orderItemService from "../../services/orderItemService";
import orderService from "../../services/orderService";
import packageService from "../../services/packageService";
import productService from "../../services/productService";
import { ORDER_ITEM_TYPES } from "../../constants/appConstants";
import { enumToOptions } from "../../utils/helpers";
import {
  requiredText,
  requiredNumber,
  optionalNumber,
  requiredId,
  optionalId,
  requiredInteger,
  requiredSelect,
} from "../../utils/validators";
import { orderOptions, packageOptions, productOptions } from "../crud/optionBuilders";
import {
  idColumn,
  refColumn,
  enumColumn,
  strongColumn,
  moneyColumn,
  numberColumn,
  dateColumn,
  detail,
  detailMoney,
  timestampDetails,
} from "../crud/columnHelpers";

/** /api/order-items — backend routes/orderItemRoutes.js (full CRUD + /order/:orderId) */
export const orderItemsConfig = {
  key: "orderItems",
  title: "Order items",
  singular: "Order item",
  description: "The individual lines that make up each order.",
  service: orderItemService,

  lookups: { orders: orderService, packages: packageService, products: productService },

  searchFields: ["itemName", "itemType", "orderId"],
  initialSortKey: "orderId",
  initialSortDir: "desc",

  columns: [
    idColumn(),
    refColumn("orderId", "Order"),
    enumColumn("itemType", "Type"),
    strongColumn("itemName", "Item"),
    moneyColumn("unitPrice", "Unit price"),
    numberColumn("quantity", "Qty"),
    numberColumn("pvTotal", "PV total"),
    dateColumn("createdAt", "Added"),
  ],

  buildFields: (lookups) => [
    { name: "orderId", label: "Order", type: "select", required: true, options: orderOptions(lookups) },
    {
      name: "itemType",
      label: "Item type",
      type: "select",
      required: true,
      options: enumToOptions(ORDER_ITEM_TYPES),
    },
    { name: "itemName", label: "Item name", type: "text", required: true },
    {
      name: "packageId",
      label: "Package",
      type: "select",
      options: packageOptions(lookups),
      hint: "Fill this in only when the item type is Package.",
    },
    {
      name: "productId",
      label: "Product",
      type: "select",
      options: productOptions(lookups),
      hint: "Fill this in only when the item type is Product.",
    },
    { name: "unitPrice", label: "Unit price", type: "number", step: "0.01", required: true },
    { name: "quantity", label: "Quantity", type: "number", required: true, min: 1 },
    { name: "pvTotal", label: "PV total", type: "number", step: "0.01" },
  ],

  schema: yup.object({
    orderId: requiredId("Order"),
    itemType: requiredSelect("Item type"),
    itemName: requiredText("Item name"),
    packageId: optionalId("Package"),
    productId: optionalId("Product"),
    unitPrice: requiredNumber("Unit price", 0),
    quantity: requiredInteger("Quantity", 1),
    pvTotal: optionalNumber("PV total", 0),
  }),

  detailItems: (row) => [
    detail("Order id", `#${row.orderId}`),
    detail("Item type", row.itemType),
    detail("Item name", row.itemName),
    detail("Package id", row.packageId ? `#${row.packageId}` : "—"),
    detail("Product id", row.productId ? `#${row.productId}` : "—"),
    detailMoney("Unit price", row.unitPrice),
    detail("Quantity", row.quantity),
    detail("PV total", row.pvTotal),
    ...timestampDetails(row),
  ],
};

export default orderItemsConfig;
