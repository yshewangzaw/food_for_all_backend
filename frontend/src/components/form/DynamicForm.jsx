import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormField from "./FormField";
import Button from "../button/Button";
import { stripEmptyValues } from "../../utils/helpers";

/**
 * Builds a complete, validated form from a field config array.
 * Every create/edit modal in the CMS uses this — no page writes its own form.
 *
 * Props
 *  fields         array of field configs (see FormField for the shape)
 *  schema         a Yup object schema
 *  defaultValues  object, usually the row being edited
 *  onSubmit       async (values) => void
 *  onCancel       closes the modal
 *  isSubmitting   disables the buttons and spins the primary one
 *  submitLabel    "Create product", "Save changes", ...
 *  keepEmpty      send "" values through instead of dropping them
 */
const DynamicForm = ({
  fields = [],
  schema,
  defaultValues = {},
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  keepEmpty = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: schema ? yupResolver(schema) : undefined,
    defaultValues,
    mode: "onTouched",
  });

  // Reopening the modal on a different row must refill the inputs.
  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(defaultValues)]);

  const submit = async (values) => {
    const payload = keepEmpty ? values : stripEmptyValues(values);
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      <div className="form__grid">
        {fields.map((field) => (
          <FormField
            key={field.name}
            field={field}
            register={register}
            errors={errors}
          />
        ))}
      </div>

      <div className="form__actions">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            {cancelLabel}
          </Button>
        )}
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default DynamicForm;
