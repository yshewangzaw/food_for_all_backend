import { STATUS_TONES } from "../constants/appConstants";

/** "PENDING_PAYMENT" -> "Pending payment" */
export const humanize = (value) => {
  if (value === null || value === undefined || value === "") return "";
  return String(value)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^./, (char) => char.toUpperCase());
};

/** "1234.5" -> "1,234.50". Amounts arrive from Sequelize DECIMAL as strings. */
export const formatMoney = (value, currency = "") => {
  const number = Number(value);
  if (Number.isNaN(number)) return "—";
  const formatted = number.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency ? `${currency} ${formatted}` : formatted;
};

export const formatNumber = (value) => {
  const number = Number(value);
  if (Number.isNaN(number)) return "0";
  return number.toLocaleString();
};

export const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return `${formatDate(value)}, ${date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

/** "3 hours ago" — used by the dashboard activity feed. */
export const timeAgo = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const steps = [
    [60, "second"],
    [3600, "minute"],
    [86400, "hour"],
    [2592000, "day"],
    [31536000, "month"],
  ];
  if (seconds < 60) return "just now";
  for (let index = 1; index < steps.length; index += 1) {
    if (seconds < steps[index][0]) {
      const amount = Math.floor(seconds / steps[index - 1][0]);
      return `${amount} ${steps[index][1]}${amount > 1 ? "s" : ""} ago`;
    }
  }
  const years = Math.floor(seconds / 31536000);
  return `${years} year${years > 1 ? "s" : ""} ago`;
};

/** Feeds StatusBadge. Unknown values fall back to a neutral grey pill. */
export const toneForStatus = (status) => STATUS_TONES[status] || "neutral";

/** "Amira Bekele" -> "AB" */
export const initialsOf = (name) => {
  if (!name) return "?";
  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
};

/** Reads "user.fullName" style paths safely. */
export const getValue = (row, path) => {
  if (!row || !path) return undefined;
  return path
    .split(".")
    .reduce((acc, key) => (acc === null || acc === undefined ? acc : acc[key]), row);
};

/** Sums a numeric column across a list, tolerating DECIMAL strings. */
export const sumBy = (list, key) =>
  (list || []).reduce((total, row) => total + (Number(getValue(row, key)) || 0), 0);

/** Groups a list into { STATUS: count }. */
export const countBy = (list, key) =>
  (list || []).reduce((acc, row) => {
    const value = getValue(row, key) ?? "UNKNOWN";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});

/** Newest first, by any date field. */
export const sortByDateDesc = (list, key = "createdAt") =>
  [...(list || [])].sort(
    (a, b) => new Date(getValue(b, key) || 0) - new Date(getValue(a, key) || 0)
  );

/** Case-insensitive "does any of these fields contain the term". */
export const matchesSearch = (row, term, fields) => {
  if (!term) return true;
  const needle = term.trim().toLowerCase();
  const haystack = fields && fields.length ? fields : Object.keys(row || {});
  return haystack.some((field) => {
    const value = getValue(row, field);
    if (value === null || value === undefined) return false;
    return String(value).toLowerCase().includes(needle);
  });
};

/** Drops "", null and undefined so we never send empty strings to the API. */
export const stripEmptyValues = (values) => {
  const cleaned = {};
  Object.entries(values || {}).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined) return;
    cleaned[key] = value;
  });
  return cleaned;
};

/** Turns a list of records into { value, label } options for a Select. */
export const toOptions = (list, valueKey = "id", labelKey = "name") =>
  (list || []).map((row) => ({
    value: getValue(row, valueKey),
    label: String(getValue(row, labelKey) ?? getValue(row, valueKey)),
  }));

/** ["ADMIN","MEMBER"] -> [{ value:"ADMIN", label:"Admin" }, ...] */
export const enumToOptions = (values) =>
  (values || []).map((value) => ({ value, label: humanize(value) }));


/** ISO timestamp -> "YYYY-MM-DD" for <input type="date">. */
export const toDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

/** ISO timestamp -> "YYYY-MM-DDTHH:mm" for <input type="datetime-local">. */
export const toDateTimeInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
};

/** Turns a row into safe form defaults: null becomes "" so inputs stay controlled. */
export const toFormDefaults = (row, fields) => {
  const defaults = {};
  (fields || []).forEach((field) => {
    const raw = getValue(row, field.name);
    if (field.type === "checkbox") {
      defaults[field.name] = Boolean(raw);
    } else if (field.type === "date") {
      defaults[field.name] = toDateInput(raw);
    } else if (field.type === "datetime") {
      defaults[field.name] = toDateTimeInput(raw);
    } else {
      defaults[field.name] = raw === null || raw === undefined ? "" : raw;
    }
  });
  return defaults;
};

export default {
  humanize,
  formatMoney,
  formatNumber,
  formatDate,
  formatDateTime,
  timeAgo,
  toneForStatus,
  initialsOf,
  getValue,
  sumBy,
  countBy,
  sortByDateDesc,
  matchesSearch,
  stripEmptyValues,
  toOptions,
  enumToOptions,
  toDateInput,
  toDateTimeInput,
  toFormDefaults,
};
