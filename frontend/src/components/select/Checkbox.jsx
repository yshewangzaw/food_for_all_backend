import { forwardRef } from "react";

/** Single on/off switch for the backend's BOOLEAN columns. */
const Checkbox = forwardRef(({ label, name, error, hint, wide = false, ...rest }, ref) => (
  <div className={`field${wide ? " field--wide" : ""}`}>
    <div className="field field--checkbox" style={{ marginBottom: 0 }}>
      <input id={name} name={name} type="checkbox" ref={ref} {...rest} />
      <label className="field__label" htmlFor={name} style={{ marginBottom: 0 }}>
        {label}
      </label>
    </div>
    {hint && !error && <span className="field__hint">{hint}</span>}
    {error && (
      <span className="field__error" role="alert">
        {error}
      </span>
    )}
  </div>
));

Checkbox.displayName = "Checkbox";

export default Checkbox;
