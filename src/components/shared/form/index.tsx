import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { CategorySelectField } from "./fields/category-select-field";
import { CategoryTagsField } from "./fields/category-tags-field";
import { CheckboxField } from "./fields/checkbox-field";
import { EditableField } from "./fields/editable-field";
import { QuantitySetterField } from "./fields/quantity-setter-field";
import { RichTextField } from "./fields/rich-text-field";
import { SelectField } from "./fields/select-field";
import { SubmitButton } from "./fields/submit-button";
import { TextField } from "./fields/text-field";
import { TextareaField } from "./fields/textarea-field";
import { ToggleField } from "./fields/toggle-field";

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    EditableField,
    TextareaField,
    CheckboxField,
    SelectField,
    CategorySelectField,
    CategoryTagsField,
    QuantitySetterField,
    RichTextField,
    ToggleField,
  },
  formComponents: {
    SubmitButton,
  },
});
