import type { ReactNode } from "react";

export function GridView({ children }: { children: ReactNode }) {
  return (
    <section className="grid grid-cols-2 gap-4 md:grid-cols-3" role="feed">
      {children}
    </section>
  );
}
