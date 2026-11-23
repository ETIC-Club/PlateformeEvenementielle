# Plateforme Événementielle

Plateforme web de gestion d'événements pour le club : participants (import Excel), QR codes, badges PDF et contrôle d'accès par scan caméra avec sessions de scan indépendantes, détection des doublons et statistiques.

Stack : Next.js 16 · TypeScript · PostgreSQL · Drizzle ORM · Zod · Better Auth · Vercel Blob · pnpm.
Documentation : [`Guide.md`](Guide.md) (conventions) · [`CONTRIBUTING.md`](CONTRIBUTING.md) · [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) · [`docs/DATABASE.md`](docs/DATABASE.md) · [`docs/API.md`](docs/API.md).

## Prérequis

- **Git** et un compte GitHub avec accès à l'organisation
- **Node.js 20.9 ou plus** (LTS 22 ou 24 conseillée)
- **pnpm** : `npm install -g pnpm`
- **PostgreSQL 14 ou plus**, accessible en local (voir ci-dessous)
- **VS Code** (extensions conseillées : ESLint, Prettier, Tailwind CSS IntelliSense) et **Claude Code**
- Optionnel : un client d'API (Bruno ou Postman), un smartphone pour tester le scan

## Installation

```bash
git clone <url-du-depot>
cd PlateformeEvenementielle
pnpm install
cp .env.example .env.local     # puis éditer .env.local (voir « Variables d'environnement »)
```

### Base PostgreSQL locale

Au choix (l'hébergement final n'est pas décidé : le projet n'a besoin que d'une `DATABASE_URL`) :

- **PostgreSQL installé sur votre machine** : créez une base vide, par exemple `plateforme_evenementielle`.
- **Docker** (optionnel) :
  ```bash
  docker run --name plateforme-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=plateforme_evenementielle -p 5432:5432 -d postgres:16
  ```
- **Un PostgreSQL hébergé** (Neon, Supabase, Vercel Postgres…) : copiez son URL de connexion.

Puis mettez l'URL dans `.env.local` : `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/plateforme_evenementielle`.

## Variables d'environnement

| Variable                | Obligatoire      | Rôle                                                                                    |
| ----------------------- | ---------------- | --------------------------------------------------------------------------------------- |
| `DATABASE_URL`          | oui              | URL de connexion PostgreSQL                                                             |
| `BETTER_AUTH_SECRET`    | oui              | Secret de signature des sessions, **32 caractères minimum** : `openssl rand -base64 32` |
| `BETTER_AUTH_URL`       | production       | URL publique de l'application (ex. `https://mon-club.vercel.app`)                       |
| `BLOB_READ_WRITE_TOKEN` | pour les uploads | Token Vercel Blob (fond de badge). Voir « Stockage des fichiers »                       |
| `SEED_ADMIN_PASSWORD`   | non              | Mot de passe du compte `admin` créé par le seed (défaut documenté dans `.env.example`)  |
| `SEED_AGENT_PASSWORD`   | non              | Idem pour le compte `agent`                                                             |

Les variables sont validées au démarrage (`src/lib/env.ts`) : une valeur manquante donne un message d'erreur explicite. `.env.local` n'est **jamais** commité ; toute nouvelle variable s'ajoute à `.env.example` et à `src/lib/env.ts`.

## Lancer le projet

```bash
pnpm db:migrate      # crée les tables
pnpm db:seed         # données de démo + comptes de test
pnpm dev             # http://localhost:3000
```

Comptes créés par le seed : `admin` (administrateur) et `agent` (agent de scan). Leurs mots de passe de développement sont indiqués par `pnpm db:seed` et dans `.env.example`.

> L'interface n'est pas encore développée (c'est une tâche de l'équipe) : en attendant, l'API se teste avec `curl` après `POST /api/auth/login` — voir `Guide.md` §7.

### Migrer et seeder la base

| Commande           | Effet                                                                                                 |
| ------------------ | ----------------------------------------------------------------------------------------------------- |
| `pnpm db:migrate`  | Applique les migrations de `src/db/migrations/` (à relancer après chaque `git pull` qui en ajoute)    |
| `pnpm db:generate` | Crée une migration après une modification de `src/db/schema.ts` (réservé aux PR de schéma)            |
| `pnpm db:seed`     | Vide les comptes et événements puis insère les données de démo. **Refuse de tourner en production**   |
| `pnpm db:studio`   | Interface web pour parcourir les tables                                                               |
| `pnpm db:push`     | Synchronise le schéma sans migration : **uniquement pour des essais jetables**, jamais pour committer |

Repartir de zéro en local : supprimez la base (ou `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`), puis `pnpm db:migrate && pnpm db:seed`.

## Vérifier son travail

```bash
pnpm lint && pnpm typecheck && pnpm build
```

## Scan par caméra : HTTPS obligatoire

Les navigateurs n'autorisent l'accès à la caméra (`getUserMedia`) que sur une **origine sécurisée**. En développement, `http://localhost` fonctionne ; **en production il faut HTTPS** (Vercel le fournit automatiquement). Pour tester le scan depuis un téléphone sur le réseau local pendant le développement, `http://<ip-de-votre-pc>:3000` sera refusé : utilisez un tunnel HTTPS (par exemple `cloudflared` ou `ngrok`) ou le navigateur du PC avec la webcam.

## Stockage des fichiers

Vercel n'a pas de disque persistant : les fichiers (fond de badge) passent par `src/lib/storage` (Vercel Blob).

1. Sur Vercel : projet → **Storage** → **Create** → **Blob** (accès public).
2. Copiez le token `BLOB_READ_WRITE_TOKEN` dans `.env.local` (et dans les variables du projet Vercel).
3. Dans le code : `getStorage().put(chemin, fichier, { contentType })` et `getStorage().delete(url)`.

Pour changer de fournisseur, il suffit d'écrire une nouvelle classe qui implémente `StorageProvider` (`src/lib/storage/types.ts`).

## Déployer sur Vercel

1. **Base de données** : créez un PostgreSQL hébergé (Neon, Supabase, Vercel Postgres…) et récupérez son URL.
2. **Projet Vercel** : importez le dépôt Git ; Vercel détecte Next.js et pnpm. Aucune commande de build particulière.
3. **Variables d'environnement** (Settings → Environment Variables, en _Production_ et _Preview_) : `DATABASE_URL`, `BETTER_AUTH_SECRET` (un secret **différent** de celui du développement), `BETTER_AUTH_URL` (l'URL publique), `BLOB_READ_WRITE_TOKEN`.
4. **Migrations** : appliquez-les depuis votre machine avec l'URL de production :
   ```bash
   DATABASE_URL="<url de production>" pnpm db:migrate
   ```
   Elles ne tournent pas automatiquement au déploiement.
5. **Premier compte administrateur** : `pnpm db:seed` est interdit en production (il efface les données). La création du premier admin en production reste **à décider** (voir la liste des points ouverts dans le récapitulatif de l'étape 6).
6. Vérifiez : `GET https://<votre-domaine>/api/health` → `{ "ok": true, "data": { "status": "ok" } }`, puis la connexion.

## Structure

Voir [`Guide.md`](Guide.md) §4 et [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md). Chaque fonctionnalité a son dossier dans `src/features/<feature>/` pour que chacun travaille sans marcher sur les autres.
