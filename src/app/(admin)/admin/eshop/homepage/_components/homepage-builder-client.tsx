"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import type { HomepageCarouselSourceType } from "@/db/schema";
import {
  createCarouselSectionAction,
  deleteCarouselSectionAction,
  duplicateCarouselSectionAction,
  reorderHomepageSectionsAction,
  toggleHomepageSectionAction,
  updateCarouselSectionAction,
} from "@/features/homepage/api/actions";
import type { AdminHomepageSection } from "@/features/homepage/api/queries";
import {
  HOMEPAGE_BLOCK_TYPE_LABELS,
  HOMEPAGE_DEFAULT_CTA_HREF,
  HOMEPAGE_DEFAULT_CTA_LABEL,
  HOMEPAGE_DEFAULT_ITEM_LIMIT,
  HOMEPAGE_SOURCE_TYPE_LABELS,
} from "@/features/homepage/constants";
import type {
  CreateCarouselSectionSchema,
  UpdateCarouselSectionSchema,
} from "@/features/homepage/schema";
import { HomepageBuilderSectionsList } from "./homepage-builder-sections-list";
import { HomepageCarouselDialog } from "./homepage-carousel-dialog";

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface ProductOption {
  id: string;
  isActive: boolean;
  name: string;
  showInB2c: boolean;
  status: string;
}

interface Props {
  categories: CategoryOption[];
  initialSections: AdminHomepageSection[];
  products: ProductOption[];
}

const ACTION_ERRORS: Record<string, string> = {
  INVALID_DATA: "Neplatné údaje.",
  NOT_FOUND: "Sekcia nebola nájdená.",
  INSERT_FAILED: "Uloženie zlyhalo.",
  UPDATE_FAILED: "Aktualizácia zlyhala.",
  DELETE_FAILED: "Odstránenie zlyhalo.",
  REORDER_FAILED: "Zmena poradia zlyhala.",
  LIMIT_REACHED: "Dosiahli ste maximálny počet produktov.",
};

type DialogMode =
  | { type: "closed" }
  | { type: "create" }
  | { type: "edit"; sectionId: string };

export function HomepageBuilderClient({
  initialSections,
  categories,
  products,
}: Props) {
  const router = useRouter();
  const [sections, setSections] =
    useState<AdminHomepageSection[]>(initialSections);
  const [dialogMode, setDialogMode] = useState<DialogMode>({ type: "closed" });
  const [isPending, startTransition] = useTransition();

  const editingSection = useMemo(() => {
    if (dialogMode.type !== "edit") {
      return null;
    }
    return (
      sections.find((section) => section.id === dialogMode.sectionId) ?? null
    );
  }, [dialogMode, sections]);

  const handleReorder = (orderedSectionIds: string[]) => {
    const reordered = orderedSectionIds
      .map((id, index) => {
        const section = sections.find((item) => item.id === id);
        if (!section) {
          return null;
        }
        return { ...section, sortOrder: index };
      })
      .filter((section): section is AdminHomepageSection => section !== null);

    setSections(reordered);
    startTransition(async () => {
      const result = await reorderHomepageSectionsAction({ orderedSectionIds });
      if (!result.success) {
        toast.error(ACTION_ERRORS[result.error] ?? "Zmena poradia zlyhala.");
        setSections(initialSections);
      }
    });
  };

  const handleToggle = (sectionId: string, isEnabled: boolean) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, isEnabled } : section
      )
    );

    startTransition(async () => {
      const result = await toggleHomepageSectionAction({
        sectionId,
        isEnabled,
      });
      if (!result.success) {
        toast.error(ACTION_ERRORS[result.error] ?? "Zmena stavu zlyhala.");
        setSections(initialSections);
      }
    });
  };

  const handleDelete = (sectionId: string) => {
    startTransition(async () => {
      const result = await deleteCarouselSectionAction({ sectionId });
      if (!result.success) {
        toast.error(ACTION_ERRORS[result.error] ?? "Odstránenie zlyhalo.");
        return;
      }
      setSections((prev) => prev.filter((section) => section.id !== sectionId));
      toast.success("Carousel bol odstránený.");
    });
  };

  const handleDuplicate = (sectionId: string) => {
    startTransition(async () => {
      const result = await duplicateCarouselSectionAction({ sectionId });
      if (!result.success) {
        toast.error(ACTION_ERRORS[result.error] ?? "Duplikácia zlyhala.");
        return;
      }
      toast.success("Carousel bol duplikovaný.");
      router.refresh();
    });
  };

  const handleSaveCarousel = (
    payload: CreateCarouselSectionSchema | UpdateCarouselSectionSchema
  ) => {
    startTransition(async () => {
      if ("sectionId" in payload) {
        const result = await updateCarouselSectionAction(payload);
        if (!result.success) {
          toast.error(ACTION_ERRORS[result.error] ?? "Uloženie zlyhalo.");
          return;
        }
        toast.success("Carousel bol aktualizovaný.");
      } else {
        const result = await createCarouselSectionAction(payload);
        if (!result.success) {
          toast.error(ACTION_ERRORS[result.error] ?? "Vytvorenie zlyhalo.");
          return;
        }
        toast.success("Carousel bol vytvorený.");
      }

      setDialogMode({ type: "closed" });
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-bold text-2xl">Domovská stránka</h1>
          <p className="text-muted-foreground text-sm">
            Spravujte poradie sekcií a produktové carousely na homepage.
          </p>
        </div>
        <button
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 font-medium text-primary-foreground text-sm disabled:opacity-50"
          disabled={isPending}
          onClick={() => setDialogMode({ type: "create" })}
          type="button"
        >
          Nový carousel
        </button>
      </div>

      <HomepageBuilderSectionsList
        isPending={isPending}
        labels={HOMEPAGE_BLOCK_TYPE_LABELS}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onEdit={(sectionId) => setDialogMode({ type: "edit", sectionId })}
        onReorder={handleReorder}
        onToggle={handleToggle}
        sections={sections}
        sourceLabels={HOMEPAGE_SOURCE_TYPE_LABELS}
      />

      <HomepageCarouselDialog
        categories={categories}
        initialValues={
          editingSection && editingSection.blockType === "carousel"
            ? {
                title: editingSection.title ?? "Produkty",
                sourceType:
                  (editingSection.sourceType as HomepageCarouselSourceType) ??
                  "best_sellers",
                categoryId: editingSection.categoryId,
                productIds: editingSection.manualProductIds,
                ctaLabel: editingSection.ctaLabel ?? HOMEPAGE_DEFAULT_CTA_LABEL,
                ctaHref: editingSection.ctaHref ?? HOMEPAGE_DEFAULT_CTA_HREF,
                itemLimit:
                  editingSection.itemLimit ?? HOMEPAGE_DEFAULT_ITEM_LIMIT,
              }
            : undefined
        }
        mode={dialogMode.type === "edit" ? "edit" : "create"}
        onOpenChange={(open) => {
          if (!open) {
            setDialogMode({ type: "closed" });
          }
        }}
        onSubmit={handleSaveCarousel}
        open={dialogMode.type !== "closed"}
        products={products}
        sectionId={editingSection?.id}
      />
    </div>
  );
}
