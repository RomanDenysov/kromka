"use client";

import { usePathname } from "next/navigation";
import { TextField } from "@/components/forms/fields/text-field";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import type { User } from "@/lib/auth/session";
import { useLoginModalOpen } from "@/store/login-modal-store";

/** Reusable form fields for customer info */
function CustomerInfoFields({ columns = 1 }: { columns?: 1 | 2 }) {
  return (
    <FieldGroup
      className={`grid grid-cols-1 gap-4 ${columns === 2 ? "lg:grid-cols-2" : ""}`}
    >
      <TextField
        className={columns === 2 ? "lg:col-span-2" : undefined}
        inputClassName="w-full max-w-none"
        label="Meno"
        name="name"
        placeholder="Janko Hraško"
      />
      <TextField
        inputClassName="w-full max-w-none"
        label="Email"
        name="email"
        placeholder="janko@priklad.sk"
      />
      <TextField
        inputClassName="w-full max-w-none"
        label="Telefón"
        name="phone"
        placeholder="+421 900 000 000"
      />
    </FieldGroup>
  );
}

type CustomerInfoCardProps = {
  /** Server-provided user data for authenticated users. Null for guests. */
  user: NonNullable<User> | null;
};

/**
 * Customer info fields integrated into the main checkout form.
 * Fields are controlled by the parent FormProvider.
 */
export function CustomerInfoCard({ user }: CustomerInfoCardProps) {
  const openLogin = useLoginModalOpen();
  const pathname = usePathname();

  return (
    <div className="space-y-4">
      <CustomerInfoFields columns={2} />
      {!user && (
        <div className="flex grow items-start justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2">
          <div className="min-w-0">
            <p className="font-medium text-xs">Máte účet?</p>
            <p className="text-muted-foreground text-xs">
              Prihláste sa pre uloženie objednávky do profilu.
            </p>
          </div>
          <Button
            className="shrink-0"
            onClick={() => openLogin("checkout", pathname)}
            size="xs"
            type="button"
            variant="outline"
          >
            Prihlásiť sa
          </Button>
        </div>
      )}
    </div>
  );
}
