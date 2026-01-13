"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon, EditIcon } from "lucide-react";
import { useState, useTransition } from "react";
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
import { useCustomerActions, useCustomerData } from "@/store/customer-store";

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
  /** Login callback for guest users */
  onLoginClick?: () => void;
};

/**
 * Unified customer info display and edit.
 * - Auth users: displays server data, saves to DB
 * - Guests: displays/saves to customer store (localStorage)
 */
export function CustomerInfoCard({
  user,
  onLoginClick,
}: CustomerInfoCardProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const customer = useCustomerData();
  const { setCustomer } = useCustomerActions();

  // Resolve display values: auth user from props, guest from store
  const displayData = user
    ? {
        name: user.name ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
        image: user.image,
      }
    : {
        name: customer?.name ?? "",
        email: customer?.email ?? "",
        phone: customer?.phone ?? "",
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
      setCustomer({
        id: "guest",
        name: values.name,
        email: values.email,
        phone: values.phone,
        image: null,
      });
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
        />
      ) : (
        <FormProvider {...form}>
          <CustomerInfoFields columns={2} />
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              size="sm"
              type="button"
              variant="secondary"
            >
              <CheckIcon className="size-3.5" />
              Uložiť údaje
            </Button>
          </div>
        </FormProvider>
      )}

      {!user && onLoginClick && (
        <div className="flex items-start justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2">
          <div className="min-w-0">
            <p className="font-medium text-sm">Máte účet?</p>
            <p className="text-muted-foreground text-xs">
              Prihláste sa pre uloženie objednávky do profilu.
            </p>
          </div>
          <Button
            className="shrink-0"
            onClick={onLoginClick}
            size="sm"
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

/** Display mode with edit popover */
function CustomerInfoDisplay({
  displayData,
  form,
  open,
  onOpenChange,
  onSave,
  isPending,
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
}) {
  return (
    <div className="flex items-start gap-3">
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

      <Popover onOpenChange={onOpenChange} open={open}>
        <PopoverTrigger asChild>
          <Button
            className="shrink-0 text-muted-foreground"
            size="xs"
            type="button"
            variant="ghost"
          >
            <EditIcon className="size-3.5" />
            Upraviť
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80" side="bottom">
          <FormProvider {...form}>
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Upraviť údaje</h4>
                <p className="text-muted-foreground text-sm">
                  Zadajte svoje osobné údaje, aby sme vám mohli kontaktovať.
                </p>
              </div>
              <CustomerInfoFields />
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
            </div>
          </FormProvider>
        </PopoverContent>
      </Popover>
    </div>
  );
}
