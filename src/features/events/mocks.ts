import { MOCK_DATE, mockId } from "@/lib/mock";

import type { EventDto, EventListItemDto } from "./schemas";

// Données factices des stubs d'API. À supprimer quand la feature est implémentée.

export const MOCK_EVENT: EventDto = {
  id: mockId(1),
  name: "Journée Portes Ouvertes du Club",
  description: "Présentation des activités du club, démonstrations et déjeuner de networking.",
  location: "ESI Alger, Amphi A",
  startsAt: "2026-11-22T09:00:00.000Z",
  badgeBackgroundUrl: null,
  createdAt: MOCK_DATE,
  updatedAt: MOCK_DATE,
};

export const MOCK_EVENT_LIST: EventListItemDto[] = [
  { ...MOCK_EVENT, participantsCount: 20, sessionsCount: 2 },
  {
    ...MOCK_EVENT,
    id: mockId(2),
    name: "Conférence IA & Société",
    description: "Conférence d'une demi-journée suivie d'ateliers pratiques.",
    location: "USTHB, Salle des conférences",
    startsAt: "2026-12-06T13:00:00.000Z",
    badgeBackgroundUrl: "https://example.public.blob.vercel-storage.com/badges/ia-societe.png",
    participantsCount: 10,
    sessionsCount: 1,
  },
];
