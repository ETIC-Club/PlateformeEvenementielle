import { redirect } from "next/navigation";

import { requirePageUser } from "@/lib/auth/page-guard";
import { HOME_BY_ROLE } from "@/lib/routes";

/** Racine : renvoie chaque rôle vers sa page d'accueil (ou vers /login si non connecté). */
export default async function RootPage() {
  const user = await requirePageUser();
  redirect(HOME_BY_ROLE[user.role]);
}
