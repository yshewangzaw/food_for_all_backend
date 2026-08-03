/**
 * Turns lookup lists (fetched by CrudPage from `config.lookups`) into
 * <Select /> options. Ids are shown because the backend records reference
 * each other by id.
 */

const labelled = (list, labelKey) =>
  (list || []).map((row) => ({
    value: row.id,
    label: `#${row.id} · ${row[labelKey] ?? "untitled"}`,
  }));

export const userOptions = (lookups) => labelled(lookups?.users, "fullName");
export const productOptions = (lookups) => labelled(lookups?.products, "name");
export const packageOptions = (lookups) => labelled(lookups?.packages, "name");
export const orderOptions = (lookups) =>
  (lookups?.orders || []).map((row) => ({
    value: row.id,
    label: `#${row.id} · ${row.orderNumber ?? "no number"}`,
  }));
export const paymentMethodOptions = (lookups) => labelled(lookups?.paymentMethods, "name");
export const commissionRuleOptions = (lookups) => labelled(lookups?.commissionRules, "name");
export const levelConfigurationOptions = (lookups) =>
  labelled(lookups?.levelConfigurations, "name");

export default {
  userOptions,
  productOptions,
  packageOptions,
  orderOptions,
  paymentMethodOptions,
  commissionRuleOptions,
  levelConfigurationOptions,
};
