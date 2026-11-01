import { redirect } from "next/navigation";

import { getCurrentUser, type SessionUser } from "@/lib/auth/session";
import { HOME_BY_ROLE } from "@/lib/routes";
import type { Role } from "@/lib/roles";

/**
 * Garde pour les pages et layouts (Server Components) : redirige vers /login si non connecté,
 * vers la page d'accueil du rôle si le rôle n'est pas autorisé. Renvoie l'utilisateur.
 */
export async function requirePageUser(allowed?: readonly Role[]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (allowed && !allowed.includes(user.role)) redirect(HOME_BY_ROLE[user.role]);
  return user;
}
