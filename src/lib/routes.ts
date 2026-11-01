import type { Role } from "@/lib/roles";

/**
 * Accès aux PAGES par rôle. Source unique, utilisée par `proxy.ts`, les layouts et le menu.
 * Les endpoints d'API ont leur propre contrôle (`defineRoute`), voir docs/API.md.
 */
export const PAGE_ACCESS: Record<string, readonly Role[]> = {
  "/events": ["admin", "agent"],
  "/scan": ["admin", "agent"],
  "/participants": ["admin"],
  "/badges": ["admin"],
  "/dashboard": ["admin"],
  "/users": ["admin"],
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
