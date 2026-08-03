import { forwardRef } from "react";

/** Multi-line input. Same props as <Input />. */
const Textarea = forwardRef(
  ({ label, name, error, hint, required = false, rows = 4, wide = true, ...rest }, ref) => (
    <div className={`field${wide ? " field--wide" : ""}`}>
      {label && (
        <label className="field__label" htmlFor={name}>
          {label}
          {required && <span className="field__required">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        rows={rows}
        ref={ref}
        className={`field__control${error ? " field__control--error" : ""}`}
        aria-invalid={Boolean(error)}
        {...rest}
      />
      {hint && !error && <span className="field__hint">{hint}</span>}
      {error && (
        <span className="field__error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
);

Textarea.displayName = "Textarea";

export default Textarea;
