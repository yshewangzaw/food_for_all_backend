/**
 * The only button in the app. Never style a raw <button> inline.
 *
 * <Button variant="primary" size="md" isLoading onClick={...}>Save</Button>
 */
const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  block = false,
  icon = null,
  onClick,
  className = "",
  ...rest
}) => {
  // className is merged, never replaced — a caller passing a spacing utility
  // must not wipe out the variant styling.
  const classes = [
    "btn",
    `btn--${variant}`,
    size !== "md" ? `btn--${size}` : "",
    block ? "btn--block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...rest}
    >
      {isLoading ? <span className="btn__spinner" aria-hidden="true" /> : icon}
      {children}
    </button>
  );
};

export default Button;
