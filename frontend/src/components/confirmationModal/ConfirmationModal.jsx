import Modal from "../modal/Modal";
import Button from "../button/Button";

/**
 * Asks before anything destructive: delete, deactivate, sign out.
 *
 * tone: danger (default) | warning | info
 */
const ConfirmationModal = ({
  isOpen,
  title = "Are you sure?",
  message = "This can't be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  tone = "danger",
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const marks = { danger: "!", warning: "!", info: "?" };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="sm"
      closeOnOverlayClick={!isLoading}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="u-flex u-gap-4">
        <div
          className={`confirm__mark${tone !== "danger" ? ` confirm__mark--${tone}` : ""}`}
          aria-hidden="true"
        >
          {marks[tone] || "!"}
        </div>
        <p className="u-muted">{message}</p>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
