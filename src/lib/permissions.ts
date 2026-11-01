import { ForbiddenError } from "@/lib/errors";

/** Rôles de l'application. Source unique : le schéma DB (enum) et Zod en dérivent. */
export const ROLES = ["admin", "agent"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrateur",
  agent: "Agent de scan",
};

export function hasRole(user: { role: Role }, allowed: readonly Role[]): boolean {
  return allowed.includes(user.role);
}

/** Lance `ForbiddenError` si le rôle de l'utilisateur n'est pas dans la liste. */
export function assertRole(user: { role: Role }, allowed: readonly Role[]): void {
  if (!hasRole(user, allowed)) throw new ForbiddenError();
}
