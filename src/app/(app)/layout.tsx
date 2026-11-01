import type { ReactNode } from "react";

import { requirePageUser } from "@/lib/auth/page-guard";

/**
 * Toutes les pages connectées passent par ce layout : il exige une session (sinon → /login).
 * TODO(ui): afficher ici la coque de l'application (menu latéral responsive, en-tête mobile) :
 *   `requirePageUser()` renvoie l'utilisateur (nom, rôle) ; voir `src/components/layout/app-sidebar.tsx`.
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  await requirePageUser();
  return children;
}
