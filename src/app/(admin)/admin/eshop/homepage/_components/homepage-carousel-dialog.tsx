"use client";

import { ArrowDownIcon, ArrowUpIcon, Trash2Icon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ComboboxInput } from "@/components/shared/combobox-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { HomepageCarouselSourceType } from "@/db/schema";
import {
  HOMEPAGE_DEFAULT_CTA_HREF,
  HOMEPAGE_DEFAULT_CTA_LABEL,
  HOMEPAGE_DEFAULT_ITEM_LIMIT,
  HOMEPAGE_MAX_ITEM_LIMIT,
  HOMEPAGE_SOURCE_TYPE_LABELS,
} from "@/features/homepage/constants";
import type {
  CreateCarouselSectionSchema,
  UpdateCarouselSectionSchema,
} from "@/features/homepage/schema";
import {
  createCarouselSectionSchema,
  updateCarouselSectionSchema,
} from "@/features/homepage/schema";

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductOption {
  id: string;
  isActive: boolean;
  name: string;
  showInB2c: boolean;
  status: string;
}

interface CarouselFormValues {
  categoryId: string | null;
  ctaHref: string;
  ctaLabel: string;
  itemLimit: number;
  productIds: string[];
  sourceType: HomepageCarouselSourceType;
  title: string;
}

interface Props {
  categories: CategoryOption[];
  initialValues?: CarouselFormValues;
  mode: "create" | "edit";
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    payload: CreateCarouselSectionSchema | UpdateCarouselSectionSchema
  ) => void;
  open: boolean;
  products: ProductOption[];
  sectionId?: string;
}

const DEFAULT_VALUES: CarouselFormValues = {
  title: "Produkty",
  sourceType: "best_sellers",
  categoryId: null,
  productIds: [],
  ctaLabel: HOMEPAGE_DEFAULT_CTA_LABEL,
  ctaHref: HOMEPAGE_DEFAULT_CTA_HREF,
  itemLimit: HOMEPAGE_DEFAULT_ITEM_LIMIT,
};

export function HomepageCarouselDialog({
  open,
  onOpenChange,
  mode,
  sectionId,
  initialValues,
  categories,
  products,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<CarouselFormValues>(
    initialValues ?? DEFAULT_VALUES
  );
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (open) {
      setForm(initialValues ?? DEFAULT_VALUES);
      setSelectedProductId(null);
    }
  }, [open, initialValues]);

  const productOptions = useMemo(() => {
    const selected = new Set(form.productIds);
    return products
      .filter(
        (product) =>
          product.isActive &&
          product.showInB2c &&
          product.status !== "draft" &&
          product.status !== "archived" &&
          !selected.has(product.id)
      )
      .map((product) => ({ value: product.id, label: product.name }));
  }, [form.productIds, products]);

  const selectedProducts = useMemo(
    () =>
      form.productIds
        .map((productId) =>
          products.find((product) => product.id === productId)
        )
        .filter((product): product is ProductOption => product !== undefined),
    [form.productIds, products]
  );

  const moveProduct = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= form.productIds.length) {
      return;
    }
    const nextIds = form.productIds.slice();
    const [moved] = nextIds.splice(index, 1);
    nextIds.splice(target, 0, moved);
    setForm((prev) => ({ ...prev, productIds: nextIds }));
  };

  const handleSubmit = () => {
    const base = {
      title: form.title.trim(),
      ctaLabel: form.ctaLabel.trim(),
      ctaHref: form.ctaHref.trim(),
      itemLimit: form.itemLimit,
    };

    let body: CreateCarouselSectionSchema | null = null;
    if (form.sourceType === "category") {
      if (!form.categoryId) {
        return;
      }
      body = { ...base, sourceType: "category", categoryId: form.categoryId };
    } else if (form.sourceType === "manual_products") {
      if (form.productIds.length === 0) {
        return;
      }
      body = {
        ...base,
        sourceType: "manual_products",
        productIds: form.productIds,
      };
    } else {
      body = { ...base, sourceType: "best_sellers" };
    }

    const parsed =
      mode === "edit" && sectionId
        ? updateCarouselSectionSchema.safeParse({ sectionId, ...body })
        : createCarouselSectionSchema.safeParse(body);

    if (!parsed.success) {
      return;
    }

    onSubmit(parsed.data);
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Upraviť carousel" : "Nový carousel"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="carousel-title">Nadpis</Label>
            <Input
              id="carousel-title"
              onChange={(event) =>
                setForm((prev) => ({ ...prev, title: event.target.value }))
              }
              value={form.title}
            />
          </div>

          <div className="space-y-2">
            <Label>Zdroj produktov</Label>
            <Select
              onValueChange={(value: HomepageCarouselSourceType) =>
                setForm((prev) => ({
                  ...prev,
                  sourceType: value,
                  categoryId: value === "category" ? prev.categoryId : null,
                  productIds:
                    value === "manual_products" ? prev.productIds : [],
                }))
              }
              value={form.sourceType}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(HOMEPAGE_SOURCE_TYPE_LABELS).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {form.sourceType === "category" ? (
            <div className="space-y-2">
              <Label>Kategória</Label>
              <ComboboxInput
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, categoryId: value }))
                }
                options={categories.map((category) => ({
                  value: category.id,
                  label: category.name,
                }))}
                value={form.categoryId}
              />
            </div>
          ) : null}

          {form.sourceType === "manual_products" ? (
            <div className="space-y-3">
              <div className="grid items-end gap-2 sm:grid-cols-[1fr_auto]">
                <div className="space-y-2">
                  <Label>Pridať produkt</Label>
                  <ComboboxInput
                    onChange={setSelectedProductId}
                    options={productOptions}
                    value={selectedProductId}
                  />
                </div>
                <Button
                  disabled={!selectedProductId}
                  onClick={() => {
                    if (!selectedProductId) {
                      return;
                    }
                    setForm((prev) => ({
                      ...prev,
                      productIds: [...prev.productIds, selectedProductId],
                    }));
                    setSelectedProductId(null);
                  }}
                  type="button"
                >
                  Pridať
                </Button>
              </div>

              {selectedProducts.length > 0 ? (
                <ul className="divide-y rounded-md border">
                  {selectedProducts.map((product, index) => (
                    <li
                      className="flex items-center gap-2 px-3 py-2"
                      key={product.id}
                    >
                      <div className="flex flex-col">
                        <button
                          aria-label="Posunúť hore"
                          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                          disabled={index === 0}
                          onClick={() => moveProduct(index, -1)}
                          type="button"
                        >
                          <ArrowUpIcon className="size-3" />
                        </button>
                        <button
                          aria-label="Posunúť dolu"
                          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                          disabled={index === selectedProducts.length - 1}
                          onClick={() => moveProduct(index, 1)}
                          type="button"
                        >
                          <ArrowDownIcon className="size-3" />
                        </button>
                      </div>
                      <span className="flex-1 text-sm">{product.name}</span>
                      <Button
                        aria-label={`Odstrániť ${product.name}`}
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            productIds: prev.productIds.filter(
                              (id) => id !== product.id
                            ),
                          }))
                        }
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-md border border-dashed px-4 py-6 text-center text-muted-foreground text-sm">
                  Pridajte aspoň jeden produkt.
                </p>
              )}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="carousel-cta-label">Text odkazu</Label>
              <Input
                id="carousel-cta-label"
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    ctaLabel: event.target.value,
                  }))
                }
                value={form.ctaLabel}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carousel-cta-href">Cieľ odkazu</Label>
              <Input
                id="carousel-cta-href"
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    ctaHref: event.target.value,
                  }))
                }
                placeholder="/e-shop"
                value={form.ctaHref}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="carousel-item-limit">Počet produktov</Label>
            <Input
              id="carousel-item-limit"
              max={HOMEPAGE_MAX_ITEM_LIMIT}
              min={1}
              onChange={(event) => {
                const value = Number.parseInt(event.target.value, 10);
                if (Number.isFinite(value)) {
                  setForm((prev) => ({ ...prev, itemLimit: value }));
                }
              }}
              type="number"
              value={form.itemLimit}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            Zrušiť
          </Button>
          <Button onClick={handleSubmit} type="button">
            {mode === "edit" ? "Uložiť" : "Vytvoriť"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
