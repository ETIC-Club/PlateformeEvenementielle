import { headers } from "next/headers";

import type { Role } from "@/lib/permissions";

export type SessionUser = {
  id: string;
  name: string;
  username: string;
  role: Role;
};

const MOCK_USERS: Record<Role, SessionUser> = {
  admin: { id: "mock-admin", name: "Admin Mock", username: "admin", role: "admin" },
  agent: { id: "mock-agent", name: "Agent Mock", username: "agent", role: "agent" },
};

/**
 * Utilisateur connecté, ou `null`.
 *
 * TODO(auth): remplacer par la vraie session (Better Auth) à l'étape 5.
 * D'ici là, en dev uniquement : admin par défaut, et l'en-tête `x-mock-role: agent | anonymous`
 * permet de tester les autres cas.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  if (process.env.NODE_ENV === "production") return null;
  const mockRole = (await headers()).get("x-mock-role");
  if (mockRole === "anonymous") return null;
  return mockRole === "agent" ? MOCK_USERS.agent : MOCK_USERS.admin;
}
