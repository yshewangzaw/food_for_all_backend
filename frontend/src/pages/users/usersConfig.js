import * as yup from "yup";
import userService from "../../services/userService";
import { USER_ROLES, USER_STATUSES, KYC_STATUSES } from "../../constants/appConstants";
import { enumToOptions } from "../../utils/helpers";
import {
  requiredText,
  optionalText,
  emailRule,
  phoneRule,
  optionalId,
  optionalNumber,
  optionalUrl,
} from "../../utils/validators";
import {
  idColumn,
  stackedColumn,
  monoColumn,
  badgeColumn,
  refColumn,
  numberColumn,
  moneyColumn,
  dateColumn,
  detail,
  detailBadge,
  detailMoney,
  detailDate,
  timestampDetails,
} from "../crud/columnHelpers";

/**
 * /api/users — backend routes/userRoutes.js
 *
 * NOTE: POST/PUT /api/users hand req.body straight to Sequelize's User model,
 * so the create form asks for `passwordHash`, not `password`. Only
 * POST /api/auth/register hashes a plain password.
 * TODO(backend): hash the password inside userService.createUser so this form
 * can ask for `password` like every other sign-up flow.
 */
export const usersConfig = {
  key: "users",
  title: "Members",
  singular: "Member",
  description: "Everyone in the network: admins, active members and pending sign-ups.",
  service: userService,

  notice:
    "Creating a member here writes straight to the users table, so the password must be supplied already hashed. Use the public registration form for normal sign-ups.",

  searchFields: ["fullName", "email", "phone", "referralCode", "city", "status", "role"],
  initialSortKey: "createdAt",
  initialSortDir: "desc",

  columns: [
    idColumn(),
    stackedColumn("fullName", "email", "Member"),
    monoColumn("phone", "Phone"),
    badgeColumn("role", "Role"),
    badgeColumn("status", "Status"),
    refColumn("sponsorId", "Sponsor"),
    numberColumn("directReferralCount", "Directs"),
    moneyColumn("wallet", "Wallet"),
    badgeColumn("kycStatus", "KYC"),
    dateColumn("createdAt", "Joined"),
  ],

  fields: [
    { name: "fullName", label: "Full name", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone", label: "Phone", type: "tel", required: true },
    {
      name: "passwordHash",
      label: "Password hash",
      type: "text",
      hint: "Required when creating. Leave blank when editing to keep the current one.",
    },
    {
      name: "referralCode",
      label: "Referral code",
      type: "text",
      hint: "Must be unique. Required when creating.",
    },
    { name: "role", label: "Role", type: "select", options: enumToOptions(USER_ROLES) },
    { name: "status", label: "Status", type: "select", options: enumToOptions(USER_STATUSES) },
    {
      name: "kycStatus",
      label: "KYC status",
      type: "select",
      options: enumToOptions(KYC_STATUSES),
    },
    { name: "sponsorId", label: "Sponsor user id", type: "number" },
    { name: "depth", label: "Depth in tree", type: "number", min: 0 },
    { name: "wallet", label: "Wallet balance", type: "number", step: "0.01", min: 0 },
    { name: "city", label: "City", type: "text" },
    { name: "avatarUrl", label: "Avatar URL", type: "text", wide: true },
    { name: "address", label: "Address", type: "textarea", wide: true },
  ],

  schema: yup.object({
    fullName: requiredText("Full name"),
    email: emailRule,
    phone: phoneRule,
    passwordHash: optionalText("Password hash", 255),
    referralCode: optionalText("Referral code", 60),
    role: optionalText("Role", 20),
    status: optionalText("Status", 20),
    kycStatus: optionalText("KYC status", 20),
    sponsorId: optionalId("Sponsor user id"),
    depth: optionalNumber("Depth", 0),
    wallet: optionalNumber("Wallet balance", 0),
    city: optionalText("City", 80),
    avatarUrl: optionalUrl("Avatar URL"),
    address: optionalText("Address", 500),
  }),

  detailItems: (row) => [
    detail("Full name", row.fullName),
    detail("Email", row.email),
    detail("Phone", row.phone),
    detail("Referral code", row.referralCode),
    detailBadge("Role", row.role),
    detailBadge("Status", row.status),
    detailBadge("KYC status", row.kycStatus),
    detail("Sponsor id", row.sponsorId ? `#${row.sponsorId}` : "No sponsor"),
    detail("Depth", row.depth),
    detail("Direct referrals", row.directReferralCount),
    detailMoney("Wallet balance", row.wallet),
    detail("City", row.city),
    detailDate("Activated", row.activatedAt),
    detailDate("Phone verified", row.phoneVerifiedAt),
    detail("Address", row.address, true),
    ...timestampDetails(row),
  ],
};

export default usersConfig;
