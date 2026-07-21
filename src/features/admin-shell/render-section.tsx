import type { SearchParams } from "nuqs/server";
import { StoresTable } from "@/components/tables/stores/table";
import type { AdminStore } from "@/features/stores/api/queries";
import { StoresGrid } from "@/features/stores/components/stores-grid";
import { log } from "@/lib/logger";
import { SectionViewToolbar } from "./components/section-view-toolbar";
import { serverBindings } from "./config.server";
import { type AdminDomainSlug, getDomain } from "./config.shared";
import { createSectionParamsLoader } from "./search-params";
import type { SectionConfig } from "./types";

interface RenderSectionArgs {
  domain: AdminDomainSlug;
  searchParams: Promise<SearchParams>;
  section: string;
}

function sectionQueryKey(domain: string, section: string): string {
  return `${domain}.${section}`;
}

/**
 * Renders a configured admin list section (table | grid) from adminConfig + nuqs state.
 */
export async function renderSection({
  domain,
  section,
  searchParams,
}: RenderSectionArgs) {
  const domainConfig = getDomain(domain);
  const cfg: SectionConfig | undefined = domainConfig?.sections[section];
  if (!cfg) {
    throw new Error(`Unknown admin section: ${domain}.${section}`);
  }
  if (!cfg.views?.length) {
    throw new Error(
      `Section ${domain}.${section} has no views — use a custom page body`
    );
  }

  const loadParams = createSectionParamsLoader(cfg);
  const params = await loadParams(searchParams);
  const queryKey = sectionQueryKey(domain, section);
  const query =
    serverBindings.queries[queryKey as keyof typeof serverBindings.queries];
  if (!query) {
    throw new Error(`No query binding for ${queryKey}`);
  }

  const rows = await query(params as Record<string, unknown>);
  const activeView =
    cfg.views.find((view) => view.view === params.view) ?? cfg.views[0];
  if (!activeView) {
    throw new Error(`View ${params.view} not found for ${queryKey}`);
  }

  return (
    <div className="flex h-full flex-1 flex-col">
      <SectionViewToolbar section={cfg} />
      <div className="min-h-0 flex-1">
        {renderSectionView({
          domain,
          section,
          view: activeView.view,
          rows,
        })}
      </div>
    </div>
  );
}

function renderSectionView({
  domain,
  section,
  view,
  rows,
}: {
  domain: string;
  section: string;
  view: "table" | "grid";
  rows: unknown[];
}) {
  const key = sectionQueryKey(domain, section);

  switch (key) {
    case "eshop.stores": {
      const stores = rows as AdminStore[];
      return view === "table" ? (
        <StoresTable stores={stores} />
      ) : (
        <StoresGrid stores={stores} />
      );
    }
    default: {
      log.stores.warn({ key, view }, "No section view renderer registered");
      return (
        <p className="p-4 text-muted-foreground text-sm">
          Sekcia {key} ešte nemá renderer pre {view}.
        </p>
      );
    }
  }
}
