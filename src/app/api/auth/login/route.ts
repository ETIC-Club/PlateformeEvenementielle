import { APIError } from "better-auth/api";

import { definePublicRoute } from "@/lib/api/define-route";
import { parseBody } from "@/lib/api/parse";
import { ok } from "@/lib/api/response";
import { auth } from "@/lib/auth/auth";
import { UnauthenticatedError } from "@/lib/errors";
import { loginSchema, type SessionUserDto } from "@/features/users/schemas";
import { ROLES, type Role } from "@/lib/roles";

/** Connexion par identifiant / mot de passe. Public. Erreurs : 400, 401 (identifiants incorrects). */
export const POST = definePublicRoute(async ({ request }) => {
  const { username, password } = await parseBody(request, loginSchema);

  try {
    // Pose le cookie de session (plugin nextCookies).
    const { user } = await auth.api.signInUsername({
      body: { username, password },
      headers: request.headers,
    });
    const role = (user as { role?: string }).role as Role;
    if (!ROLES.includes(role)) throw new UnauthenticatedError("Compte sans rôle valide");

    const data: SessionUserDto = {
      id: user.id,
      name: user.name,
      username: (user as { username?: string | null }).username ?? username,
      role,
    };
    return ok({ user: data });
  } catch (error) {
    // Message volontairement unique : ne révèle pas si l'identifiant existe.
    if (error instanceof APIError) {
      throw new UnauthenticatedError("Identifiant ou mot de passe incorrect");
    }
    throw error;
  }
});
