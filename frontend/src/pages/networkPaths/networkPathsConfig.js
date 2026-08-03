import * as yup from "yup";
import networkPathService from "../../services/networkPathService";
import userService from "../../services/userService";
import { requiredId, requiredInteger } from "../../utils/validators";
import { userOptions } from "../crud/optionBuilders";
import {
  idColumn,
  refColumn,
  numberColumn,
  dateColumn,
  detail,
  timestampDetails,
} from "../crud/columnHelpers";

/**
 * /api/network-paths — backend routes/networkPathRoutes.js (full CRUD).
 *
 * This is the closure table behind the referral tree: one row per
 * ancestor/descendant pair, with the number of levels between them.
 * Rows are normally created automatically by networkPathService.createPaths()
 * during registration — edit them by hand only to repair a broken tree.
 */
export const networkPathsConfig = {
  key: "networkPaths",
  title: "Network paths",
  singular: "Network path",
  description: "Ancestor-to-descendant links that make the referral tree searchable.",
  service: networkPathService,

  lookups: { users: userService },

  notice:
    "These rows are generated automatically when a member registers. Edit them only to repair a tree that has drifted out of shape.",

  searchFields: ["ancestorId", "descendantId", "level"],
  initialSortKey: "ancestorId",
  initialSortDir: "asc",

  columns: [
    idColumn(),
    refColumn("ancestorId", "Ancestor"),
    refColumn("descendantId", "Descendant"),
    numberColumn("level", "Levels apart"),
    dateColumn("createdAt", "Created"),
  ],

  buildFields: (lookups) => [
    {
      name: "ancestorId",
      label: "Ancestor",
      type: "select",
      required: true,
      options: userOptions(lookups),
      hint: "The member higher up the tree.",
    },
    {
      name: "descendantId",
      label: "Descendant",
      type: "select",
      required: true,
      options: userOptions(lookups),
      hint: "The member below them.",
    },
    {
      name: "level",
      label: "Levels apart",
      type: "number",
      required: true,
      min: 0,
      hint: "0 means the member's own row; 1 is a direct referral.",
    },
  ],

  schema: yup.object({
    ancestorId: requiredId("Ancestor"),
    descendantId: requiredId("Descendant"),
    level: requiredInteger("Levels apart", 0),
  }),

  detailItems: (row) => [
    detail("Ancestor user id", `#${row.ancestorId}`),
    detail("Descendant user id", `#${row.descendantId}`),
    detail("Levels apart", row.level),
    ...timestampDetails(row),
  ],
};

export default networkPathsConfig;
