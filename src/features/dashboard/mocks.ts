import { mockId } from "@/lib/mock";

import type { EventStatsDto, OverviewStatsDto } from "./schemas";

// Données factices des stubs d'API. À supprimer quand la feature est implémentée.

export const MOCK_EVENT_STATS: EventStatsDto = {
  eventId: mockId(1),
  eventName: "Journée Portes Ouvertes du Club",
  registered: 20,
  scanned: 12,
  rate: 0.6,
  sessions: [
    {
      sessionId: mockId(10),
      name: "Entrée principale",
      type: "entrance",
      registered: 20,
      scanned: 12,
      rate: 0.6,
    },
    {
      sessionId: mockId(11),
      name: "Déjeuner",
      type: "meal",
      registered: 20,
      scanned: 5,
      rate: 0.25,
    },
  ],
};

export const MOCK_OVERVIEW_STATS: OverviewStatsDto = {
  eventsCount: 2,
  participantsCount: 30,
  scansCount: 21,
  events: [
    {
      eventId: mockId(1),
      eventName: "Journée Portes Ouvertes du Club",
      startsAt: "2026-11-22T09:00:00.000Z",
      registered: 20,
      scanned: 12,
      rate: 0.6,
    },
    {
      eventId: mockId(2),
      eventName: "Conférence IA & Société",
      startsAt: "2026-12-06T13:00:00.000Z",
      registered: 10,
      scanned: 4,
      rate: 0.4,
    },
  ],
};
