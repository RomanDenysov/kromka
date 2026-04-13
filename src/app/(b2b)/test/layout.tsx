import { BellIcon, ShoppingCartIcon, User2Icon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

function TestSidebarLeft() {
  return (
    <aside className="w-48 shrink-0 border-r bg-gray-100 p-2">
      <h2>Test Sidebar Left</h2>
      <ul>
        <li>
          <Link href={"/test" as Route}>Test</Link>
        </li>
        <li>
          <Link href={"/test/2" as Route}>Test 2</Link>
        </li>
        <li>
          <Link href={"/test/3" as Route}>Test 3</Link>
        </li>
      </ul>
    </aside>
  );
}

function TestSidebarRight() {
  return (
    <aside className="w-48 shrink-0 border-l bg-gray-100 p-2">
      <h2>Test Sidebar Right</h2>
      <ul>
        <li>
          <Link href={"/test/4" as Route}>Test 4</Link>
        </li>
        <li>
          <Link href={"/test/5" as Route}>Test 5</Link>
        </li>
      </ul>
    </aside>
  );
}

export default function TestLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex size-full min-h-dvh flex-col">
      <header className="sticky top-0 z-20 flex h-12 w-full items-center justify-between border-b p-2 shadow-sm">
        <Link
          className="flex flex-col items-center justify-center gap-0"
          href={"/test" as Route}
        >
          <Icons.kromka className="h-3 text-brand" />
          <span className="font-black text-primary text-xs uppercase leading-none">
            PARTNER
          </span>
        </Link>

        <ButtonGroup>
          <Button size="icon-xs" variant="ghost">
            <User2Icon className="size-4" />
          </Button>
          <Button size="icon-xs" variant="ghost">
            <BellIcon className="size-4" />
          </Button>
          <Button size="icon-xs" variant="ghost">
            <ShoppingCartIcon className="size-4" />
          </Button>
        </ButtonGroup>
      </header>
      <div className="flex min-h-0 flex-1">
        <TestSidebarLeft />
        <main className="min-h-0 grow">{children}</main>
        <TestSidebarRight />
      </div>
    </div>
  );
}
