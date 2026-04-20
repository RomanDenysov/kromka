"use client";

import { MailIcon, SearchIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Editable,
  EditableArea,
  EditableCancel,
  EditableInput,
  EditablePreview,
  EditableSubmit,
  EditableToolbar,
  EditableTrigger,
} from "@/components/ui/editable";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlaygroundSection } from "../playground-section";

export function InputsFieldsSection() {
  const [editable, setEditable] = useState("Upraviteľný text");

  return (
    <PlaygroundSection
      description="Input, Textarea, Label, Field, InputGroup, Editable, Kbd."
      id="inputs"
      title="Polia a formuláre"
    >
      <div className="flex max-w-xl flex-col gap-8">
        <div className="space-y-2">
          <Label htmlFor="pg-input">Label + Input</Label>
          <Input id="pg-input" placeholder="Placeholder…" type="text" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pg-textarea">Textarea</Label>
          <Textarea id="pg-textarea" placeholder="Viac riadkov…" rows={3} />
        </div>

        <FieldSet>
          <FieldLegend>FieldSet + Field</FieldLegend>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="pg-email">Email</FieldLabel>
              <Input id="pg-email" placeholder="ja@example.com" type="email" />
              <FieldDescription>
                Na túto adresu pošleme potvrdenie.
              </FieldDescription>
            </Field>
            <FieldSeparator />
            <Field data-invalid="true">
              <FieldLabel htmlFor="pg-invalid">Neplatné pole</FieldLabel>
              <Input aria-invalid id="pg-invalid" placeholder="—" />
              <FieldError errors={[{ message: "Toto pole je povinné." }]} />
            </Field>
          </FieldGroup>
        </FieldSet>

        <div>
          <p className="mb-2 font-medium text-muted-foreground text-xs">
            Input group
          </p>
          <InputGroup>
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput placeholder="Hľadať…" />
            <InputGroupAddon align="inline-end">
              <InputGroupButton>Go</InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <InputGroup className="mt-3 max-w-md">
            <InputGroupAddon align="inline-start">
              <InputGroupText>
                <MailIcon className="size-4" />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput placeholder="email@…" type="email" />
          </InputGroup>
        </div>

        <div>
          <p className="mb-2 font-medium text-muted-foreground text-xs">
            Editable
          </p>
          <Editable
            className="flex flex-wrap items-center gap-2"
            onSubmit={setEditable}
            value={editable}
          >
            <EditableArea>
              <EditablePreview />
              <EditableInput />
            </EditableArea>
            <EditableTrigger asChild>
              <Button size="sm" type="button" variant="outline">
                Upraviť
              </Button>
            </EditableTrigger>
            <EditableToolbar className="flex gap-1">
              <EditableSubmit asChild>
                <Button size="sm" type="button">
                  OK
                </Button>
              </EditableSubmit>
              <EditableCancel asChild>
                <Button size="sm" type="button" variant="ghost">
                  Zrušiť
                </Button>
              </EditableCancel>
            </EditableToolbar>
          </Editable>
        </div>

        <div>
          <p className="mb-2 font-medium text-muted-foreground text-xs">Kbd</p>
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <span className="text-muted-foreground text-xs">+</span>
            <Kbd>K</Kbd>
          </KbdGroup>
        </div>
      </div>
    </PlaygroundSection>
  );
}
