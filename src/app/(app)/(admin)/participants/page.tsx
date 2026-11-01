import type { Metadata } from "next";

import { ParticipantsView } from "@/features/participants/components/participants-view";

export const metadata: Metadata = { title: "Participants" };

// Page volontairement fine : tout le contenu vit dans features/participants/components.
export default function Page() {
  return <ParticipantsView />;
}
