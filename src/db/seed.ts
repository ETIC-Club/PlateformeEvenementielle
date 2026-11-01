import { config } from "dotenv";

config({ path: ".env.local" });
config();

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Le seed efface les données : interdit en production.");
  }

  // Imports dynamiques : `env` doit être validé APRÈS le chargement des fichiers .env.
  const { db } = await import("./client");
  const { seed } = await import("./seed-data");

  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!";
  const agentPassword = process.env.SEED_AGENT_PASSWORD ?? "Agent123!";

  const summary = await seed(db, { adminPassword, agentPassword });

  console.log("Seed terminé :", summary);
  console.log(`Comptes de dev : admin / ${adminPassword}  —  agent / ${agentPassword}`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
