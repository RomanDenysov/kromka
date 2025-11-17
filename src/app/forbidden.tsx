import Link from "next/link";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

export default function Forbidden() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyTitle>403 - Forbidden</EmptyTitle>
          <EmptyDescription>
            Nemáte dostatočné oprávnenia na prístup k tejto stránke.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <EmptyDescription>
            Potrebujete pomôcť?{" "}
            <Link href="/kontakt/podpora">Kontaktujte podporu</Link>
            <br />
            <Link className="text-muted-foreground text-xs underline" href="/">
              Návrat na domovskú stránku
            </Link>
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    </div>
  );
}
