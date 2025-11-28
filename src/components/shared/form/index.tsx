import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { CategorySelectField } from "./fields/category-select-field";
import { CheckboxField } from "./fields/checkbox-field";
import { DateRangeField } from "./fields/date-range-field";
import { DaysToggleField } from "./fields/days-toggle-field";
import { EditableField } from "./fields/editable-field";
import { PriceInputField } from "./fields/price-input-field";
import { QuantitySetterField } from "./fields/quantity-setter-field";
import { RichTextField } from "./fields/rich-text-field";
import { SelectField } from "./fields/select-field";
import { SubmitButton } from "./fields/submit-button";
import { SwitchField } from "./fields/switch-field";
import { TextField } from "./fields/text-field";
import { TextareaField } from "./fields/textarea-field";
import { TimeField } from "./fields/time-field";
import { ToggleField } from "./fields/toggle-field";

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    EditableField,
    TextareaField,
    CheckboxField,
    SelectField,
    CategorySelectField,
    QuantitySetterField,
    RichTextField,
    ToggleField,
    SwitchField,
    TimeField,
    DateRangeField,
    DaysToggleField,
    PriceInputField,
  },
  formComponents: {
    SubmitButton,
  },
});
