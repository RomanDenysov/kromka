"use client";

import { CategoryEditDrawer } from "./category-edit-drawer";
import { CustomerEditDrawer } from "./customer-edit-drawer";
import { ProductEditDrawer } from "./product-edit-drawer";
import { StoreEditDrawer } from "./store-edit-drawer";

export function DrawerProvider() {
  return (
    <>
      <CustomerEditDrawer />
      <ProductEditDrawer />
      <StoreEditDrawer />
      <CategoryEditDrawer />
    </>
  );
}
