import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Plateforme Événementielle", template: "%s · Plateforme Événementielle" },
  description: "Gestion des événements, participants, QR codes, badges et contrôle d'accès.",
};

// TODO(ui): ajouter les polices, le thème et les providers globaux (src/components/providers.tsx).
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
