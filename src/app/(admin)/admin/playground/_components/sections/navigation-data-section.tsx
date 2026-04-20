"use client";

import { ChevronDownIcon, CircleIcon } from "lucide-react";
import type { Route } from "next";
import { useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperList,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlaygroundSection } from "../playground-section";

export function NavigationDataSection() {
  const [step, setStep] = useState("two");
  const [open, setOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  return (
    <PlaygroundSection
      description="Tabs, Breadcrumb, Collapsible, Stepper, Table, Card, Command."
      id="navigation-data"
      title="Navigácia a dáta"
    >
      <div className="flex flex-col gap-10">
        <div>
          <p className="mb-2 font-medium text-muted-foreground text-xs">
            Breadcrumb
          </p>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={"/admin" as Route}>Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Playground</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div>
          <p className="mb-2 font-medium text-muted-foreground text-xs">Tabs</p>
          <Tabs className="max-w-md" defaultValue="tab1">
            <TabsList>
              <TabsTrigger value="tab1">Prehľad</TabsTrigger>
              <TabsTrigger value="tab2">Detail</TabsTrigger>
            </TabsList>
            <TabsContent className="rounded-md border p-3 text-sm" value="tab1">
              Obsah prvej záložky.
            </TabsContent>
            <TabsContent className="rounded-md border p-3 text-sm" value="tab2">
              Obsah druhej záložky.
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <p className="mb-2 font-medium text-muted-foreground text-xs">
            Collapsible
          </p>
          <Collapsible onOpenChange={setOpen} open={open}>
            <div className="flex items-center gap-2">
              <CollapsibleTrigger asChild>
                <Button size="sm" type="button" variant="ghost">
                  <ChevronDownIcon
                    className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
                  />
                  Rozbaliť sekciu
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="mt-2 rounded-md border bg-muted/30 p-3 text-sm">
              Skrytý obsah po rozbalení.
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div>
          <p className="mb-2 font-medium text-muted-foreground text-xs">
            Stepper
          </p>
          <Stepper
            className="max-w-2xl"
            onValueChange={setStep}
            orientation="horizontal"
            value={step}
          >
            <StepperList>
              {(
                [
                  { label: "Krok 1", value: "one" },
                  { label: "Krok 2", value: "two" },
                  { label: "Krok 3", value: "three" },
                ] as const
              ).map((s) => (
                <StepperItem key={s.value} value={s.value}>
                  <StepperTrigger className="flex-col gap-2">
                    <StepperIndicator>
                      <CircleIcon className="size-4" />
                    </StepperIndicator>
                    <StepperTitle
                      className={step === s.value ? "text-primary" : undefined}
                    >
                      {s.label}
                    </StepperTitle>
                  </StepperTrigger>
                  <StepperSeparator />
                </StepperItem>
              ))}
            </StepperList>
          </Stepper>
        </div>

        <div>
          <p className="mb-2 font-medium text-muted-foreground text-xs">Card</p>
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Karta</CardTitle>
              <CardDescription>Popis pod nadpisom.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Hlavný obsah karty.</p>
            </CardContent>
            <CardFooter className="border-t">
              <Button size="sm" type="button">
                Akcia
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          <p className="mb-2 font-medium text-muted-foreground text-xs">
            Table
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Názov</TableHead>
                <TableHead className="text-right">Množstvo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Chlieb</TableCell>
                <TableCell className="text-right">2</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Rohožník</TableCell>
                <TableCell className="text-right">6</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div>
          <p className="mb-2 font-medium text-muted-foreground text-xs">
            Command
          </p>
          <Command className="rounded-md border shadow-md">
            <CommandInput placeholder="Hľadať príkaz…" />
            <CommandList>
              <CommandEmpty>Žiadne výsledky.</CommandEmpty>
              <CommandGroup heading="Navigácia">
                <CommandItem>
                  Domov
                  <CommandShortcut>⌘H</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  Nastavenia
                  <CommandShortcut>⌘,</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Súbory">
                <CommandItem>Nový dokument</CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </div>

        <div>
          <p className="mb-2 font-medium text-muted-foreground text-xs">
            Command dialog
          </p>
          <Button
            onClick={() => setCommandPaletteOpen(true)}
            type="button"
            variant="outline"
          >
            Otvoriť paletu (modal)
          </Button>
          <CommandDialog
            description="Vyhľadajte príkaz na spustenie."
            onOpenChange={setCommandPaletteOpen}
            open={commandPaletteOpen}
            title="Paleta príkazov"
          >
            <CommandInput placeholder="Hľadať…" />
            <CommandList>
              <CommandEmpty>Žiadne výsledky.</CommandEmpty>
              <CommandGroup heading="Demo">
                <CommandItem onSelect={() => setCommandPaletteOpen(false)}>
                  Zavrieť paletu
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </CommandDialog>
        </div>
      </div>
    </PlaygroundSection>
  );
}
