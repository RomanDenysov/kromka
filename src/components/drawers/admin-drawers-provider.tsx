"use client";

import { CategoryEditDrawer } from "./category-edit-drawer";
import { CustomerEditDrawer } from "./customer-edit-drawer";
import { StoreEditDrawer } from "./store-edit-drawer";

export function AdminDrawersProvider() {
  return (
    <>
      <CustomerEditDrawer />
      <StoreEditDrawer />
      <CategoryEditDrawer />
    </>
  );
}
