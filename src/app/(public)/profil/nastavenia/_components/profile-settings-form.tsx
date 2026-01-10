"use client";

import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import type { UserDetails } from "@/features/auth/session";
import { updateProfileAction } from "@/lib/actions/user-profile";
import { useAppForm } from "@/shared/components/form";

type Props = {
  user: NonNullable<UserDetails>;
};

export function ProfileSettingsForm({ user }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useAppForm({
    defaultValues: {
      name: user.name ?? "",
      phone: user.phone ?? "",
    },
    onSubmit: ({ value }) =>
      startTransition(async () => {
        const result = await updateProfileAction(value);
        if (result.success) {
          toast.success("Profil bol aktualizovaný");
          router.refresh();
        } else {
          toast.error(result.error ?? "Nepodarilo sa aktualizovať profil");
        }
      }),
  });

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Osobné údaje</CardTitle>
          <CardDescription>
            Aktualizujte svoje meno a kontaktné údaje
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form.AppForm>
            <form
              className="flex flex-col gap-6"
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
            >
              <FieldSet className="max-w-md gap-4">
                <FieldGroup className="gap-4">
                  <Field orientation="vertical">
                    <FieldContent>
                      <FieldLabel>Email</FieldLabel>
                      <FieldDescription>
                        Email nie je možné zmeniť
                      </FieldDescription>
                    </FieldContent>
                    <div className="rounded-md border bg-muted/50 px-3 py-2 text-muted-foreground text-sm">
                      {user.email}
                    </div>
                  </Field>

                  <form.AppField name="name">
                    {(field) => (
                      <field.TextField label="Meno" placeholder="Vaše meno" />
                    )}
                  </form.AppField>

                  <form.AppField name="phone">
                    {(field) => (
                      <field.TextField
                        label="Telefón"
                        placeholder="+421 XXX XXX XXX"
                      />
                    )}
                  </form.AppField>
                </FieldGroup>
              </FieldSet>

              <div className="flex justify-start">
                <Button disabled={isPending} type="submit">
                  {isPending && <Loader2Icon className="animate-spin" />}
                  Uložiť zmeny
                </Button>
              </div>
            </form>
          </form.AppForm>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Predvolená predajňa</CardTitle>
          <CardDescription>
            Vyberte predajňu, kde najčastejšie vyzdvihujete objednávky
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm">
            {user.store?.name ?? (
              <span className="text-muted-foreground">
                Predvolená predajňa nie je nastavená
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
