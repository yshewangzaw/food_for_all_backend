import { humanize, toneForStatus } from "../../utils/helpers";

/**
 * Colour-coded pill for any backend enum (order status, KYC status, role...).
 * The colour comes from STATUS_TONES in constants/appConstants.js.
 */
const StatusBadge = ({ value, tone, label }) => {
  if (value === null || value === undefined || value === "") {
    return <span className="badge badge--neutral">—</span>;
  }

  const resolvedTone = tone || toneForStatus(value);

  return (
    <span className={`badge badge--${resolvedTone}`}>
      <span className="badge__dot" aria-hidden="true" />
      {label || humanize(value)}
    </span>
  );
};

export default StatusBadge;
