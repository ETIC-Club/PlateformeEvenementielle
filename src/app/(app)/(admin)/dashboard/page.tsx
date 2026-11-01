import type { Metadata } from "next";

import { DashboardView } from "@/features/dashboard/components/dashboard-view";

export const metadata: Metadata = { title: "Tableau de bord" };

// Page volontairement fine : tout le contenu vit dans features/dashboard/components.
export default function Page() {
  return <DashboardView />;
}
