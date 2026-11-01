import { defineRoute } from "@/lib/api/define-route";
import { ok } from "@/lib/api/response";
import { MOCK_OVERVIEW_STATS } from "@/features/dashboard/mocks";
import type { OverviewStatsDto } from "@/features/dashboard/schemas";

/** Vue d'ensemble : totaux et taux de présence par événement. Rôles : admin. */
export const GET = defineRoute(["admin"], async () => {
  // TODO(dashboard): implémenter — agrégats sur tous les événements
  return ok<OverviewStatsDto>(MOCK_OVERVIEW_STATS);
});
