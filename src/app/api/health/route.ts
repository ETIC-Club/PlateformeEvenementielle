import { definePublicRoute } from "@/lib/api/define-route";
import { ok } from "@/lib/api/response";

export const GET = definePublicRoute(async () => ok({ status: "ok" as const }));
