import { config } from "dotenv";

config({ path: ".env.local" });
config();

async function main() {
  // Le seed réaliste est écrit à l'étape 3.
  console.log("Seed: rien à insérer pour l'instant.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
