"use client";

import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { TextField } from "@/components/forms/fields/text-field";
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
import { updateProfileAction } from "@/lib/actions/user-profile";
import type { UserDetails } from "@/lib/auth/session";

type Props = {
  user: NonNullable<UserDetails>;
};

type ProfileSchema = {
  name: string;
  phone: string;
};

export function ProfileSettingsForm({ user }: Props) {
  const router = useRouter();

  const form = useForm<ProfileSchema>({
    defaultValues: {
      name: user.name ?? "",
      phone: user.phone ?? "",
    },
  });

  const onSubmit = async (data: ProfileSchema) => {
    const result = await updateProfileAction(data);
    if (result.success) {
      toast.success("Profil bol aktualizovaný");
      router.refresh();
    } else {
      toast.error(result.error ?? "Nepodarilo sa aktualizovať profil");
    }
  };

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
          <FormProvider {...form}>
            <form
              className="flex flex-col gap-6"
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit(onSubmit)(e);
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

                  <TextField label="Meno" name="name" placeholder="Vaše meno" />

                  <TextField
                    label="Telefón"
                    name="phone"
                    placeholder="+421 XXX XXX XXX"
                  />
                </FieldGroup>
              </FieldSet>

              <div className="flex justify-start">
                <Button disabled={form.formState.isSubmitting} type="submit">
                  {form.formState.isSubmitting && (
                    <Loader2Icon className="animate-spin" />
                  )}
                  Uložiť zmeny
                </Button>
              </div>
            </form>
          </FormProvider>
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
