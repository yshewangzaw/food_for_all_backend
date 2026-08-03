import * as yup from "yup";

/**
 * Shared Yup rules. Resource configs import these so every form in the CMS
 * says the same thing when a value is wrong.
 */

export const requiredText = (label, min = 2, max = 120) =>
  yup
    .string()
    .trim()
    .required(`${label} is required`)
    .min(min, `${label} needs at least ${min} characters`)
    .max(max, `${label} can't be longer than ${max} characters`);

export const optionalText = (label, max = 500) =>
  yup
    .string()
    .trim()
    .max(max, `${label} can't be longer than ${max} characters`)
    .nullable()
    .transform((value) => (value === "" ? null : value));

export const emailRule = yup
  .string()
  .trim()
  .required("Email is required")
  .email("Enter a valid email address");

/** Accepts +251912345678, 0912345678, 912-345-678 and similar. */
export const phoneRule = yup
  .string()
  .trim()
  .required("Phone number is required")
  .matches(/^\+?[0-9\s-]{7,20}$/, "Enter a valid phone number");

export const passwordRule = yup
  .string()
  .required("Password is required")
  .min(6, "Password needs at least 6 characters")
  .max(64, "Password can't be longer than 64 characters");

export const confirmPasswordRule = (field = "password") =>
  yup
    .string()
    .required("Confirm your password")
    .oneOf([yup.ref(field)], "Passwords don't match");

export const requiredNumber = (label, min = 0) =>
  yup
    .number()
    .typeError(`${label} must be a number`)
    .required(`${label} is required`)
    .min(min, `${label} can't be less than ${min}`);

export const optionalNumber = (label, min = 0) =>
  yup
    .number()
    .typeError(`${label} must be a number`)
    .min(min, `${label} can't be less than ${min}`)
    .nullable()
    .transform((value, original) => (original === "" ? null : value));

export const requiredInteger = (label, min = 1) =>
  requiredNumber(label, min).integer(`${label} must be a whole number`);

export const requiredId = (label) =>
  yup
    .number()
    .typeError(`Select a ${label.toLowerCase()}`)
    .required(`${label} is required`)
    .integer(`${label} must be a whole number`)
    .positive(`${label} must be a positive id`);

export const optionalId = (label) =>
  yup
    .number()
    .typeError(`${label} must be a number`)
    .integer(`${label} must be a whole number`)
    .positive(`${label} must be a positive id`)
    .nullable()
    .transform((value, original) => (original === "" || original === null ? null : value));

export const requiredSelect = (label) =>
  yup.string().trim().required(`Select a ${label.toLowerCase()}`);

export const optionalSelect = () =>
  yup
    .string()
    .trim()
    .nullable()
    .transform((value) => (value === "" ? null : value));

export const requiredDate = (label) =>
  yup
    .date()
    .typeError(`${label} must be a valid date`)
    .required(`${label} is required`);

export const optionalDate = (label) =>
  yup
    .date()
    .typeError(`${label} must be a valid date`)
    .nullable()
    .transform((value, original) => (original === "" ? null : value));

export const optionalUrl = (label) =>
  yup
    .string()
    .trim()
    .max(500, `${label} is too long`)
    .nullable()
    .transform((value) => (value === "" ? null : value));

export const booleanRule = yup.boolean().default(false);

/* ---------- Ready-made schemas used by the auth pages ---------- */

export const loginSchema = yup.object({
  email: emailRule,
  password: yup.string().required("Password is required"),
});

export const registerSchema = yup.object({
  fullName: requiredText("Full name"),
  email: emailRule,
  phone: phoneRule,
  password: passwordRule,
  confirmPassword: confirmPasswordRule("password"),
  referralCode: optionalText("Referral code", 60),
});

export default {
  requiredText,
  optionalText,
  emailRule,
  phoneRule,
  passwordRule,
  confirmPasswordRule,
  requiredNumber,
  optionalNumber,
  requiredInteger,
  requiredId,
  optionalId,
  requiredSelect,
  optionalSelect,
  requiredDate,
  optionalDate,
  optionalUrl,
  booleanRule,
  loginSchema,
  registerSchema,
};
