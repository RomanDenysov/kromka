import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "./ui/button";

export const ContinueShoppingLink = () => (
  <div className="flex w-full items-center justify-center">
    <Link
      className={buttonVariants({ variant: "link", size: "sm" })}
      href="/e-shop"
    >
      <ChevronLeftIcon />
      Pokračovať v nákupe
    </Link>
  </div>
);
