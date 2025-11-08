"use client";
import { CustomerEditDrawer } from "./customer-edit-drawer";
import { ProductEditDrawer } from "./product-edit-drawer";

export function DrawerProvider() {
  return (
    <>
      <CustomerEditDrawer />
      <ProductEditDrawer />
    </>
  );
}
