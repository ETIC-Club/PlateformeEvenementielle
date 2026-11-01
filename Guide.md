# Guide du projet — Plateforme Événementielle

> Ce fichier est lu par **tous les membres de l'équipe et par Claude Code** (via `CLAUDE.md`). Il décrit comment on travaille. En cas de doute, ce guide prime ; pour le changer, on en parle au project lead.

## 1. Le projet en deux lignes

Plateforme web pour le club : gérer des **événements** et leurs **participants** (import Excel), générer des **QR codes** et des **badges PDF**, et **contrôler les accès** par scan caméra dans des **sessions de scan** (entrée, repas, atelier, VIP…) avec détection des doublons et statistiques. Deux rôles : `admin` et `agent` (agent de scan). Cahier des charges : `docs/CDC-Platforme-Evenmentielle.txt` ; tâches : `docs/Taches-Platforme-Evenmentielle.txt`.

## 2. Stack

| Domaine         | Choix                                                                            |
| --------------- | -------------------------------------------------------------------------------- |
| Framework       | Next.js 16 (App Router), React 19, TypeScript **strict**                         |
| Base de données | PostgreSQL + Drizzle ORM (`drizzle-kit` pour les migrations)                     |
| Validation      | Zod 4 — **un seul schéma** partagé entre l'API et les formulaires                |
| Auth            | Better Auth (identifiant / mot de passe, rôles `admin` / `agent`)                |
| Fichiers        | Abstraction `lib/storage` → Vercel Blob (jamais d'écriture sur le disque)        |
| UI (à venir)    | Tailwind + shadcn/ui, TanStack Query, react-hook-form — **pas encore installés** |
| Qualité         | ESLint + Prettier, pnpm                                                          |
| Déploiement     | Vercel                                                                           |

> **Next.js 16 diffère de ce que vous (et l'IA) connaissez** : `middleware` s'appelle `proxy`, etc. Avant d'utiliser une API Next.js, lisez le guide correspondant dans `node_modules/next/dist/docs/` (voir `AGENTS.md`).

**Pourquoi Better Auth** : c'est la solution la plus simple et fiable pour de l'identifiant / mot de passe avec Next.js et Drizzle (sessions, hachage scrypt, cookies sécurisés fournis, configuration au lieu de code maison) ; Auth.js reste en bêta en v5 et n'est pas pensé pour ce cas ; écrire sa propre auth serait risqué en 3 semaines.

## 3. Commandes

```bash
pnpm install        # installer les dépendances
pnpm dev            # serveur de dev (http://localhost:3000)
pnpm lint           # ESLint            ← doit passer avant chaque PR
pnpm typecheck      # TypeScript        ← doit passer avant chaque PR
pnpm build          # build de production ← doit passer avant chaque PR
pnpm format         # Prettier (écrit les fichiers)

pnpm db:generate    # génère une migration depuis src/db/schema.ts
pnpm db:migrate     # applique les migrations
pnpm db:push        # (dev uniquement) pousse le schéma sans migration — NE PAS utiliser pour committer
pnpm db:seed        # données de démo (efface les données ! interdit en production)
pnpm db:studio      # interface web pour parcourir la base
```

Installation complète, variables d'environnement et déploiement : voir `README.md`.

## 4. Structure du code

```
src/
├── app/            # Routes Next.js. FINES : elles appellent les features.
│   ├── api/…       #   route handlers (un dossier par ressource)
│   ├── (app)/…     #   pages connectées ; (app)/(admin)/… = pages réservées aux admins
│   └── login/      #   page publique
├── features/<f>/   # events, participants, import-export, qr, badges, scan-sessions, scan, dashboard, users
│   ├── components/ #   composants React de la feature (les vues de pages vivent ici)
│   ├── schemas.ts  #   schémas Zod (entrées/sorties) + types inférés
│   ├── queries.ts  #   accès DB (Drizzle) — seul fichier qui importe la DB
│   ├── service.ts  #   logique métier
│   └── mocks.ts    #   données factices des stubs (à supprimer quand la feature est faite)
├── db/             # schema.ts, client.ts, migrations/, seed.ts
├── lib/            # code transverse : env, erreurs, rôles, pagination, auth, storage, helpers d'API
├── components/     # composants partagés (layout, common, form) — à écrire par l'équipe front
└── proxy.ts        # protection des pages par rôle
```

Détail et justification : `docs/ARCHITECTURE.md`. Base de données : `docs/DATABASE.md`. **Endpoints : `docs/API.md`** (le contrat).

## 5. Comment on travaille

### Le flux d'une requête

`route.ts` (valide avec Zod, vérifie le rôle, appelle **un** service) → `service.ts` (règles métier, lance des `AppError`) → `queries.ts` (requêtes Drizzle) → PostgreSQL. **Aucune règle métier dans les routes ni dans les queries.**

### Déclarer un endpoint

Les endpoints existent déjà comme **stubs** (données factices, rôle et validation déjà en place). Pour en implémenter un :

1. Repérer le `// TODO(<feature>): implémenter` dans `src/app/api/…/route.ts`.
2. Écrire la requête dans `features/<f>/queries.ts` et la logique dans `features/<f>/service.ts`.
3. Remplacer le mock dans la route par l'appel au service. **Ne changez ni l'URL, ni les rôles, ni la forme des entrées/sorties** (le front en dépend). Si le contrat doit changer : on en parle d'abord, puis on met à jour `docs/API.md` et les schémas **dans la même PR**.
4. Supprimer les imports `mocks` / `lib/mock` devenus inutiles.

### Réponses et erreurs

- Tout endpoint s'écrit avec `defineRoute([...rôles], handler)` (ou `definePublicRoute`). Jamais de `export async function GET` brut. Les rôles sont **toujours explicites**.
- Réponse : `ok(data)`, `created(data)`, `paginated(items, meta)`, `noContent()` — forme `{ ok, data, meta? }` / `{ ok:false, error:{ code, message, details? } }`.
- Erreur attendue : `throw new NotFoundError("…")` / `ConflictError` / `ValidationError`… (`lib/errors.ts`). Un scan « déjà scanné » ou « invalide » n'est **pas** une erreur : réponse 200 avec `status`.
- Entrées : `parseBody`, `parseQuery`, `parseParams` (`lib/api/parse.ts`).

### Règles d'architecture (ESLint en bloque certaines)

- `@/db/client` n'est importé que dans `queries.ts` (ESLint le vérifie). `service.ts` n'importe pas `next/*` (idem).
- Une feature **n'importe jamais** les `queries.ts` ni les `components/` d'une autre. Besoin de données d'une autre feature → appeler son `service.ts`.
- Pas de fichiers `index.ts` « barrel ». Imports avec l'alias `@/` (sauf dans `src/db/`, en relatif).
- Les types sont **inférés de Zod** (`z.infer`), jamais recopiés à la main.

### Nommage et langue

Fichiers en `kebab-case`, composants en `PascalCase`, fonctions en `camelCase`. Tables et colonnes SQL en `snake_case` (Drizzle convertit : `scanSessions.eventId` dans le code). URLs d'API en `kebab-case` au pluriel. JSON en `camelCase`, dates en ISO 8601. **Code, tables et URLs en anglais ; textes affichés et messages d'erreur en français.**

### Base de données

- `src/db/schema.ts` est **sensible** : on ne le modifie qu'après accord du project lead, dans une PR dédiée avec la migration générée (`pnpm db:generate`). **Jamais** d'édition d'une migration déjà mergée.
- Le scan en doublon se détecte avec `INSERT … ON CONFLICT DO NOTHING RETURNING` (contrainte unique `(session_id, participant_id)`), pas avec « select puis insert ».
- Règles que la base ne garantit pas (participant et session du même événement, session active) : à vérifier dans le service — voir `docs/DATABASE.md`.

### Front

Les pages (`page.tsx`) ne contiennent qu'un import vers la vue de la feature : **on ne les modifie pas**, on travaille dans `features/<f>/components/`. Les formulaires utilisent le **même schéma Zod** que l'API. Le temps réel se fait par **polling** (pas de WebSocket). Détails : `docs/ARCHITECTURE.md` §7.

## 6. Règles à respecter (humains et Claude Code)

1. **Une tâche = une branche = une petite PR** (voir `CONTRIBUTING.md`). Ne touchez qu'aux fichiers de votre feature.
2. **Ne modifiez pas** les fichiers partagés (`src/lib/*`, `src/db/schema.ts`, `src/proxy.ts`, `docs/API.md`, `package.json`) sans en avoir parlé : c'est la première cause de conflits.
3. **Ne changez jamais le contrat d'API** sans mettre à jour `docs/API.md` et les schémas Zod dans la même PR, après accord.
4. **Pas de logique métier hors `service.ts`.** Pas de requête DB hors `queries.ts`.
5. **Pas d'écriture sur le disque** (Vercel) : fichiers via `getStorage()` (`lib/storage`).
6. **Jamais de secret dans le code ni dans Git** : `.env.local` n'est pas commité ; toute nouvelle variable va dans `.env.example` ET dans `lib/env.ts`.
7. **Pas de sur-ingénierie** : la solution la plus simple qui marche. Pas de nouvelle dépendance ni de nouvelle abstraction sans accord. Pas de WebSocket.
8. **Avant de pousser** : `pnpm lint && pnpm typecheck && pnpm build` doivent passer.
9. **Sécurité** : toute route vérifie le rôle côté serveur (`defineRoute`) ; ne jamais faire confiance à l'UI. Ne jamais exposer `qrToken` aux agents ni dans une URL publique. Ne pas logger de mots de passe ni de tokens.
10. **Commits** : Conventional Commits (`feat(scan): …`), voir `CONTRIBUTING.md`.

### Pour Claude Code

- Lisez ce guide, puis `docs/ARCHITECTURE.md` et le passage de `docs/API.md` qui concerne votre tâche **avant** de coder.
- Restez dans le périmètre demandé : si la tâche exige de modifier un fichier partagé ou le schéma, **arrêtez-vous et demandez** plutôt que de le faire.
- Cherchez votre travail avec `grep -rn "TODO(<feature>)" src`.
- Après modification : lancez lint, typecheck et build, et dites ce qui n'a pas pu être vérifié (par exemple : pas de base de données locale).
- Ne marquez pas une tâche « terminée » si le comportement n'a été testé ni à la main ni par un test.

## 7. Comptes et données de développement

`pnpm db:seed` crée : `admin` (admin) et `agent` (agent), 2 événements, 30 participants, 3 sessions et 21 scans. Mots de passe par défaut (dev uniquement) : voir `.env.example` (`SEED_ADMIN_PASSWORD`, `SEED_AGENT_PASSWORD`). À la fin, la commande affiche un token scanné et un token non scanné pour tester le scan.

Tester l'API avec `curl` : se connecter pour obtenir le cookie, puis le réutiliser.

```bash
curl -c jar.txt -H "content-type: application/json" \
  -d '{"username":"admin","password":"<mot de passe du seed>"}' http://localhost:3000/api/auth/login
curl -b jar.txt http://localhost:3000/api/events
```
