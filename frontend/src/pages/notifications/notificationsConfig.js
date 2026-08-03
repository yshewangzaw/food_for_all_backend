import * as yup from "yup";
import notificationService from "../../services/notificationService";
import userService from "../../services/userService";
import { NOTIFICATION_CATEGORIES } from "../../constants/appConstants";
import { enumToOptions } from "../../utils/helpers";
import {
  requiredText,
  optionalText,
  requiredId,
  requiredSelect,
  optionalDate,
  optionalUrl,
} from "../../utils/validators";
import { userOptions } from "../crud/optionBuilders";
import {
  idColumn,
  refColumn,
  enumColumn,
  stackedColumn,
  boolColumn,
  dateColumn,
  detail,
  detailBool,
  detailDate,
  timestampDetails,
} from "../crud/columnHelpers";

/** /api/notifications — backend routes/notificationRoutes.js (full CRUD + /user/:userId) */
export const notificationsConfig = {
  key: "notifications",
  title: "Notifications",
  singular: "Notification",
  description: "Messages sent to members about commissions, orders, KYC and system news.",
  service: notificationService,

  lookups: { users: userService },

  searchFields: ["title", "body", "category"],
  initialSortKey: "createdAt",
  initialSortDir: "desc",

  columns: [
    idColumn(),
    refColumn("userId", "Recipient"),
    enumColumn("category", "Category"),
    stackedColumn("title", "body", "Message"),
    boolColumn("isRead", "Read"),
    dateColumn("createdAt", "Sent"),
  ],

  buildFields: (lookups) => [
    { name: "userId", label: "Recipient", type: "select", required: true, options: userOptions(lookups) },
    {
      name: "category",
      label: "Category",
      type: "select",
      required: true,
      options: enumToOptions(NOTIFICATION_CATEGORIES),
    },
    { name: "title", label: "Title", type: "text", required: true, wide: true },
    { name: "body", label: "Message", type: "textarea", required: true, wide: true },
    { name: "linkUrl", label: "Link URL", type: "text", wide: true, hint: "Where tapping the notification takes the member." },
    { name: "readAt", label: "Read at", type: "datetime" },
    { name: "emailSentAt", label: "Email sent at", type: "datetime" },
    { name: "isRead", label: "Mark as read", type: "checkbox", wide: true },
  ],

  schema: yup.object({
    userId: requiredId("Recipient"),
    category: requiredSelect("Category"),
    title: requiredText("Title", 2, 200),
    body: requiredText("Message", 2, 2000),
    linkUrl: optionalUrl("Link URL"),
    readAt: optionalDate("Read at"),
    emailSentAt: optionalDate("Email sent at"),
    isRead: yup.boolean(),
  }),

  detailItems: (row) => [
    detail("Recipient user id", `#${row.userId}`),
    detail("Category", row.category),
    detail("Title", row.title, true),
    detail("Message", row.body, true),
    detail("Link URL", row.linkUrl, true),
    detailBool("Read", row.isRead),
    detailDate("Read at", row.readAt),
    detailDate("Email sent at", row.emailSentAt),
    ...timestampDetails(row),
  ],
};

export default notificationsConfig;
