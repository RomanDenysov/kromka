"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon, EditIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { TextField } from "@/components/forms/fields/text-field";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { type UserInfoData, userInfoSchema } from "@/features/checkout/schema";
import { updateCurrentUserProfile } from "@/lib/actions/user-profile";
import type { User } from "@/lib/auth/session";
import { getInitials } from "@/lib/utils";
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
  /** Guest info from last order prefill */
  guestInfo?: { name: string; email: string; phone: string } | null;
};

/**
 * Unified customer info display and edit.
 * - Auth users: displays server data, saves to DB
 * - Guests: displays/saves to httpOnly cookies
 */
export function CustomerInfoCard({ user, guestInfo }: CustomerInfoCardProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const openLogin = useLoginModalOpen();
  const pathname = usePathname();
  const _autoSaveTimeout = useRef<NodeJS.Timeout | null>(null);

  // Resolve display values: auth user from props, guest from cookie
  const displayData = user
    ? {
        name: user.name ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
        image: user.image,
      }
    : {
        name: guestInfo?.name ?? "",
        email: guestInfo?.email ?? "",
        phone: guestInfo?.phone ?? "",
        image: null,
      };

  const hasData = displayData.name || displayData.email || displayData.phone;

  const form = useForm<UserInfoData>({
    resolver: zodResolver(userInfoSchema),
    defaultValues: {
      name: displayData.name,
      email: displayData.email,
      phone: displayData.phone,
    },
  });

  const handleSave = () => {
    const values = form.getValues();
    if (!userInfoSchema.safeParse(values).success) {
      toast.error("Vyplňte všetky povinné polia");
      return;
    }

    if (user) {
      startTransition(async () => {
        const result = await updateCurrentUserProfile(values);
        if (result.success) {
          toast.success("Údaje boli uložené");
          setOpen(false);
        } else {
          toast.error(result.error);
        }
      });
    } else {
      // For guests, just close the popover - data will be saved when order is created
      toast.success("Údaje boli uložené");
      setOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      {hasData ? (
        <CustomerInfoDisplay
          displayData={displayData}
          form={form}
          isPending={isPending}
          onOpenChange={setOpen}
          onSave={handleSave}
          open={open}
          user={user}
        />
      ) : (
        <FormProvider {...form}>
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
        </FormProvider>
      )}
    </div>
  );
}

/** Display mode with edit popover */
function CustomerInfoDisplay({
  displayData,
  form,
  open,
  onOpenChange,
  onSave,
  isPending,
  user,
}: {
  displayData: {
    name: string;
    email: string;
    phone: string;
    image: string | null;
  };
  form: ReturnType<typeof useForm<UserInfoData>>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  isPending: boolean;
  user: NonNullable<User> | null;
}) {
  return (
    <Popover onOpenChange={onOpenChange} open={open}>
      <PopoverTrigger asChild>
        <div className="flex items-start gap-3 rounded-sm border p-1">
          <Avatar className="size-10 shrink-0 rounded-sm">
            {displayData.image && (
              <AvatarImage
                alt={displayData.name}
                className="rounded-sm"
                src={displayData.image}
              />
            )}
            <AvatarFallback className="rounded-sm">
              {getInitials(displayData.name || displayData.email)}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col gap-0">
            <p className="truncate font-medium text-xs leading-tight">
              {displayData.name || "—"}
            </p>
            <p className="break-all text-muted-foreground text-xs leading-tight">
              {displayData.email || "—"}
            </p>
            <p className="text-muted-foreground text-xs leading-tight">
              {displayData.phone || "—"}
            </p>
          </div>

          <div className="inline-flex shrink-0 cursor-pointer items-center gap-0.5 p-0.5 text-muted-foreground">
            <EditIcon className="size-3.5" />
            <span className="text-xs">Upraviť</span>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-(--radix-popover-trigger-width)"
        side="bottom"
      >
        <FormProvider {...form}>
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Upraviť údaje</h4>
              <p className="text-muted-foreground text-sm">
                {user
                  ? "Zadajte svoje osobné údaje, aby sme vám mohli kontaktovať."
                  : "Údaje sa automaticky ukladajú."}
              </p>
            </div>
            <CustomerInfoFields />
            {user && (
              <div className="flex justify-end">
                <Button
                  disabled={isPending}
                  onClick={onSave}
                  size="xs"
                  type="button"
                  variant="outline"
                >
                  {isPending ? (
                    <Spinner className="size-3" />
                  ) : (
                    <CheckIcon className="size-3" />
                  )}
                  {isPending ? "Ukladám..." : "Uložiť"}
                </Button>
              </div>
            )}
          </div>
        </FormProvider>
      </PopoverContent>
    </Popover>
  );
}
