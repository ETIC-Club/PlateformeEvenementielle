// Sans aucun import : chargé par drizzle-kit ET par les composants client.

export const SCAN_SESSION_TYPES = ["entrance", "meal", "workshop", "vip", "other"] as const;
export type ScanSessionType = (typeof SCAN_SESSION_TYPES)[number];

export const SCAN_SESSION_TYPE_LABELS: Record<ScanSessionType, string> = {
  entrance: "Entrée",
  meal: "Repas",
  workshop: "Atelier",
  vip: "Accès VIP",
  other: "Autre",
};
