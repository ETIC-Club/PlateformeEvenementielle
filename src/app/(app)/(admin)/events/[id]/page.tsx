import type { Metadata } from "next";

import { EventOverviewView } from "@/features/events/components/event-overview-view";

export const metadata: Metadata = { title: "Événement" };

// Page volontairement fine : tout le contenu vit dans features/events/components.
export default async function Page({ params }: PageProps<"/events/[id]">) {
  const { id } = await params;
  return <EventOverviewView eventId={id} />;
}
