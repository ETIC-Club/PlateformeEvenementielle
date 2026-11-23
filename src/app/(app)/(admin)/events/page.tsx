import type { Metadata } from "next";

import { EventsView } from "@/features/events/components/events-view";

export const metadata: Metadata = { title: "Événements" };

// Page volontairement fine : tout le contenu vit dans features/events/components.
export default function Page() {
  return <EventsView />;
}
