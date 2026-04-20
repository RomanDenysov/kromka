"use client";

import { MoreHorizontalIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PlaygroundSection } from "../playground-section";

export function OverlaysSection() {
  return (
    <PlaygroundSection
      description="Dialog, Sheet, Drawer, Alert dialog, Popover, Tooltip, Dropdown menu."
      id="overlays"
      title="Prekryvy"
    >
      <div className="flex flex-wrap gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button type="button" variant="outline">
              Dialog
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modálne okno</DialogTitle>
              <DialogDescription>
                Obsah dialógu. Zatvorí sa klikom mimo alebo cez X.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button">Rozumiem</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Sheet>
          <SheetTrigger asChild>
            <Button type="button" variant="outline">
              Sheet
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Bočný panel</SheetTitle>
              <SheetDescription>Sheet z pravého okraja.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>

        <Drawer>
          <DrawerTrigger asChild>
            <Button type="button" variant="outline">
              Drawer
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Spodný drawer</DrawerTitle>
              <DrawerDescription>Obsah typicky na mobile.</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button type="button" variant="secondary">
                  Zavrieť
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="destructive">
              Alert dialog
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Naozaj zmazať?</AlertDialogTitle>
              <AlertDialogDescription>
                Táto akcia sa nedá vrátiť späť.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel type="button">Zrušiť</AlertDialogCancel>
              <AlertDialogAction type="button">Zmazať</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline">
              Popover
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <p className="text-sm">Krátky obsah popoveru.</p>
          </PopoverContent>
        </Popover>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="outline">
              Tooltip
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Nápoveda pri hoveri</p>
          </TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" type="button" variant="outline">
              <MoreHorizontalIcon />
              <span className="sr-only">Menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Akcie</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Upraviť</DropdownMenuItem>
            <DropdownMenuItem>Duplikovať</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </PlaygroundSection>
  );
}
