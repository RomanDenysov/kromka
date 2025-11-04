import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { EditableField } from "./editable-field";
import { SubmitButton } from "./submit-button";
import { TextField } from "./text-field";

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    EditableField,
  },
  formComponents: {
    SubmitButton,
  },
});
