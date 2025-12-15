import { useForm } from "react-hook-form";
import type { ProductSchema } from "./validation";

export function useProductForm() {
  const form = useForm<ProductSchema>({
    defaultValues: {
      name: "",
      slug: "",
      description: null,
      isActive: true,
      sortOrder: 0,
      status: "draft",
      showInB2c: true,
      showInB2b: false,
      priceCents: 0,
    },
  });
  return form;
}
