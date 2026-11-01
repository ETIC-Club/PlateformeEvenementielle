import type { ReactNode } from "react";

import { requirePageUser } from "@/lib/auth/page-guard";

/** Pages réservées aux administrateurs (participants, badges, dashboard, comptes). */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requirePageUser(["admin"]);
  return children;
}
