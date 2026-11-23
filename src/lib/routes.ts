import type { Role } from "@/lib/roles";

/**
 * Accès aux PAGES par rôle. Source unique, utilisée par `proxy.ts`, les layouts et le menu.
 * Les endpoints d'API ont leur propre contrôle (`defineRoute`), voir docs/API.md.
 */
export const PAGE_ACCESS: Record<string, readonly Role[]> = {
  // Tout ce qui est sous /events (liste, participants, sessions, QR & badges) est réservé aux admins.
  "/events": ["admin"],
  "/dashboard": ["admin"],
  "/users": ["admin"],
  // Écran de scan : accessible aux agents (choix de l'événement et de la session, puis scan).
  "/scan": ["admin", "agent"],
};

/** Page d'accueil après connexion, selon le rôle. */
export const HOME_BY_ROLE: Record<Role, string> = {
  admin: "/dashboard",
  agent: "/scan",
};

/** Rôles autorisés sur ce chemin, ou `undefined` si la page n'est pas protégée par rôle. */
export function allowedRolesFor(pathname: string): readonly Role[] | undefined {
  const section = Object.keys(PAGE_ACCESS).find(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  return section ? PAGE_ACCESS[section] : undefined;
}
