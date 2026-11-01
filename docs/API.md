# Contrat d'API

Référence unique pour le front et le back. Les conventions générales (enveloppe, erreurs, pagination, rôles) sont dans [ARCHITECTURE.md](ARCHITECTURE.md) §3 ; le détail exact des champs est dans les **schémas Zod** (`src/features/<feature>/schemas.ts`), qui font foi. Ce document donne la vue d'ensemble.

## Comment utiliser les stubs

Tous les endpoints existent déjà et **répondent avec des données factices correctement typées** (sauf `/api/auth/*` et `/api/health`, qui sont réels). Il faut être **connecté** : dans le navigateur, via la page `/login` ; avec `curl`, `curl -c jar.txt -H 'content-type: application/json' -d '{"username":"admin","password":"…"}' …/api/auth/login` puis `-b jar.txt` sur les appels suivants. Le front peut donc démarrer tout de suite. Chaque stub porte un `// TODO(<feature>): implémenter` à l'endroit où brancher le vrai service.

| Pour tester…                           | Faire                                                                          |
| -------------------------------------- | ------------------------------------------------------------------------------ |
| Un autre rôle                          | Se connecter avec l'autre compte du seed (`admin` ou `agent`)                  |
| Un utilisateur non connecté (401)      | Appeler sans cookie de session (ou après déconnexion)                          |
| Un 404 sur `/…/:id`                    | Utiliser l'id `00000000-0000-4000-8000-000000000404`                           |
| Un 400 de validation                   | Envoyer une entrée invalide : `details.fieldErrors` indique les champs fautifs |
| Un 401 au login                        | Un mauvais mot de passe (l'authentification est réelle depuis l'étape 5)       |
| Un scan « déjà scanné » / « invalide » | Token `already-scanned` / token commençant par `invalid`                       |

Les stubs ne changent aucun état : un `POST` renvoie un objet fabriqué, un `GET` renvoie toujours les mêmes données. Quand vous implémentez une feature : remplacez le corps du handler par un appel à `service.ts`, supprimez ses imports `mocks` / `lib/mock` et le fichier `features/<feature>/mocks.ts` quand plus rien ne l'utilise.

## Conventions rappelées

- Base : `/api`. JSON en camelCase, dates ISO 8601, ids UUID.
- Succès : `{ "ok": true, "data": … }` (+ `meta` si paginé). Erreur : `{ "ok": false, "error": { "code", "message", "details?" } }`.
- Statuts : `200` lecture / modification, `201` création, `204` suppression ou déconnexion (corps vide), `4xx/5xx` erreur.
- Erreurs communes à **tous** les endpoints protégés : `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `500 INTERNAL_ERROR`. Tous ceux qui ont un corps, une query ou un paramètre `:id` peuvent aussi renvoyer `400 VALIDATION_ERROR`. Les colonnes « Erreurs » ci-dessous ne listent que les cas **spécifiques**.
- Pagination : `?page=1&pageSize=20` (max 100) → `meta { page, pageSize, total, totalPages }`.
- Paramètre de chemin `:id` : toujours l'id de la ressource **dernière nommée** dans l'URL (ex. `/events/:id/participants` → id de l'événement).
- `Rôles` : **A** = admin, **G** = agent (agent de scan). « A, G » = tout utilisateur connecté.
- Les temps réels (stats, scannés/non scannés) se font par **polling** : le front rappelle l'endpoint toutes les quelques secondes.

## Récapitulatif

| Feature       | Méthode & URL                                      | Rôles  | Résumé                                |
| ------------- | -------------------------------------------------- | ------ | ------------------------------------- |
| auth          | `POST /api/auth/login`                             | public | Connexion                             |
| auth          | `POST /api/auth/logout`                            | A, G   | Déconnexion                           |
| auth          | `GET /api/auth/me`                                 | A, G   | Utilisateur connecté                  |
| events        | `GET /api/events`                                  | A, G   | Liste paginée                         |
| events        | `POST /api/events`                                 | A      | Créer                                 |
| events        | `GET /api/events/:id`                              | A, G   | Détail                                |
| events        | `PATCH /api/events/:id`                            | A      | Modifier                              |
| events        | `DELETE /api/events/:id`                           | A      | Supprimer (cascade)                   |
| participants  | `GET /api/events/:id/participants`                 | A      | Liste, recherche, filtres, pagination |
| participants  | `POST /api/events/:id/participants`                | A      | Créer                                 |
| participants  | `GET /api/participants/:id`                        | A      | Détail                                |
| participants  | `PATCH /api/participants/:id`                      | A      | Modifier                              |
| participants  | `DELETE /api/participants/:id`                     | A      | Supprimer                             |
| import-export | `POST /api/events/:id/participants/import`         | A      | Import Excel + rapport                |
| import-export | `GET /api/events/:id/participants/import/template` | A      | Modèle Excel vide                     |
| import-export | `GET /api/events/:id/participants/export`          | A      | Export CSV / Excel                    |
| qr            | `GET /api/participants/:id/qr`                     | A      | Image QR (taille, couleurs)           |
| qr            | `GET /api/events/:id/qr`                           | A      | ZIP de tous les QR                    |
| badges        | `PUT /api/events/:id/badge-background`             | A      | Envoyer le fond de badge              |
| badges        | `DELETE /api/events/:id/badge-background`          | A      | Retirer le fond                       |
| badges        | `GET /api/participants/:id/badge`                  | A      | Badge PDF unitaire                    |
| badges        | `POST /api/events/:id/badges`                      | A      | PDF de badges en lot                  |
| scan-sessions | `GET /api/events/:id/scan-sessions`                | A, G   | Liste des sessions + avancement       |
| scan-sessions | `POST /api/events/:id/scan-sessions`               | A      | Créer                                 |
| scan-sessions | `GET /api/scan-sessions/:id`                       | A, G   | Détail                                |
| scan-sessions | `PATCH /api/scan-sessions/:id`                     | A      | Modifier / fermer                     |
| scan-sessions | `DELETE /api/scan-sessions/:id`                    | A      | Supprimer (cascade)                   |
| scan          | `POST /api/scan-sessions/:id/scans`                | A, G   | Valider un token                      |
| scan          | `GET /api/scan-sessions/:id/scans`                 | A, G   | Historique de la session              |
| scan          | `GET /api/scan-sessions/:id/participants`          | A, G   | Scannés / non scannés                 |
| dashboard     | `GET /api/events/:id/stats`                        | A      | Stats d'un événement                  |
| dashboard     | `GET /api/stats/overview`                          | A      | Vue d'ensemble                        |
| users         | `GET /api/users`                                   | A      | Liste paginée                         |
| users         | `POST /api/users`                                  | A      | Créer un compte                       |
| users         | `GET /api/users/:id`                               | A      | Détail                                |
| users         | `PATCH /api/users/:id`                             | A      | Modifier                              |
| users         | `DELETE /api/users/:id`                            | A      | Supprimer                             |
| (technique)   | `GET /api/health`                                  | public | Sonde de santé                        |

---

## Authentification

Schémas : `features/users/schemas.ts`. Session par cookie `HttpOnly` posé par `/login`. Better Auth est utilisé **en interne** (`src/lib/auth/auth.ts`) et n'est pas exposé en HTTP : **le front n'appelle que les routes ci-dessous**.

### `POST /api/auth/login` — public

- **Entrée (JSON)** : `{ username, password }` (`loginSchema`)
- **Sortie 200** : `{ user: { id, name, username, role } }` (`SessionUserDto`) + cookie de session
- **Erreurs** : `401 UNAUTHENTICATED` (identifiant ou mot de passe incorrect — message volontairement unique)

### `POST /api/auth/logout` — A, G

- **Sortie** : `204`

### `GET /api/auth/me` — A, G

- **Sortie 200** : `SessionUserDto`. Sert au front pour connaître le rôle (menu, redirections).

---

## Événements

Schémas : `features/events/schemas.ts`.

### `GET /api/events` — A, G

- **Query** : `page`, `pageSize`, `q` (nom), `sort` = `startsAt` | `name` | `createdAt` (défaut `startsAt`), `order` = `asc` | `desc` (défaut `desc`)
- **Sortie 200** : `EventListItemDto[]` + `meta` — l'événement + `participantsCount`, `sessionsCount`

### `POST /api/events` — A

- **Entrée** : `{ name, description?, location?, startsAt }` (`createEventSchema`)
- **Sortie 201** : `EventDto` `{ id, name, description, location, startsAt, badgeBackgroundUrl, createdAt, updatedAt }`

### `GET /api/events/:id` — A, G

- **Sortie 200** : `EventDto` · **Erreurs** : `404`

### `PATCH /api/events/:id` — A

- **Entrée** : n'importe quel sous-ensemble de la création, au moins un champ (`updateEventSchema`)
- **Sortie 200** : `EventDto` · **Erreurs** : `404`

### `DELETE /api/events/:id` — A

- Supprime aussi participants, sessions de scan et scans. **Sortie** : `204` · **Erreurs** : `404`

---

## Participants

Schémas : `features/participants/schemas.ts`. Le `qrToken` n'est visible que par les admins.

### `GET /api/events/:id/participants` — A

- **Query** : `page`, `pageSize`, `q` (prénom, nom, email, organisation), `organization`, `sort` = `lastName` | `firstName` | `createdAt` (défaut `lastName`), `order` (défaut `asc`)
- **Sortie 200** : `ParticipantDto[]` + `meta` · **Erreurs** : `404` (événement)

### `POST /api/events/:id/participants` — A

- **Entrée** : `{ firstName, lastName, email, phone?, organization?, jobTitle? }` (`createParticipantSchema`). L'email est normalisé en minuscules. Le `qrToken` est généré par le serveur.
- **Sortie 201** : `ParticipantDto`
- **Erreurs** : `404` (événement), `409 CONFLICT` (email déjà inscrit à cet événement)

### `GET /api/participants/:id` — A

- **Sortie 200** : `ParticipantDto` · **Erreurs** : `404`

### `PATCH /api/participants/:id` — A

- **Entrée** : sous-ensemble de la création, au moins un champ
- **Sortie 200** : `ParticipantDto` · **Erreurs** : `404`, `409` (nouvel email déjà pris)

### `DELETE /api/participants/:id` — A

- Supprime aussi ses scans. **Sortie** : `204` · **Erreurs** : `404`

---

## Import / export

Schémas : `features/import-export/schemas.ts` (contient `IMPORT_COLUMNS`, la définition des colonnes).

**Format du fichier** : `.xlsx`, première feuille, 1re ligne = en-têtes : `Prénom` · `Nom` · `Email` · `Téléphone` · `Organisation` · `Fonction` (les trois premières sont obligatoires). Max 5 Mo et 2 000 lignes.

### `POST /api/events/:id/participants/import` — A

- **Entrée** : `multipart/form-data`, champ `file` (.xlsx). Query optionnelle `?dryRun=true` : analyse **sans rien enregistrer** (aperçu avant import).
- **Sortie 200** : rapport `ImportReportDto`
  ```json
  {
    "dryRun": false,
    "totalRows": 6,
    "validRows": 3,
    "duplicates": [{ "row": 5, "email": "a@b.com", "reason": "already_registered" }],
    "errors": [{ "row": 4, "field": "email", "message": "Adresse email invalide" }]
  }
  ```
  `reason` = `in_file` (déjà plus haut dans le fichier) ou `already_registered` (déjà inscrit à l'événement). Les numéros de ligne sont ceux d'Excel (ligne 1 = en-têtes).
- Les lignes valides sont **importées même si d'autres sont en erreur** ; doublons et erreurs ne font pas échouer la requête.
- **Erreurs** : `400` (fichier absent, mauvais type, trop gros, en-têtes obligatoires manquants, plus de 2 000 lignes), `404`

### `GET /api/events/:id/participants/import/template` — A

- **Sortie** : fichier `.xlsx` vide avec les en-têtes. **Erreurs** : `404`

### `GET /api/events/:id/participants/export` — A

- **Query** : `format` = `csv` (défaut) | `xlsx`
- **Sortie** : fichier `participants.csv` (UTF-8 avec BOM, séparateur `;`) ou `participants.xlsx`, mêmes colonnes que l'import. **Erreurs** : `404`

---

## QR codes

Schémas : `features/qr/schemas.ts`. Le QR encode le `qrToken` du participant.

**Options (query)**, communes aux deux endpoints : `size` 64–1024 px (défaut 256) · `color` hex **sans #** (défaut `000000`) · `background` (défaut `ffffff`) · `margin` 0–8 modules (défaut 2) · `format` = `png` | `svg` · `download=true` pour forcer le téléchargement.

### `GET /api/participants/:id/qr` — A

- **Sortie** : image `image/png` ou `image/svg+xml`. **Erreurs** : `404`
- Exemple : `/api/participants/<id>/qr?size=512&color=1a2b3c&format=png&download=true`

### `GET /api/events/:id/qr` — A

- **Sortie** : `application/zip`, un fichier par participant. **Erreurs** : `404`

---

## Badges

Schémas : `features/badges/schemas.ts`.

### `PUT /api/events/:id/badge-background` — A

- **Entrée** : `multipart/form-data`, champ `file` — PNG, JPEG ou WebP, 5 Mo max
- **Sortie 200** : `{ badgeBackgroundUrl }` (aussi visible dans `EventDto`) · **Erreurs** : `400`, `404`

### `DELETE /api/events/:id/badge-background` — A

- Retour au badge par défaut. **Sortie** : `204` · **Erreurs** : `404`

### `GET /api/participants/:id/badge` — A

- **Query** : `download=true` pour télécharger au lieu d'afficher
- **Sortie** : `application/pdf` (un badge). **Erreurs** : `404`

### `POST /api/events/:id/badges` — A

- **Entrée (JSON)** : `{ participantIds?: uuid[] }` — tous les participants si omis ; 500 max par appel (au-delà, le front découpe en plusieurs appels)
- **Sortie** : `application/pdf`, une page par participant. **Erreurs** : `404`

---

## Sessions de scan

Schémas : `features/scan-sessions/schemas.ts`. `type` = `entrance` | `meal` | `workshop` | `vip` | `other`.

### `GET /api/events/:id/scan-sessions` — A, G

- **Sortie 200** : `ScanSessionListItemDto[]` (liste complète, **non paginée**) : session + `scannedCount` + `registeredCount`. **Erreurs** : `404` (événement)

### `POST /api/events/:id/scan-sessions` — A

- **Entrée** : `{ name, type? }` (défaut `other`)
- **Sortie 201** : `ScanSessionDto` `{ id, eventId, name, type, isActive, createdAt, updatedAt }`
- **Erreurs** : `404` (événement), `409` (nom déjà utilisé dans cet événement)

### `GET /api/scan-sessions/:id` — A, G

- **Sortie 200** : `ScanSessionDto` · **Erreurs** : `404`

### `PATCH /api/scan-sessions/:id` — A

- **Entrée** : `{ name?, type?, isActive? }`, au moins un champ. `isActive: false` ferme la session (plus de scans, historique conservé).
- **Sortie 200** : `ScanSessionDto` · **Erreurs** : `404`, `409`

### `DELETE /api/scan-sessions/:id` — A

- Supprime aussi son historique. **Sortie** : `204` · **Erreurs** : `404`

---

## Scan

Schémas : `features/scan/schemas.ts`. Flux détaillé : diagramme de séquence de [DATABASE.md](DATABASE.md).

### `POST /api/scan-sessions/:id/scans` — A, G

- **Entrée (JSON)** : `{ token }` — le texte lu dans le QR code
- **Sortie 200** : `ScanResultDto`, **toujours 200**, à discriminer sur `status` :

  | `status`          | Contenu                                                         | Affichage suggéré |
  | ----------------- | --------------------------------------------------------------- | ----------------- |
  | `valid`           | `participant`, `scan { id, scannedAt, scannedBy }`              | Vert              |
  | `already_scanned` | `participant`, `scan` = le scan **d'origine** (heure, agent)    | Orange            |
  | `invalid`         | `reason` = `unknown_token` \| `wrong_event` \| `session_closed` | Rouge             |

  ```json
  { "ok": true, "data": { "status": "already_scanned", "participant": { … },
      "scan": { "id": "…", "scannedAt": "2026-11-22T09:12:00.000Z", "scannedBy": { "id": "…", "name": "Agent de scan" } } } }
  ```

- **Erreurs** : `400` (token vide), `404` (session inconnue). Un token inconnu n'est **pas** une erreur : c'est `status: "invalid"`.

### `GET /api/scan-sessions/:id/scans` — A, G

- Historique de la session, du plus récent au plus ancien.
- **Query** : `page`, `pageSize`, `q` (nom/email du participant), `scannedBy` (id d'un agent), `order`
- **Sortie 200** : `ScanHistoryItemDto[]` `{ id, scannedAt, participant, scannedBy }` + `meta` · **Erreurs** : `404`

### `GET /api/scan-sessions/:id/participants` — A, G

- Tous les participants de l'événement avec leur état **dans cette session** (suivi scannés / non scannés).
- **Query** : `status` = `all` (défaut) | `scanned` | `not_scanned`, `q`, `page`, `pageSize`
- **Sortie 200** : `SessionParticipantDto[]` `{ participant, scanned, scannedAt, scannedBy }` + `meta` · **Erreurs** : `404`

---

## Statistiques

Schémas : `features/dashboard/schemas.ts`. Tous les `rate` sont entre **0 et 1** (0,6 = 60 %), à 0 si aucun inscrit.

### `GET /api/events/:id/stats` — A

- **Sortie 200** : `EventStatsDto`
  ```json
  {
    "eventId": "…",
    "eventName": "…",
    "registered": 20,
    "scanned": 12,
    "rate": 0.6,
    "sessions": [
      {
        "sessionId": "…",
        "name": "Entrée principale",
        "type": "entrance",
        "registered": 20,
        "scanned": 12,
        "rate": 0.6
      }
    ]
  }
  ```
  `scanned` au niveau événement = participants scannés dans **au moins une** session. **Erreurs** : `404`

### `GET /api/stats/overview` — A

- **Sortie 200** : `OverviewStatsDto` `{ eventsCount, participantsCount, scansCount, events: [{ eventId, eventName, startsAt, registered, scanned, rate }] }`

---

## Utilisateurs

Schémas : `features/users/schemas.ts`. Tous les endpoints : **admin uniquement**. Le mot de passe n'est jamais renvoyé.

### `GET /api/users` — A

- **Query** : `page`, `pageSize`, `q` (nom, identifiant), `role` = `admin` | `agent`
- **Sortie 200** : `UserDto[]` `{ id, name, username, email, role, createdAt }` + `meta`

### `POST /api/users` — A

- **Entrée** : `{ name, username, password, role, email? }` — `username` : 3–32 caractères (lettres, chiffres, `. _ -`), stocké en minuscules ; `password` : 8–128 caractères ; `email` généré (`<username>@club.local`) si absent
- **Sortie 201** : `UserDto` · **Erreurs** : `409` (identifiant ou email déjà utilisé)

### `GET /api/users/:id` — A

- **Sortie 200** : `UserDto` · **Erreurs** : `404`

### `PATCH /api/users/:id` — A

- **Entrée** : `{ name?, role?, password? }`, au moins un champ (`password` = réinitialisation)
- **Sortie 200** : `UserDto` · **Erreurs** : `404`, `409` (un admin ne peut pas retirer son propre rôle admin)

### `DELETE /api/users/:id` — A

- Les scans passés de ce compte sont conservés (agent « inconnu »). **Sortie** : `204`
- **Erreurs** : `404`, `409` (on ne peut pas supprimer son propre compte)

---

## Technique

### `GET /api/health` — public

- **Sortie 200** : `{ "status": "ok" }`

## Ce que le contrat ne couvre pas (volontairement)

- **Pas de création de compte publique** : seuls les admins créent des comptes.
- **Pas de limitation de débit** (rate limiting) ni de journal d'audit : hors périmètre des 3 semaines.
- **Pas d'enregistrement des tentatives de scan en doublon ni des tokens invalides** (voir [DATABASE.md](DATABASE.md)).
