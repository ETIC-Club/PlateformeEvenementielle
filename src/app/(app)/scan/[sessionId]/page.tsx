import type { Metadata } from "next";

import { ScanSessionView } from "@/features/scan/components/scan-session-view";

export const metadata: Metadata = { title: "Scan" };

// Page volontairement fine : tout le contenu vit dans features/scan/components.
export default async function Page({ params }: PageProps<"/scan/[sessionId]">) {
  const { sessionId } = await params;
  return <ScanSessionView sessionId={sessionId} />;
}
