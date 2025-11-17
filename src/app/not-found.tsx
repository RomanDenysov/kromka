import { SearchIcon } from "lucide-react";
import Link from "next/link";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyTitle>404 - Not Found</EmptyTitle>
          <EmptyDescription>
            Stránka, ktorú hľadáte, neexistuje. Skúste nájsť to, čo potrebujete,
            nižšie.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <InputGroup className="sm:w-3/4">
            <InputGroupInput placeholder="Try searching for pages..." />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">
              <Kbd>/</Kbd>
            </InputGroupAddon>
          </InputGroup>
          <EmptyDescription>
            Potrebujete pomôcť?{" "}
            <Link href="/kontakt/podpora">Kontaktujte podporu</Link>
            <br />
            <Link
              className="mt-4 text-muted-foreground text-xs underline"
              href="/"
            >
              Návrat na domovskú stránku
            </Link>
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    </div>
  );
}
