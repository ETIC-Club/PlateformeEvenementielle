import { getCookieCache, getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

import { HOME_BY_ROLE, allowedRolesFor } from "@/lib/routes";
import type { Role } from "@/lib/roles";

/**
 * Protège les PAGES (les API se protègent avec `defineRoute`).
 * - pas de cookie de session  → /login?next=<page demandée>
 * - rôle connu mais interdit  → page d'accueil de son rôle
 * Le rôle vient du cookie signé (sans requête DB). La vérification définitive (session valide,
 * rôle à jour) est refaite dans les layouts via `requirePageUser`.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!getSessionCookie(request)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  const allowed = allowedRolesFor(pathname);
  if (allowed) {
    const cached = await getCookieCache(request, { secret: process.env.BETTER_AUTH_SECRET });
    const role = (cached?.user as { role?: Role } | undefined)?.role;
    if (role && !allowed.includes(role)) {
      return NextResponse.redirect(new URL(HOME_BY_ROLE[role], request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  // Toutes les pages sauf : API, login, fichiers statiques de Next et fichiers avec extension.
  // `\\.` (double) est voulu : dans une chaîne JS, `\.` se réduit à `.`, qui accepte n'importe quel caractère.
  matcher: ["/((?!api|login|_next/static|_next/image|favicon\\.ico|.*\\..*).*)"],
};
