import { defineRoute } from "@/lib/api/define-route";
import { parseBody, parseParams } from "@/lib/api/parse";
import { noContent, ok } from "@/lib/api/response";
import { ConflictError } from "@/lib/errors";
import { mockNotFoundIf } from "@/lib/mock";
import { MOCK_USERS } from "@/features/users/mocks";
import { updateUserSchema, userIdParamsSchema, type UserDto } from "@/features/users/schemas";

type Params = { id: string };

/** Détail d'un compte. Rôles : admin. Erreurs : 404. */
export const GET = defineRoute<Params>(["admin"], async ({ params }) => {
  const { id } = parseParams(params, userIdParamsSchema);

  // TODO(users): implémenter — lire le compte (404 si absent)
  mockNotFoundIf(id, "Utilisateur introuvable");
  return ok<UserDto>({ ...MOCK_USERS[1]!, id });
});

/** Modifie nom, rôle ou mot de passe d'un compte. Rôles : admin. Erreurs : 400, 404, 409 (retirer son propre rôle admin). */
export const PATCH = defineRoute<Params>(["admin"], async ({ request, params, user }) => {
  const { id } = parseParams(params, userIdParamsSchema);
  const { password, ...input } = await parseBody(request, updateUserSchema);
  void password;

  // TODO(users): implémenter — mettre à jour ; refuser (409) qu'un admin se retire son propre rôle admin
  mockNotFoundIf(id, "Utilisateur introuvable");
  if (id === user.id && input.role && input.role !== "admin") {
    throw new ConflictError("Vous ne pouvez pas retirer votre propre rôle administrateur");
  }
  return ok<UserDto>({ ...MOCK_USERS[1]!, ...input, id });
});

/** Supprime un compte (ses scans passés sont conservés). Rôles : admin. Erreurs : 404, 409 (supprimer son propre compte). */
export const DELETE = defineRoute<Params>(["admin"], async ({ params, user }) => {
  const { id } = parseParams(params, userIdParamsSchema);

  // TODO(users): implémenter — supprimer le compte
  mockNotFoundIf(id, "Utilisateur introuvable");
  if (id === user.id) throw new ConflictError("Vous ne pouvez pas supprimer votre propre compte");
  return noContent();
});
