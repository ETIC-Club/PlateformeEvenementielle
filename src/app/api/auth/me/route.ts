import { defineRoute } from "@/lib/api/define-route";
import { ok } from "@/lib/api/response";
import type { SessionUserDto } from "@/features/users/schemas";

/** Utilisateur connecté (pour afficher le menu selon le rôle). Rôles : admin, agent. */
export const GET = defineRoute(["admin", "agent"], async ({ user }) => {
  // TODO(auth): implémenter — renvoyer l'utilisateur de la vraie session.
  const data: SessionUserDto = {
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
  };
  return ok(data);
});
