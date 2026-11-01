import type { Metadata } from "next";

import { UsersView } from "@/features/users/components/users-view";

export const metadata: Metadata = { title: "Comptes" };

// Page volontairement fine : tout le contenu vit dans features/users/components.
export default function Page() {
  return <UsersView />;
}
