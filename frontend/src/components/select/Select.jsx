import { forwardRef } from "react";

/**
 * Dropdown built from [{ value, label }] options.
 * Use helpers.enumToOptions() for backend enums and helpers.toOptions() for
 * records fetched from another endpoint.
 */
const Select = forwardRef(
  (
    {
      label,
      name,
      options = [],
      placeholder = "Select an option",
      error,
      hint,
      required = false,
      wide = false,
      ...rest
    },
    ref
  ) => (
    <div className={`field${wide ? " field--wide" : ""}`}>
      {label && (
        <label className="field__label" htmlFor={name}>
          {label}
          {required && <span className="field__required">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        ref={ref}
        className={`field__control${error ? " field__control--error" : ""}`}
        aria-invalid={Boolean(error)}
        {...rest}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={String(option.value)} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint && !error && <span className="field__hint">{hint}</span>}
      {error && (
        <span className="field__error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
);

Select.displayName = "Select";

export default Select;
