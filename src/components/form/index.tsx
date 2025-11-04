import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { CategorySelectField } from "./category-select-field";
import { CategoryTagsField } from "./category-tags-field";
import { CheckboxField } from "./checkbox-field";
import { EditableField } from "./editable-field";
import { NumberField } from "./number-field";
import { SelectField } from "./select-field";
import { SubmitButton } from "./submit-button";
import { TextField } from "./text-field";
import { TextareaField } from "./textarea-field";

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    EditableField,
    NumberField,
    TextareaField,
    CheckboxField,
    SelectField,
    CategorySelectField,
    CategoryTagsField,
  },
  formComponents: {
    SubmitButton,
  },
});
