"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useRef } from "react";
import { useAppForm } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSuspenseCategoriesQuery } from "@/features/b2c/category-management/hooks/use-categories-query";
import { getSlug } from "@/lib/get-slug";
import { useTRPC } from "@/trpc/client";
import type { ChannelConfigFormSchema, PriceFormSchema } from "../schema";
import { productFormSchema } from "../schema";
import { dbProductToForm } from "../utils/transform";
import { PricingTable } from "./pricing-table";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "archived", label: "Archived" },
];

export function ProductForm() {
  const params = useParams();
  const id = params.id as string;
  const trpc = useTRPC();
  const { data: product } = useSuspenseQuery(
    trpc.admin.products.byId.queryOptions({ id })
  );
  const { data: categories } = useSuspenseCategoriesQuery();
  const slugManuallyEditedRef = useRef(false);

  const formData = product ? dbProductToForm(product) : null;

  const form = useAppForm({
    defaultValues: formData ?? {
      name: "",
      slug: "",
      sku: "",
      description: "",
      stock: 0,
      categories: [],
      channels: [],
      prices: [],
      status: "draft",
      isActive: false,
      sortOrder: 0,
    },
    validators: {
      onSubmit: productFormSchema,
    },
    onSubmit: (values) => {
      // biome-ignore lint/suspicious/noConsole: TODO - implement mutation
      console.log("Form values:", values.value);
    },
  });

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <form
      id="product-form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <Tabs className="flex flex-col gap-4" defaultValue="basic">
        <TabsList>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        {/* Tab 1: Basic Info */}
        <TabsContent value="basic">
          <FieldSet>
            <FieldLegend>Basic Information</FieldLegend>
            <FieldGroup className="gap-4">
              <div className="flex flex-col gap-1">
                <form.AppField name="name">
                  {(field) => {
                    const handleNameSubmit = (value: string) => {
                      field.handleChange(value);
                      // Auto-generate slug if not manually edited
                      if (!slugManuallyEditedRef.current) {
                        const generatedSlug = getSlug(value);
                        form.setFieldValue("slug", generatedSlug);
                      }
                    };

                    return (
                      <field.EditableField
                        className="font-medium text-xl md:text-2xl"
                        onSubmit={handleNameSubmit}
                        placeholder="Product name"
                      />
                    );
                  }}
                </form.AppField>
                <form.AppField name="slug">
                  {(field) => {
                    const handleSlugSubmit = (value: string) => {
                      slugManuallyEditedRef.current = true;
                      field.handleChange(value);
                    };

                    return (
                      <field.EditableField
                        onSubmit={handleSlugSubmit}
                        placeholder="product-slug"
                      />
                    );
                  }}
                </form.AppField>
              </div>

              <form.AppField name="sku">
                {(field) => (
                  <field.TextField label="SKU" placeholder="Enter SKU" />
                )}
              </form.AppField>

              <form.AppField name="description">
                {(field) => (
                  <field.TextareaField
                    label="Description"
                    placeholder="Enter product description"
                    rows={6}
                  />
                )}
              </form.AppField>

              <div className="grid grid-cols-2 gap-4">
                <form.AppField name="stock">
                  {(field) => (
                    <field.QuantitySetterField label="Stock" min={0} />
                  )}
                </form.AppField>

                <form.AppField name="sortOrder">
                  {(field) => (
                    <field.QuantitySetterField label="Sort Order" min={0} />
                  )}
                </form.AppField>
              </div>

              <div className="flex gap-4">
                <form.AppField name="status">
                  {(field) => (
                    <field.SelectField
                      label="Status"
                      options={STATUS_OPTIONS}
                      placeholder="Select status"
                    />
                  )}
                </form.AppField>

                <form.AppField name="isActive">
                  {(field) => (
                    <field.CheckboxField
                      description="Product is visible to customers"
                      label="Active"
                    />
                  )}
                </form.AppField>
              </div>
            </FieldGroup>
          </FieldSet>
        </TabsContent>

        {/* Tab 2: Organization */}
        <TabsContent value="organization">
          <FieldSet>
            <FieldLegend>Categories</FieldLegend>
            <FieldGroup className="gap-4">
              <form.AppField name="categories">
                {(field) => (
                  <field.CategoryTagsField
                    categories={categories.map((cat) => ({
                      id: cat.id,
                      name: cat.name,
                    }))}
                    label="Select Categories"
                    placeholder="Select categories..."
                  />
                )}
              </form.AppField>
            </FieldGroup>
          </FieldSet>

          <FieldSet className="mt-6">
            <FieldLegend>Sales Channels</FieldLegend>
            <FieldGroup>
              <form.AppField name="channels">
                {(field) => {
                  const channels: ChannelConfigFormSchema[] =
                    field.state.value ?? [];

                  const isChannelEnabled = (channel: "B2C" | "B2B") =>
                    channels.some((ch) => ch.channel === channel);

                  const isChannelListed = (channel: "B2C" | "B2B") =>
                    channels.find((ch) => ch.channel === channel)?.isListed ??
                    false;

                  const toggleChannel = (channel: "B2C" | "B2B") => {
                    const current = channels;
                    const existing = current.find(
                      (ch) => ch.channel === channel
                    );
                    if (existing) {
                      // Remove channel
                      field.handleChange(
                        current.filter((ch) => ch.channel !== channel)
                      );
                    } else {
                      // Add channel
                      field.handleChange([
                        ...current,
                        { channel, isListed: true },
                      ]);
                    }
                  };

                  const toggleChannelListed = (channel: "B2C" | "B2B") => {
                    const current = channels;
                    const updated = current.map((ch) =>
                      ch.channel === channel
                        ? { ...ch, isListed: !ch.isListed }
                        : ch
                    );
                    field.handleChange(updated);
                  };

                  return (
                    <div className="space-y-3 rounded-md border p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isChannelEnabled("B2C")}
                            id="channel-b2c"
                            onCheckedChange={() => toggleChannel("B2C")}
                          />
                          <div className="flex flex-col">
                            <label
                              className="font-medium text-sm"
                              htmlFor="channel-b2c"
                            >
                              B2C (Website)
                            </label>
                            <p className="text-muted-foreground text-xs">
                              Base price for individual buyers
                            </p>
                          </div>
                        </div>
                        {isChannelEnabled("B2C") && (
                          <Button
                            onClick={() => toggleChannelListed("B2C")}
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            {isChannelListed("B2C") ? "Listed" : "Hidden"}
                          </Button>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isChannelEnabled("B2B")}
                            id="channel-b2b"
                            onCheckedChange={() => toggleChannel("B2B")}
                          />
                          <div className="flex flex-col">
                            <label
                              className="font-medium text-sm"
                              htmlFor="channel-b2b"
                            >
                              B2B (Business Portal)
                            </label>
                            <p className="text-muted-foreground text-xs">
                              Wholesale pricing for businesses
                            </p>
                          </div>
                        </div>
                        {isChannelEnabled("B2B") && (
                          <Button
                            onClick={() => toggleChannelListed("B2B")}
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            {isChannelListed("B2B") ? "Listed" : "Hidden"}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                }}
              </form.AppField>
            </FieldGroup>
          </FieldSet>
        </TabsContent>

        {/* Tab 3: Pricing */}
        <TabsContent value="pricing">
          <FieldSet>
            <FieldLegend>Price Rules</FieldLegend>
            <FieldGroup>
              <form.AppField name="prices">
                {(field) => {
                  const prices: PriceFormSchema[] = field.state.value ?? [];

                  return (
                    <PricingTable
                      onAddPrice={(price) => {
                        field.pushValue(price);
                      }}
                      onDeletePrice={(index) => {
                        field.removeValue(index);
                      }}
                      onEditPrice={(index, price) => {
                        field.replaceValue(index, price);
                      }}
                      prices={prices}
                    />
                  );
                }}
              </form.AppField>
            </FieldGroup>
          </FieldSet>
        </TabsContent>
      </Tabs>

      {/* Form Actions */}
      <form.AppForm>
        <div className="mt-6 flex gap-2">
          <form.SubmitButton size="sm">Save Changes</form.SubmitButton>
          <Button size="sm" type="button" variant="outline">
            Cancel
          </Button>
        </div>
      </form.AppForm>
    </form>
  );
}
