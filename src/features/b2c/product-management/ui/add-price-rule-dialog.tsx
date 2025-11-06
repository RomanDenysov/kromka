"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppForm } from "@/components/form";
import type { PriceFormSchema } from "../schema";
import { priceFormSchema } from "../schema";

const CENTS_PER_EURO = 100;

interface AddPriceRuleDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (price: PriceFormSchema) => void;
  editingPrice: PriceFormSchema | null;
}

export function AddPriceRuleDialog({
  open,
  onClose,
  onSubmit,
  editingPrice,
}: AddPriceRuleDialogProps) {
  const form = useAppForm({
    defaultValues: editingPrice ?? {
      channel: "B2C" as const,
      orgId: undefined,
      amountCents: 0,
      minQty: 1,
      priority: 0,
      startsAt: undefined,
      endsAt: undefined,
      isActive: true,
    },
    validators: {
      onSubmit: priceFormSchema,
    },
    onSubmit: ({ value }) => {
      onSubmit(value);
    },
  });

  // Reset form when dialog opens/closes or editingPrice changes
  useEffect(() => {
    if (open) {
      if (editingPrice) {
        form.reset();
        form.setFieldValue("channel", editingPrice.channel);
        form.setFieldValue("orgId", editingPrice.orgId);
        form.setFieldValue("amountCents", editingPrice.amountCents);
        form.setFieldValue("minQty", editingPrice.minQty);
        form.setFieldValue("priority", editingPrice.priority);
        form.setFieldValue("startsAt", editingPrice.startsAt);
        form.setFieldValue("endsAt", editingPrice.endsAt);
        form.setFieldValue("isActive", editingPrice.isActive);
      } else {
        form.reset();
      }
    }
  }, [open, editingPrice]);

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog onOpenChange={(isOpen) => !isOpen && handleClose()} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingPrice ? "Edit Price Rule" : "Add Price Rule"}
          </DialogTitle>
        </DialogHeader>

        <form
          id="price-rule-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="space-y-4">
            {/* Channel Selection */}
            <form.AppField name="channel">
              {(field) => (
                <field.SelectField
                  label="Channel"
                  options={[
                    { value: "B2C", label: "B2C (Website)" },
                    { value: "B2B", label: "B2B (Business Portal)" },
                  ]}
                  placeholder="Select channel"
                />
              )}
            </form.AppField>

            {/* Organization ID - Only for B2B */}
            <form.AppField name="orgId">
              {(field) => (
                <field.TextField
                  description="Leave empty for all customers, or specify organization ID for custom pricing"
                  label="Organization ID (Optional)"
                  placeholder="org-xxx"
                />
              )}
            </form.AppField>

            {/* Price Amount in Euros */}
            <form.AppField name="amountCents">
              {(field) => {
                const euroValue = field.state.value / CENTS_PER_EURO;

                return (
                  <div className="space-y-1">
                    <label className="text-sm font-medium" htmlFor="price-input">
                      Price (€)
                    </label>
                    <input
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      id="price-input"
                      min={0}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const value = Number.parseFloat(e.target.value) || 0;
                        // Convert euros to cents as integer
                        field.handleChange(Math.round(value * CENTS_PER_EURO));
                      }}
                      placeholder="0.00"
                      step={0.01}
                      type="number"
                      value={euroValue}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-destructive text-xs">
                        {field.state.meta.errors.join(", ")}
                      </p>
                    )}
                  </div>
                );
              }}
            </form.AppField>

            {/* Minimum Quantity */}
            <form.AppField name="minQty">
              {(field) => (
                <field.QuantitySetterField
                  label="Minimum Quantity"
                  min={1}
                />
              )}
            </form.AppField>

            {/* Priority */}
            <form.AppField name="priority">
              {(field) => (
                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="priority-input">
                    Priority
                  </label>
                  <input
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    id="priority-input"
                    min={0}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const value = Number.parseInt(e.target.value, 10) || 0;
                      field.handleChange(value);
                    }}
                    placeholder="0"
                    type="number"
                    value={field.state.value}
                  />
                  <p className="text-muted-foreground text-xs">
                    Higher priority prices override lower ones
                  </p>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-destructive text-xs">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  )}
                </div>
              )}
            </form.AppField>

            {/* Active Status */}
            <form.AppField name="isActive">
              {(field) => (
                <field.CheckboxField
                  description="Price rule is active and will be applied"
                  label="Active"
                />
              )}
            </form.AppField>
          </div>

          <DialogFooter className="mt-6">
            <Button onClick={handleClose} type="button" variant="outline">
              Cancel
            </Button>
            <form.AppForm>
              <form.SubmitButton size="sm">
                {editingPrice ? "Update Price" : "Add Price"}
              </form.SubmitButton>
            </form.AppForm>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

