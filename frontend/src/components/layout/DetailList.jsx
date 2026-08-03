/**
 * Read-only key/value grid used by the "view" modal of every CRUD page.
 *
 * items: [{ label, value, wide? }]
 */
const DetailList = ({ items = [] }) => (
  <div className="detail-list">
    {items.map((item, index) => (
      <div
        key={`${item.label}-${index}`}
        className={`detail${item.wide ? " detail--wide" : ""}`}
      >
        <span className="detail__label">{item.label}</span>
        <span className="detail__value">
          {item.value === null || item.value === undefined || item.value === ""
            ? "—"
            : item.value}
        </span>
      </div>
    ))}
  </div>
);

export default DetailList;
