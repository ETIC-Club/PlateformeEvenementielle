import type { Metadata } from "next";

import { BadgesView } from "@/features/badges/components/badges-view";

export const metadata: Metadata = { title: "QR codes & badges" };

// Page volontairement fine : tout le contenu vit dans features/badges/components.
export default function Page() {
  return <BadgesView />;
}
