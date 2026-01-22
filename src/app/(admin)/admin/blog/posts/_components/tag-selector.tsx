"use client";

import { CheckIcon, XIcon } from "lucide-react";
import { useState } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";
import { Controller, useFormContext } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { AdminTag } from "@/features/posts/api/queries";
import { cn } from "@/lib/utils";

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  label?: string;
  description?: string;
  tags: AdminTag[];
  className?: string;
};

export function TagSelector<T extends FieldValues>({
  name,
  label = "Štítky",
  description,
  tags,
  className,
}: Props<T>) {
  const { control } = useFormContext();
  const [open, setOpen] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const selectedIds: string[] = field.value ?? [];
        const selectedTags = tags.filter((tag) => selectedIds.includes(tag.id));

        const handleSelect = (tagId: string) => {
          const newValue = selectedIds.includes(tagId)
            ? selectedIds.filter((id) => id !== tagId)
            : [...selectedIds, tagId];
          field.onChange(newValue);
        };

        const handleRemove = (tagId: string) => {
          field.onChange(selectedIds.filter((id) => id !== tagId));
        };

        return (
          <Field className={cn("gap-1", className)}>
            <FieldLabel>{label}</FieldLabel>
            {description && (
              <FieldDescription className="text-muted-foreground text-xs">
                {description}
              </FieldDescription>
            )}
            <div className="flex flex-wrap items-center gap-2">
              {selectedTags.map((tag) => (
                <Badge
                  className="gap-1 pr-1"
                  key={tag.id}
                  size="sm"
                  variant="secondary"
                >
                  {tag.name}
                  <button
                    className="ml-1 rounded-full hover:bg-muted"
                    onClick={() => handleRemove(tag.id)}
                    type="button"
                  >
                    <XIcon className="size-3" />
                  </button>
                </Badge>
              ))}
              <Popover onOpenChange={setOpen} open={open}>
                <PopoverTrigger asChild>
                  <Button size="xs" type="button" variant="outline">
                    Pridať štítok
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Hľadať štítky..." />
                    <CommandList>
                      <CommandEmpty>Žiadne štítky.</CommandEmpty>
                      <CommandGroup>
                        {tags.map((tag) => {
                          const isSelected = selectedIds.includes(tag.id);
                          return (
                            <CommandItem
                              key={tag.id}
                              onSelect={() => handleSelect(tag.id)}
                            >
                              <div
                                className={cn(
                                  "mr-2 flex size-4 items-center justify-center rounded-sm border border-primary",
                                  isSelected
                                    ? "bg-primary text-primary-foreground"
                                    : "opacity-50 [&_svg]:invisible"
                                )}
                              >
                                <CheckIcon className="size-3" />
                              </div>
                              {tag.name}
                              <span className="ml-auto text-muted-foreground text-xs">
                                ({tag.postCount})
                              </span>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}
