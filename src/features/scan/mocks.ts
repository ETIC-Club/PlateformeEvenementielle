import { MOCK_PARTICIPANTS } from "@/features/participants/mocks";
import { MOCK_DATE, MOCK_DATE_LATER, mockId } from "@/lib/mock";

import type { ScanHistoryItemDto, ScanResultDto, SessionParticipantDto } from "./schemas";

// Données factices des stubs d'API. À supprimer quand la feature est implémentée.

/** Token magique du stub : renvoie "already_scanned". Tout autre token commençant par "invalid" → invalid. */
export const MOCK_TOKEN_ALREADY_SCANNED = "already-scanned";

const agent = { id: mockId(2), name: "Agent de scan" };
const summary = (index: number) => {
  const { id, firstName, lastName, email, organization, jobTitle } = MOCK_PARTICIPANTS[index]!;
  return { id, firstName, lastName, email, organization, jobTitle };
};

export function mockScanResult(token: string): ScanResultDto {
  if (token.startsWith("invalid")) return { status: "invalid", reason: "unknown_token" };
  if (token === MOCK_TOKEN_ALREADY_SCANNED) {
    return {
      status: "already_scanned",
      participant: summary(1),
      scan: { id: mockId(501), scannedAt: MOCK_DATE, scannedBy: agent },
    };
  }
  return {
    status: "valid",
    participant: summary(0),
    scan: { id: mockId(500), scannedAt: MOCK_DATE_LATER, scannedBy: agent },
  };
}

export const MOCK_SCAN_HISTORY: ScanHistoryItemDto[] = [0, 1, 2].map((index) => ({
  id: mockId(500 + index),
  scannedAt: MOCK_DATE,
  participant: summary(index),
  scannedBy: agent,
}));

export const MOCK_SESSION_PARTICIPANTS: SessionParticipantDto[] = [0, 1, 2, 3, 4].map((index) => ({
  participant: summary(index),
  scanned: index < 3,
  scannedAt: index < 3 ? MOCK_DATE : null,
  scannedBy: index < 3 ? agent : null,
}));
