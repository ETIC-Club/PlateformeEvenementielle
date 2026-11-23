import type { Metadata } from "next";

import { SessionsView } from "@/features/scan-sessions/components/sessions-view";

export const metadata: Metadata = { title: "Sessions de scan" };

// Page volontairement fine : tout le contenu vit dans features/scan-sessions/components.
export default async function Page({ params }: PageProps<"/events/[id]/sessions">) {
  const { id } = await params;
  return <SessionsView eventId={id} />;
}
