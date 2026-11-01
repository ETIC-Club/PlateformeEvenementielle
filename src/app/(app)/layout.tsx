import type { ReactNode } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { requirePageUser } from "@/lib/auth/page-guard";

/** Coque de toutes les pages connectées : menu latéral (tiroir sur mobile) + zone de contenu. */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requirePageUser();

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4 md:hidden">
          <SidebarTrigger aria-label="Ouvrir le menu" />
          <span className="font-semibold">Plateforme Événementielle</span>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
