import type { Metadata } from "next";

import { BadgesView } from "@/features/badges/components/badges-view";

export const metadata: Metadata = { title: "QR codes et badges" };

// Page volontairement fine : tout le contenu vit dans features/badges/components.
export default async function Page({ params }: PageProps<"/events/[id]/badges">) {
  const { id } = await params;
  return <BadgesView eventId={id} />;
}
