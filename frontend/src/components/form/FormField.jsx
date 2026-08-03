import Input from "../input/Input";
import Textarea from "../input/Textarea";
import Select from "../select/Select";
import Checkbox from "../select/Checkbox";

/**
 * Turns one entry of a resource's `formFields` array into a real control and
 * wires it to React Hook Form.
 *
 * Field config:
 *   {
 *     name, label, type, required?, wide?, hint?, placeholder?,
 *     options?,          // for type "select"
 *     step?, min?, max?, // for type "number"
 *     disabled?
 *   }
 *
 * Supported types: text, email, tel, password, number, textarea,
 *                  select, checkbox, date, datetime
 */
const FormField = ({ field, register, errors, isReadOnly = false }) => {
  const error = errors?.[field.name]?.message;

  const shared = {
    label: field.label,
    name: field.name,
    error,
    hint: field.hint,
    required: field.required,
    wide: field.wide,
    disabled: isReadOnly || field.disabled,
  };

  if (field.type === "checkbox") {
    return <Checkbox {...shared} {...register(field.name)} />;
  }

  if (field.type === "textarea") {
    return (
      <Textarea
        {...shared}
        rows={field.rows || 4}
        placeholder={field.placeholder}
        {...register(field.name)}
      />
    );
  }

  if (field.type === "select") {
    return (
      <Select
        {...shared}
        options={field.options || []}
        placeholder={field.placeholder || "Select an option"}
        {...register(field.name)}
      />
    );
  }

  if (field.type === "number") {
    return (
      <Input
        {...shared}
        type="number"
        step={field.step || "any"}
        min={field.min}
        max={field.max}
        placeholder={field.placeholder}
        // valueAsNumber keeps Yup's number rules from seeing a string.
        {...register(field.name, { setValueAs: (value) => (value === "" ? "" : Number(value)) })}
      />
    );
  }

  if (field.type === "date" || field.type === "datetime") {
    return (
      <Input
        {...shared}
        type={field.type === "date" ? "date" : "datetime-local"}
        {...register(field.name)}
      />
    );
  }

  // text, email, tel, password and anything else falls through to a text input.
  return (
    <Input
      {...shared}
      type={field.type || "text"}
      placeholder={field.placeholder}
      maxLength={field.maxLength}
      autoComplete={field.autoComplete}
      {...register(field.name)}
    />
  );
};

export default FormField;
