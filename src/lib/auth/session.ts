import { headers } from "next/headers";

import { auth } from "@/lib/auth/auth";
import { ROLES, type Role } from "@/lib/roles";

export type SessionUser = {
  id: string;
  name: string;
  username: string;
  role: Role;
};

function isRole(value: unknown): value is Role {
  return ROLES.includes(value as Role);
}

/** Utilisateur connecté d'après le cookie de session, ou `null`. Utilisable en route handler et en page. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !isRole(session.user.role)) return null;
  const { id, name, username, role } = session.user;
  return { id, name, username: username ?? "", role };
}
