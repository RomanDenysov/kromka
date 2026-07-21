import { TabNav } from "./tab-nav";

export default function SettingsLayout({
  children,
}: LayoutProps<"/admin/system/settings">) {
  return (
    <>
      <TabNav />
      <section className="h-full flex-1 p-4">{children}</section>
    </>
  );
}
