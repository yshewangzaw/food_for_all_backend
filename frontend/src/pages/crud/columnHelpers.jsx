import StatusBadge from "../../components/statusBadge/StatusBadge";
import {
  formatDate,
  formatDateTime,
  formatMoney,
  formatNumber,
  humanize,
} from "../../utils/helpers";

/**
 * Small builders so the resource configs stay short and every module renders
 * ids, money, dates and statuses the same way.
 */

export const idColumn = (label = "ID") => ({
  key: "id",
  label,
  width: 70,
  render: (value) => <span className="u-mono">#{value}</span>,
});

export const textColumn = (key, label, options = {}) => ({
  key,
  label,
  ...options,
  render:
    options.render ||
    ((value) =>
      value === null || value === undefined || value === "" ? (
        <span className="u-faint">—</span>
      ) : (
        <span className={options.truncate ? "u-truncate" : undefined}>{String(value)}</span>
      )),
});

export const strongColumn = (key, label, options = {}) => ({
  key,
  label,
  ...options,
  render: (value) => <span className="u-bold">{value || "—"}</span>,
});

export const monoColumn = (key, label, options = {}) => ({
  key,
  label,
  ...options,
  render: (value) => <span className="u-mono">{value || "—"}</span>,
});

/** Two lines in one cell, e.g. name over email. */
export const stackedColumn = (primaryKey, secondaryKey, label, options = {}) => ({
  key: primaryKey,
  label,
  ...options,
  render: (value, row) => (
    <div>
      <div className="u-bold">{value || "—"}</div>
      <div className="u-small u-faint u-truncate">{row?.[secondaryKey] || ""}</div>
    </div>
  ),
});

export const refColumn = (key, label) => ({
  key,
  label,
  width: 100,
  render: (value) =>
    value === null || value === undefined ? (
      <span className="u-faint">—</span>
    ) : (
      <span className="u-mono">#{value}</span>
    ),
});

export const moneyColumn = (key, label) => ({
  key,
  label,
  align: "right",
  render: (value) => <span className="u-mono">{formatMoney(value)}</span>,
});

export const numberColumn = (key, label) => ({
  key,
  label,
  align: "right",
  render: (value) => <span className="u-mono">{formatNumber(value)}</span>,
});

export const badgeColumn = (key, label, tone) => ({
  key,
  label,
  render: (value) => <StatusBadge value={value} tone={tone} />,
});

export const enumColumn = (key, label) => ({
  key,
  label,
  render: (value) => (value ? humanize(value) : <span className="u-faint">—</span>),
});

export const boolColumn = (key, label) => ({
  key,
  label,
  render: (value) => (
    <StatusBadge
      value={value ? "yes" : "no"}
      tone={value ? "success" : "neutral"}
      label={value ? "Yes" : "No"}
    />
  ),
});

export const dateColumn = (key, label = "Created") => ({
  key,
  label,
  render: (value) => <span className="u-small">{formatDate(value)}</span>,
});

export const dateTimeColumn = (key, label) => ({
  key,
  label,
  render: (value) => <span className="u-small">{formatDateTime(value)}</span>,
});

/* ---------- detail (view modal) builders ---------- */

export const detail = (label, value, wide = false) => ({ label, value, wide });

export const detailBadge = (label, value) => ({
  label,
  value: <StatusBadge value={value} />,
});

export const detailMoney = (label, value) => ({
  label,
  value: <span className="u-mono">{formatMoney(value)}</span>,
});

export const detailDate = (label, value) => ({ label, value: formatDateTime(value) });

export const detailBool = (label, value) => ({ label, value: value ? "Yes" : "No" });

/** Every record has these two, so every view modal ends with them. */
export const timestampDetails = (row) => [
  detailDate("Created", row.createdAt),
  detailDate("Last updated", row.updatedAt),
];
