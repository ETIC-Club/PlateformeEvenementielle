"use client";

import {
  CalendarDays,
  IdCard,
  LayoutDashboard,
  LogOut,
  QrCode,
  ScanLine,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { api } from "@/lib/api-client";
import type { SessionUser } from "@/lib/auth/session";
import { ROLE_LABELS } from "@/lib/permissions";
import { PAGE_ACCESS } from "@/lib/routes";

type NavItem = { href: keyof typeof PAGE_ACCESS & string; label: string; icon: LucideIcon };

/** Entrées du menu. Les rôles autorisés viennent de `PAGE_ACCESS` (lib/routes.ts). */
const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/events", label: "Événements", icon: CalendarDays },
  { href: "/participants", label: "Participants", icon: Users },
  { href: "/badges", label: "QR & badges", icon: IdCard },
  { href: "/scan", label: "Scan", icon: ScanLine },
  { href: "/users", label: "Comptes", icon: UserCog },
];

export function AppSidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const [loggingOut, setLoggingOut] = useState(false);

  const items = NAV_ITEMS.filter((item) => PAGE_ACCESS[item.href]?.includes(user.role));

  async function logout() {
    setLoggingOut(true);
    try {
      await api.post("/api/auth/logout");
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <Sidebar>
      <SidebarHeader className="flex-row items-center gap-2 px-4 py-4">
        <QrCode className="size-5" aria-hidden />
        <span className="font-semibold">Plateforme Événementielle</span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    isActive={pathname === href || pathname.startsWith(`${href}/`)}
                    render={<Link href={href} onClick={() => setOpenMobile(false)} />}
                  >
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-3 p-4">
        <div className="text-sm">
          <p className="font-medium">{user.name}</p>
          <p className="text-muted-foreground">{ROLE_LABELS[user.role]}</p>
        </div>
        <Button variant="outline" size="sm" onClick={logout} disabled={loggingOut}>
          <LogOut />
          Se déconnecter
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
