import type { Metadata } from "next";

import { ScanView } from "@/features/scan/components/scan-view";

export const metadata: Metadata = { title: "Scan" };

// Page volontairement fine : tout le contenu vit dans features/scan/components.
export default function Page() {
  return <ScanView />;
}
