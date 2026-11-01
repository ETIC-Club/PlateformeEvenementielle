// Sans aucun import : chargé par drizzle-kit (qui ne résout pas l'alias "@/").
export const ROLES = ["admin", "agent"] as const;
export type Role = (typeof ROLES)[number];
