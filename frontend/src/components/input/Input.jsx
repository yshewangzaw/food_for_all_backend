import { forwardRef } from "react";

/**
 * Text-style input with label, error and hint.
 * forwardRef is required so React Hook Form's register() can attach.
 */
const Input = forwardRef(
  (
    { label, name, type = "text", error, hint, required = false, wide = false, ...rest },
    ref
  ) => (
    <div className={`field${wide ? " field--wide" : ""}`}>
      {label && (
        <label className="field__label" htmlFor={name}>
          {label}
          {required && <span className="field__required">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        ref={ref}
        className={`field__control${error ? " field__control--error" : ""}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        {...rest}
      />
      {hint && !error && <span className="field__hint">{hint}</span>}
      {error && (
        <span className="field__error" id={`${name}-error`} role="alert">
          {error}
        </span>
      )}
    </div>
  )
);

Input.displayName = "Input";

export default Input;
