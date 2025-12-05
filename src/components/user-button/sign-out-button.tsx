"use client";

import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signOut } from "@/lib/auth/client";
import { DropdownMenuItem } from "../ui/dropdown-menu";

export function SignOutButton() {
  const router = useRouter();
  return (
    <DropdownMenuItem
      onClick={() =>
        signOut({
          fetchOptions: {
            onSuccess: () => {
              router.push("/");
              router.refresh();
            },
            onError: () => {
              toast.error("Odhlásenie sa nepodarilo");
            },
          },
        })
      }
    >
      <LogOutIcon />
      Odhlásiť sa
    </DropdownMenuItem>
  );
}
