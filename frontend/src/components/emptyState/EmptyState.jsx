import Button from "../button/Button";

/**
 * Shown when a list has no rows, or when a search matched nothing.
 * An empty screen should invite an action, so pass actionLabel/onAction.
 */
const EmptyState = ({
  title = "Nothing here yet",
  message = "Records you add will show up in this list.",
  icon = "◍",
  actionLabel,
  onAction,
}) => (
  <div className="empty">
    <div className="empty__mark" aria-hidden="true">
      {icon}
    </div>
    <p className="empty__title">{title}</p>
    <p className="empty__text">{message}</p>
    {actionLabel && onAction && (
      <Button variant="secondary" size="sm" onClick={onAction} className="u-mt-2">
        {actionLabel}
      </Button>
    )}
  </div>
);

export default EmptyState;
