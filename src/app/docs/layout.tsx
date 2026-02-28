import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-1 flex-col min-w-0 bg-background">
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-4 border-b border-border bg-background px-4">
          <SidebarTrigger />
          <div className="font-semibold text-sm">Documentation</div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  );
}
