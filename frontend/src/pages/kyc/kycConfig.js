import * as yup from "yup";
import kycService from "../../services/kycService";
import userService from "../../services/userService";
import { KYC_DOCUMENT_TYPES, KYC_DOCUMENT_STATUSES } from "../../constants/appConstants";
import { enumToOptions } from "../../utils/helpers";
import {
  requiredText,
  optionalText,
  requiredId,
  requiredSelect,
  optionalSelect,
  optionalUrl,
} from "../../utils/validators";
import { userOptions } from "../crud/optionBuilders";
import {
  idColumn,
  refColumn,
  enumColumn,
  monoColumn,
  badgeColumn,
  dateColumn,
  detail,
  detailBadge,
  timestampDetails,
} from "../crud/columnHelpers";

/**
 * /api/kyc — backend routes/kycRoutes.js (full CRUD).
 * Serves the KycDocument model.
 *
 * TODO(backend): kycDocumentRoutes.js exists in the repo but is not mounted in
 * app.js and its controller file is missing, so /api/kyc is the only way in.
 */
export const kycConfig = {
  key: "kyc",
  title: "KYC documents",
  singular: "KYC document",
  description: "Identity documents submitted by members, and where each one stands.",
  service: kycService,

  lookups: { users: userService },

  searchFields: ["documentNumber", "documentType", "status", "rejectionReason"],
  initialSortKey: "createdAt",
  initialSortDir: "desc",

  columns: [
    idColumn(),
    refColumn("userId", "Member"),
    enumColumn("documentType", "Document type"),
    monoColumn("documentNumber", "Document number"),
    badgeColumn("status", "Status"),
    dateColumn("createdAt", "Submitted"),
  ],

  buildFields: (lookups) => [
    { name: "userId", label: "Member", type: "select", required: true, options: userOptions(lookups) },
    {
      name: "documentType",
      label: "Document type",
      type: "select",
      required: true,
      options: enumToOptions(KYC_DOCUMENT_TYPES),
    },
    { name: "documentNumber", label: "Document number", type: "text", required: true },
    {
      name: "status",
      label: "Review status",
      type: "select",
      options: enumToOptions(KYC_DOCUMENT_STATUSES),
    },
    { name: "frontImageUrl", label: "Front image URL", type: "text", required: true, wide: true },
    { name: "backImageUrl", label: "Back image URL", type: "text", wide: true },
    { name: "selfieImageUrl", label: "Selfie image URL", type: "text", wide: true },
    {
      name: "rejectionReason",
      label: "Rejection reason",
      type: "textarea",
      wide: true,
      hint: "Tell the member exactly what to fix before resubmitting.",
    },
  ],

  schema: yup.object({
    userId: requiredId("Member"),
    documentType: requiredSelect("Document type"),
    documentNumber: requiredText("Document number", 3, 120),
    status: optionalSelect(),
    frontImageUrl: requiredText("Front image URL", 3, 500),
    backImageUrl: optionalUrl("Back image URL"),
    selfieImageUrl: optionalUrl("Selfie image URL"),
    rejectionReason: optionalText("Rejection reason", 1000),
  }),

  detailItems: (row) => [
    detail("Member user id", `#${row.userId}`),
    detail("Document type", row.documentType),
    detail("Document number", row.documentNumber),
    detailBadge("Status", row.status),
    detail("Front image URL", row.frontImageUrl, true),
    detail("Back image URL", row.backImageUrl, true),
    detail("Selfie image URL", row.selfieImageUrl, true),
    detail("Rejection reason", row.rejectionReason, true),
    ...timestampDetails(row),
  ],
};

export default kycConfig;
