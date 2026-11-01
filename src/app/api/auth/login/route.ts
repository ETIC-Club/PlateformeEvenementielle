import { definePublicRoute } from "@/lib/api/define-route";
import { parseBody } from "@/lib/api/parse";
import { ok } from "@/lib/api/response";
import { UnauthenticatedError } from "@/lib/errors";
import { MOCK_SESSION_USER } from "@/features/users/mocks";
import { loginSchema } from "@/features/users/schemas";

/** Connexion par identifiant / mot de passe. Public. Erreurs : 400, 401 (identifiants incorrects). */
export const POST = definePublicRoute(async ({ request }) => {
  const input = await parseBody(request, loginSchema);

  // TODO(auth): implémenter — vérifier les identifiants avec Better Auth et poser le cookie de session.
  if (input.password === "wrong")
    throw new UnauthenticatedError("Identifiant ou mot de passe incorrect");
  return ok({ user: MOCK_SESSION_USER });
});
