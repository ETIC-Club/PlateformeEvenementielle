import type { NextRequest } from "next/server";

import { failure } from "@/lib/api/response";
import { getCurrentUser, type SessionUser } from "@/lib/auth/session";
import { AppError, UnauthenticatedError } from "@/lib/errors";
import { assertRole, type Role } from "@/lib/permissions";

type RouteArgs<P, U> = { request: NextRequest; params: P; user: U };
type Handler<P, U> = (args: RouteArgs<P, U>) => Promise<Response>;
type NextContext<P> = { params: Promise<P> };

function toErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    return failure(error.status, {
      code: error.code,
      message: error.message,
      details: error.details,
    });
  }
  console.error(error);
  return failure(500, { code: "INTERNAL_ERROR", message: "Erreur interne du serveur" });
}

/**
 * Enveloppe un route handler protégé : authentifie, vérifie le rôle, convertit les erreurs.
 * C'est LA façon de déclarer un endpoint (jamais de `export async function GET` brut).
 *
 *   export const GET = defineRoute(["admin", "agent"], async ({ request, params, user }) => { ... });
 *
 * `roles` est obligatoire et explicite : passer les deux rôles pour "tout utilisateur connecté".
 */
export function defineRoute<P extends Record<string, string> = Record<string, string>>(
  roles: readonly Role[],
  handler: Handler<P, SessionUser>,
) {
  return async (request: NextRequest, context: NextContext<P>) => {
    try {
      const user = await getCurrentUser();
      if (!user) throw new UnauthenticatedError();
      assertRole(user, roles);
      return await handler({ request, params: await context.params, user });
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

/** Endpoint public (login, health). À utiliser avec parcimonie. */
export function definePublicRoute<P extends Record<string, string> = Record<string, string>>(
  handler: Handler<P, null>,
) {
  return async (request: NextRequest, context: NextContext<P>) => {
    try {
      return await handler({ request, params: await context.params, user: null });
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}
