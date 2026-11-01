# Architecture et conventions

Ce document fixe les décisions techniques **une fois pour toutes**. En cas de doute, on suit ce document ; pour le changer, on en discute avec le project lead (pas de décision locale dans une PR).

## 1. Principe : une feature = un dossier

Chaque membre travaille dans le dossier de sa feature pour limiter les conflits Git.

```
src/
├── app/                    # Routes Next.js (pages + route handlers). FINES.
│   ├── api/<ressource>/…   # Route handlers : parse → service → réponse
│   └── (pages)…            # Pages : assemblent des composants de features
├── features/<feature>/
│   ├── components/         # Composants React propres à la feature
│   ├── schemas.ts          # Schémas Zod (entrées/sorties) + types inférés
│   ├── queries.ts          # Accès DB (Drizzle) — seul fichier qui importe la DB
│   └── service.ts          # Logique métier
├── db/                     # schema.ts, client.ts, migrations/, seed.ts
├── lib/                    # Code transverse (voir §4)
└── components/             # Composants partagés (ui shadcn, layout) — étape 5
```

Features : `events`, `participants`, `import-export`, `qr`, `badges`, `scan-sessions`, `scan`, `dashboard`, `users`.

### Qui peut importer quoi

| Depuis                  | Peut importer                                                      |
| ----------------------- | ------------------------------------------------------------------ |
| `app/api/**/route.ts`   | `lib/*`, `features/*/schemas.ts`, `features/*/service.ts`          |
| `app/**/page.tsx`       | `features/*/components`, `features/*/schemas.ts`, `components/*`   |
| `features/X/service.ts` | `features/X/queries.ts`, `lib/*`, `service.ts` d'une AUTRE feature |
| `features/X/queries.ts` | `db/*`, `lib/*`                                                    |
| `features/X/components` | `features/X/schemas.ts`, `components/*`, `lib/*`                   |

Règles clés :

- **Une feature n'importe jamais les `queries.ts` ni les `components/` d'une autre feature.** Si `scan` a besoin de données de `participants`, il appelle `participants/service.ts`.
- `@/db/client` n'est importé que par `queries.ts` (et `src/db`, `src/lib/auth`). **ESLint bloque** les autres cas.
- `service.ts` n'importe pas `next/*` (ESLint le bloque aussi) : il reçoit des données déjà validées et renvoie des données ou lance une `AppError`.
- Pas de fichier `index.ts` « barrel » : on importe depuis le fichier exact (évite les conflits Git et les cycles).

## 2. Où va la logique métier ?

```
Requête HTTP
   │
   ▼
route.ts            Valide (Zod), vérifie le rôle, appelle UN service, formate la réponse.   Aucune règle métier.
   │
   ▼
service.ts          Règles métier : unicité, détection de doublon, calculs, enchaînements.   Lance des AppError.
   │
   ▼
queries.ts          Requêtes Drizzle simples (select / insert / update / delete).            Aucune règle métier.
   │
   ▼
PostgreSQL
```

Exemple : la détection de scan en doublon vit dans `scan/service.ts` (qui décide du résultat « déjà scanné »), pas dans la route ni dans les queries. Les contraintes uniques de la DB sont le dernier filet de sécurité.

**Pas de Server Actions** : toutes les mutations passent par les route handlers `/api/*`. Une seule voie d'entrée = un seul contrat (`docs/API.md`), et le front consomme l'API de la même façon partout.

## 3. Contrat d'API

### 3.1 Enveloppe de réponse

Toutes les réponses JSON ont la même forme (`src/lib/api/response.ts`) :

```jsonc
// Succès
{ "ok": true, "data": { … } }

// Succès paginé
{ "ok": true, "data": [ … ], "meta": { "page": 1, "pageSize": 20, "total": 134, "totalPages": 7 } }

// Erreur
{ "ok": false, "error": { "code": "VALIDATION_ERROR", "message": "Données invalides", "details": { … } } }
```

- `204 No Content` (corps vide) pour une suppression réussie.
- `201` pour une création.
- Le front se base sur `ok` et `error.code`, **jamais sur le texte de `message`** (lisible, en français, affichable tel quel).
- Les téléchargements binaires (PNG, PDF, ZIP, CSV, XLSX) renvoient le fichier brut avec le bon `Content-Type` ; seules leurs erreurs utilisent l'enveloppe.

### 3.2 Codes d'erreur

| Code               | HTTP | Quand                                                          |
| ------------------ | ---- | -------------------------------------------------------------- |
| `VALIDATION_ERROR` | 400  | Entrée invalide. `details` = `{ formErrors, fieldErrors }` Zod |
| `UNAUTHENTICATED`  | 401  | Pas de session                                                 |
| `FORBIDDEN`        | 403  | Rôle insuffisant                                               |
| `NOT_FOUND`        | 404  | Ressource inexistante                                          |
| `CONFLICT`         | 409  | Violation d'unicité (ex. email déjà inscrit à l'événement)     |
| `INTERNAL_ERROR`   | 500  | Bug inattendu (détail uniquement dans les logs serveur)        |

Dans un service : `throw new NotFoundError("Événement introuvable")`. Les classes sont dans `src/lib/errors.ts`. Ne jamais renvoyer `new Response(...)` à la main pour une erreur.

**Un résultat métier n'est pas une erreur.** Scanner un QR « déjà scanné » ou « invalide » répond `200` avec `{ ok: true, data: { status: "already_scanned", … } }`. Les codes d'erreur ne servent qu'aux problèmes de requête, d'accès ou de serveur.

### 3.3 Déclarer un endpoint

```ts
// src/app/api/events/[id]/route.ts
import { defineRoute } from "@/lib/api/define-route";
import { parseParams } from "@/lib/api/parse";
import { ok } from "@/lib/api/response";
import { eventIdParamsSchema } from "@/features/events/schemas";
import { getEvent } from "@/features/events/service";

export const GET = defineRoute<{ id: string }>(["admin", "agent"], async ({ params }) => {
  const { id } = parseParams(params, eventIdParamsSchema);
  return ok(await getEvent(id));
});
```

- `defineRoute(roles, handler)` : authentifie (sinon 401), **vérifie le rôle** (sinon 403), convertit toute `AppError` en réponse d'erreur, et masque les erreurs inattendues en 500.
- Les rôles sont **toujours explicites** : `["admin"]`, ou `["admin", "agent"]` pour « tout utilisateur connecté ».
- `definePublicRoute(handler)` pour les rares endpoints sans authentification (health, login).
- Helpers de validation : `parseBody`, `parseQuery`, `parseParams` (`src/lib/api/parse.ts`) → lancent `VALIDATION_ERROR` avec le détail par champ.
- Il n'y a **pas** de `export async function GET` brut dans les routes.

### 3.4 Vérification des rôles

| Rôle    | Droits                                                                                                    |
| ------- | --------------------------------------------------------------------------------------------------------- |
| `admin` | Tout                                                                                                      |
| `agent` | Lecture des événements/sessions, scan, historique et listes scannés/non scannés. Aucune écriture ailleurs |

- Contrôle **côté serveur** à chaque endpoint (`defineRoute`). Masquer un bouton dans l'UI ne protège rien.
- Le middleware (étape 5) protège en plus les **pages** par rôle.
- Un agent peut scanner sur **tous** les événements (pas d'affectation).
- `src/lib/permissions.ts` : `ROLES`, `assertRole`. Pour une règle fine (« l'agent ne voit que X »), ajouter la vérification dans le service avec `user.role`.

### 3.5 Pagination, tri, recherche

- Query string : `?page=1&pageSize=20` (défaut 1 et 20, max 100). Schéma : `paginationQuerySchema` (`src/lib/pagination.ts`), à étendre avec `.extend({ q, filtres… })`.
- Recherche texte : `?q=dupont`. Filtres : un paramètre par filtre (`?sessionId=…&status=scanned`).
- Tri : `?sort=createdAt&order=desc` quand une liste en a besoin (valeurs en liste blanche Zod).
- Une query paginée renvoie `{ items, total }` ; le service construit `meta` avec `buildMeta`, la route répond `paginated(items, meta)`.

### 3.6 Formats de données

- JSON en **camelCase**. Dates en **ISO 8601 UTC** (`"2026-11-05T18:30:00.000Z"`) ; le front formate pour l'affichage.
- Identifiants et noms de champs : voir `docs/DATABASE.md` (étape 3).

## 4. `src/lib` — transverse

| Fichier / dossier      | Rôle                                                              |
| ---------------------- | ----------------------------------------------------------------- |
| `env.ts`               | Variables d'environnement validées par Zod (`import { env }`)     |
| `errors.ts`            | `AppError` et sous-classes, codes d'erreur                        |
| `permissions.ts`       | `ROLES`, `Role`, `assertRole`                                     |
| `pagination.ts`        | Schéma de pagination, `buildMeta`, `toLimitOffset`                |
| `api/response.ts`      | `ok`, `created`, `paginated`, `noContent`, types `ApiResponse<T>` |
| `api/parse.ts`         | `parseBody`, `parseQuery`, `parseParams`                          |
| `api/define-route.ts`  | `defineRoute`, `definePublicRoute`                                |
| `auth/session.ts`      | `getCurrentUser()` — **mock en attendant l'étape 5**              |
| `storage/` _(étape 5)_ | Abstraction de stockage de fichiers (Vercel Blob)                 |

**Mock d'authentification (jusqu'à l'étape 5)** : en dev, `getCurrentUser()` renvoie un admin. L'en-tête `x-mock-role: agent` simule un agent, `x-mock-role: anonymous` simule une requête non connectée. Cela permet de tester 401/403 sur les stubs.

## 5. Nommage

| Élément                         | Convention                                         | Exemple                                 |
| ------------------------------- | -------------------------------------------------- | --------------------------------------- |
| Fichiers et dossiers            | `kebab-case`                                       | `scan-sessions`, `event-form.tsx`       |
| Composants React                | `PascalCase` (export nommé)                        | `EventForm`                             |
| Fonctions, variables            | `camelCase`                                        | `createParticipant`                     |
| Types, schémas Zod              | Type `PascalCase`, schéma `camelCase` + `Schema`   | `CreateEventInput`, `createEventSchema` |
| Tables SQL / colonnes           | `snake_case` pluriel / `snake_case` (auto Drizzle) | `scan_sessions.event_id`                |
| Tables / champs dans le code TS | `camelCase` (Drizzle convertit via `casing`)       | `scanSessions.eventId`                  |
| URLs d'API                      | `kebab-case`, ressources au pluriel                | `/api/scan-sessions/:id/scans`          |
| Schémas d'entrée / sortie       | `<verbe><Ressource>Schema` / `<ressource>Schema`   | `createEventSchema`, `eventSchema`      |

Langue : **code, tables et URLs en anglais ; textes affichés à l'utilisateur et messages d'erreur en français.** Pas d'i18n.

## 6. Autres décisions

- **Temps réel** : polling (TanStack Query `refetchInterval`), pas de WebSocket.
- **Validation** : Zod partout. Les types TypeScript d'entrée/sortie sont **inférés** des schémas (`z.infer`), jamais écrits à la main en double.
- **Fichiers** : jamais d'écriture sur le disque local (Vercel). Passer par `lib/storage`.
- **Commentaires de travail** : `// TODO(<feature>): …` pour ce qui reste à faire, traçable par `grep`.
- **Migrations** : générées par `pnpm db:generate` et committées. Ne jamais modifier une migration déjà mergée ; en créer une nouvelle. Le schéma (`src/db/schema.ts`) est un fichier sensible : toute modification passe par le project lead.
