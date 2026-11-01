import { MOCK_DATE, mockId } from "@/lib/mock";

import type { ParticipantDto } from "./schemas";

// Données factices des stubs d'API. À supprimer quand la feature est implémentée.

const base: Omit<ParticipantDto, "id" | "firstName" | "lastName" | "email" | "qrToken"> = {
  eventId: mockId(1),
  phone: "+213550000000",
  organization: "ESI Alger",
  jobTitle: "Étudiant",
  createdAt: MOCK_DATE,
  updatedAt: MOCK_DATE,
};

export const MOCK_PARTICIPANTS: ParticipantDto[] = [
  ["Amina", "Benali", "amina.benali@example.com"],
  ["Yacine", "Boudiaf", "yacine.boudiaf@example.com"],
  ["Sarah", "Khelifi", "sarah.khelifi@example.com"],
  ["Mehdi", "Hamidi", "mehdi.hamidi@example.com"],
  ["Lina", "Mansouri", "lina.mansouri@example.com"],
].map(([firstName, lastName, email], index) => ({
  ...base,
  id: mockId(100 + index),
  firstName: firstName!,
  lastName: lastName!,
  email: email!,
  qrToken: `mock-token-${String(index + 1).padStart(2, "0")}`.padEnd(32, "x"),
}));

export const MOCK_PARTICIPANT: ParticipantDto = MOCK_PARTICIPANTS[0]!;
