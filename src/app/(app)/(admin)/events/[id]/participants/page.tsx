import type { Metadata } from "next";

import { ParticipantsView } from "@/features/participants/components/participants-view";

export const metadata: Metadata = { title: "Participants" };

// Page volontairement fine : tout le contenu vit dans features/participants/components.
export default async function Page({ params }: PageProps<"/events/[id]/participants">) {
  const { id } = await params;
  return <ParticipantsView eventId={id} />;
}
