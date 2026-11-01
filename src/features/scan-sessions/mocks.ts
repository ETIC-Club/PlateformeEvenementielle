import { MOCK_DATE, mockId } from "@/lib/mock";

import type { ScanSessionDto, ScanSessionListItemDto } from "./schemas";

// Données factices des stubs d'API. À supprimer quand la feature est implémentée.

export const MOCK_SCAN_SESSION: ScanSessionDto = {
  id: mockId(10),
  eventId: mockId(1),
  name: "Entrée principale",
  type: "entrance",
  isActive: true,
  createdAt: MOCK_DATE,
  updatedAt: MOCK_DATE,
};

export const MOCK_SCAN_SESSION_LIST: ScanSessionListItemDto[] = [
  { ...MOCK_SCAN_SESSION, scannedCount: 12, registeredCount: 20 },
  {
    ...MOCK_SCAN_SESSION,
    id: mockId(11),
    name: "Déjeuner",
    type: "meal",
    scannedCount: 5,
    registeredCount: 20,
  },
];
