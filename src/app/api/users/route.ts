import { defineRoute } from "@/lib/api/define-route";
import { parseBody, parseQuery } from "@/lib/api/parse";
import { created, paginated } from "@/lib/api/response";
import { MOCK_DATE, mockId, mockPage } from "@/lib/mock";
import { MOCK_USERS } from "@/features/users/mocks";
import { createUserSchema, listUsersQuerySchema, type UserDto } from "@/features/users/schemas";

/** Liste paginée des comptes (filtres `q`, `role`). Rôles : admin. */
export const GET = defineRoute(["admin"], async ({ request }) => {
  const query = parseQuery(request, listUsersQuerySchema);

  // TODO(users): implémenter — lister les comptes
  const { items, meta } = mockPage(
    MOCK_USERS.filter((user) => !query.role || user.role === query.role),
    query,
  );
  return paginated(items, meta);
});

/** Crée un compte (admin ou agent). Rôles : admin. Erreurs : 400, 409 (identifiant ou email déjà pris). */
export const POST = defineRoute(["admin"], async ({ request }) => {
  const { password, ...input } = await parseBody(request, createUserSchema);
  void password;

  // TODO(users): implémenter — créer le compte via Better Auth (hash du mot de passe) ; 409 si doublon
  const user: UserDto = {
    ...input,
    email: input.email ?? `${input.username}@club.local`,
    id: mockId(996),
    createdAt: MOCK_DATE,
  };
  return created(user);
});
