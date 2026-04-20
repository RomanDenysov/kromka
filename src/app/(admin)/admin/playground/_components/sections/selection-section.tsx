"use client";

import { BoldIcon, ItalicIcon } from "lucide-react";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PlaygroundSection } from "../playground-section";

export function SelectionSection() {
  const [selectValue, setSelectValue] = useState("apple");

  return (
    <PlaygroundSection
      description="Checkbox, Radio, Switch, Select, Toggle, Toggle group."
      id="selection"
      title="Výber"
    >
      <div className="flex max-w-lg flex-col gap-8">
        <div className="flex items-center gap-2">
          <Checkbox defaultChecked id="pg-cb" />
          <Label htmlFor="pg-cb">Súhlasím so spracovaním údajov</Label>
        </div>

        <RadioGroup className="flex flex-col gap-2" defaultValue="a">
          <div className="flex items-center gap-2">
            <RadioGroupItem id="pg-r1" value="a" />
            <Label htmlFor="pg-r1">Možnosť A</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem id="pg-r2" value="b" />
            <Label htmlFor="pg-r2">Možnosť B</Label>
          </div>
        </RadioGroup>

        <div className="flex items-center gap-2">
          <Switch defaultChecked id="pg-sw" />
          <Label htmlFor="pg-sw">Notifikácie</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pg-select">Select</Label>
          <Select onValueChange={setSelectValue} value={selectValue}>
            <SelectTrigger className="w-[220px]" id="pg-select">
              <SelectValue placeholder="Vyberte…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apple">Jablko</SelectItem>
              <SelectItem value="orange">Pomaranč</SelectItem>
              <SelectItem value="plum">Slivka</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Toggle aria-label="Bold" size="sm">
            <BoldIcon />
          </Toggle>
          <Toggle aria-label="Italic" pressed variant="outline">
            <ItalicIcon />
          </Toggle>
        </div>

        <div>
          <p className="mb-2 font-medium text-muted-foreground text-xs">
            Toggle group (outline)
          </p>
          <ToggleGroup spacing={0} type="multiple" variant="outline">
            <ToggleGroupItem aria-label="Bold" value="bold">
              <BoldIcon />
            </ToggleGroupItem>
            <ToggleGroupItem aria-label="Italic" value="italic">
              <ItalicIcon />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </PlaygroundSection>
  );
}
