# Plan de travail

Plan détaillé des tâches, dans l'ordre. Pour chaque tâche, les endpoints sont dans [API.md](API.md) et les schémas dans `src/features/<x>/schemas.ts` : **le travail consiste à remplacer le stub par la vraie logique, sans changer l'URL, les rôles ni la forme des données.** Les conventions sont dans [`Guide.md`](../Guide.md) et le plan du site dans [ARCHITECTURE.md](ARCHITECTURE.md) §7.

Règle commune aux tâches **backend** : la requête SQL va dans `queries.ts`, la règle métier dans `service.ts`, la route appelle le service ; en fin de tâche, supprimer le mock et le `// TODO(<feature>)`.
Règle commune aux tâches **front** : le contenu vit dans `features/<x>/components/` (jamais dans `page.tsx`), avec les briques partagées de la tâche T1.

## Outils à installer (chaque membre)

Git, Node.js ≥ 20.9 (LTS 22 ou 24), pnpm (`npm install -g pnpm`), PostgreSQL ≥ 14 **ou** Docker Desktop (sinon une base gratuite par personne chez Neon / Supabase), VS Code (ESLint, Prettier, Tailwind CSS IntelliSense), Claude Code, compte GitHub. Optionnel : Bruno ou Postman, un smartphone, `cloudflared` ou `ngrok` pour tester le scan en HTTPS. Voir le [README](../README.md). **Chacun a sa propre base de données** : le seed efface les données.

## Calendrier

| Vague | Quand              | Contenu                                                         |
| ----- | ------------------ | --------------------------------------------------------------- |
| 0     | avant de commencer | accès GitHub, répartition, séance d'installation (project lead) |
| 1     | semaine 1          | T1 à T7, toutes indépendantes                                   |
| 2     | semaine 2          | T8 à T13 et pages F1 à F7                                       |
| 3     | semaine 3          | Q1 à Q4 : intégration, qualité, déploiement, nettoyage          |

## Vague 0 : avant de commencer (project lead)

- **L1** Configuration GitHub : ajouter les membres (idéalement via une équipe), n'autoriser que le « squash merge », activer la suppression automatique des branches. _(La protection de `main` n'existe pas sur un dépôt privé en plan gratuit : règle de discipline, jamais de push direct sur `main`.)_
- **L2** Répartir les tâches et désigner un relecteur par PR.
- **L3** Séance de lancement (45 min) : tout le monde fait tourner `pnpm dev` avec sa base.

## Vague 1 : à lancer en premier (semaine 1)

### T1 — Fondation du front _(front, bloque toutes les pages)_

À faire en **deux PR** pour ne bloquer personne. Terminer en 2 à 3 jours.

**PR 1 (jour 1) : installation et briques partagées**

```bash
pnpm add @tanstack/react-query react-hook-form @hookform/resolvers
pnpm dlx shadcn@latest init        # choix neutres par défaut
pnpm dlx shadcn@latest add button input label card table skeleton sidebar separator sonner badge alert
```

Points d'attention connus :

- La CLI shadcn peut ne pas écrire le thème dans `src/app/globals.css` : vérifier que les variables (`--background`, `--sidebar`…) et les imports `tw-animate-css` et `shadcn/tailwind.css` y sont.
- Elle peut ajouter un paquet parasite **`cn`** : le supprimer (`pnpm remove cn`). Il faut `clsx` et `tailwind-merge`.
- Ce style de shadcn utilise Base UI : on écrit `render={<Link … />}`, **pas** `asChild`.
- Le hook généré `src/hooks/use-mobile.ts` déclenche une erreur ESLint (`setState` dans un effet) : le réécrire avec `useSyncExternalStore`.

Fichiers à remplir (ils existent, vides, avec un commentaire) :

| Fichier                                 | Contenu                                                                                                                                                                                                                                                                                                                                                            |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/lib/api-client.ts`                 | Classe `ApiError(code, message, status, details)` avec getter `fieldErrors`. Objet `api` : `get`, `getPage` (renvoie `{ items, meta }`), `post`, `patch`, `put`, `delete`, `upload` (multipart). Lit l'enveloppe `{ ok, data, meta }` / `{ ok: false, error }`, gère le `204`, signale `NETWORK_ERROR` si le serveur est injoignable, ignore les paramètres vides. |
| `src/components/providers.tsx`          | Composant client : `QueryClientProvider` (données gardées 10 s, pas de nouvel essai sur une erreur 4xx), `TooltipProvider`, `Toaster`. À brancher dans `src/app/layout.tsx`.                                                                                                                                                                                       |
| `src/components/common/state-views.tsx` | `LoadingState({ lines })`, `ErrorState({ error, onRetry })` avec bouton « Réessayer », `EmptyState({ title, description, action })`.                                                                                                                                                                                                                               |
| `src/components/common/page-header.tsx` | `PageHeader({ title, description, actions })`.                                                                                                                                                                                                                                                                                                                     |
| `src/components/common/data-table.tsx`  | `DataTable<Row>` : `columns` (clé, titre, rendu de cellule), `rows`, `getRowId`, `meta`, `onPageChange`, `isLoading`, `error`, `onRetry`, textes de l'état vide. Affiche chargement, erreur, vide, puis le tableau avec « Page X sur Y · N résultats » et boutons Précédent / Suivant.                                                                             |
| `src/components/form/form.tsx`          | `useZodForm(schema, options)` et `<Form form onSubmit submitLabel>`. Une `ApiError` de validation affiche les messages **sous les bons champs** ; toute autre erreur apparaît dans un bandeau. Bouton désactivé pendant l'envoi.                                                                                                                                   |
| `src/components/form/text-field.tsx`    | `TextField({ form, name, label, ...props })` : label, input, message d'erreur Zod, `aria-invalid` et `aria-describedby`.                                                                                                                                                                                                                                           |

**PR 2 (jours 2-3) : menu latéral, layout, login**

`src/components/layout/app-sidebar.tsx` (composant client, prop `user: SessionUser`). Entrées, avec libellés en français et icônes `lucide-react` ; le rôle autorisé vient de `PAGE_ACCESS` (`src/lib/routes.ts`), on ne le recopie pas :

| Entrée          | Route        | Icône             | Visible par  |
| --------------- | ------------ | ----------------- | ------------ |
| Tableau de bord | `/dashboard` | `LayoutDashboard` | admin        |
| Événements      | `/events`    | `CalendarDays`    | admin        |
| Scan            | `/scan`      | `ScanLine`        | admin, agent |
| Comptes         | `/users`     | `UserCog`         | admin        |

(Participants, sessions de scan et QR & badges sont des **onglets d'un événement**, pas des entrées du menu. L'agent ne voit que « Scan ».)

Comportement :

- **En-tête** : icône + « Plateforme Événementielle ».
- **Entrée active** : surlignée quand l'URL est la route ou commence par `route/`.
- **Pied du menu** : nom de l'utilisateur, rôle en français (`ROLE_LABELS`), bouton « Se déconnecter » (`POST /api/auth/logout`, puis `router.replace("/login")` et `router.refresh()`).
- **768 px et plus** : menu fixe à gauche. **Sur mobile** : menu caché, barre du haut avec un bouton hamburger (`aria-label="Ouvrir le menu"`) qui ouvre un tiroir, fermé au clic sur une entrée.

`src/app/(app)/layout.tsx` (reste un composant serveur ; **ne pas retirer `requirePageUser()`**) :

```tsx
const user = await requirePageUser();
return (
  <SidebarProvider>
    <AppSidebar user={user} />
    <SidebarInset>
      <header className="md:hidden …">
        <SidebarTrigger aria-label="Ouvrir le menu" /> …
      </header>
      <main className="p-4 md:p-8">{children}</main>
    </SidebarInset>
  </SidebarProvider>
);
```

`features/users/components/login-form.tsx` : carte centrée dans la page, champs « Identifiant » et « Mot de passe » (`autoComplete` corrects), bouton « Se connecter ». Utilise `useZodForm(loginSchema)`, appelle `POST /api/auth/login`, puis redirige vers `?next=` ou `/`. **`next` n'est accepté que s'il commence par `/` et pas par `//`** (sinon redirection vers un autre site possible). Mauvais mot de passe : « Identifiant ou mot de passe incorrect ».

Vues provisoires : dans chaque vue vide (`events-view`, `event-overview-view`, `participants-view`, `sessions-view`, `badges-view`, `scan-view`, `scan-session-view`, `dashboard-view`, `users-view`), remplacer `return null` par un `PageHeader` et un `EmptyState` « Page à implémenter », pour pouvoir naviguer partout dès le jour 3.

**À ne pas faire** : modifier les `page.tsx`, `src/proxy.ts`, `src/lib/auth/*` ou `src/lib/routes.ts` ; ajouter d'autres bibliothèques ; écrire les pages elles-mêmes (F1 à F7).

**Terminé quand** :

1. `pnpm lint`, `pnpm typecheck`, `pnpm build` passent.
2. Après `pnpm db:seed`, on se connecte depuis le navigateur avec l'admin, puis avec l'agent.
3. L'admin voit 4 entrées de menu, l'agent n'en voit qu'une (Scan).
4. Un agent qui tape `/users` ou `/events` dans l'URL est renvoyé vers `/scan`.
5. À 375 px : menu en tiroir, aucun défilement horizontal. À 1280 px : menu fixe.
6. La déconnexion ramène à `/login`, et rouvrir une page protégée redemande la connexion.
7. `DataTable` fonctionne avec `GET /api/events` (le stub suffit), boutons Précédent / Suivant compris.
8. Toute l'interface est en français et utilisable au clavier.

### T2 — CRUD événements _(backend)_ · `features/events/*`, routes `/api/events`

Liste paginée avec recherche (`q`), tri et compteurs `participantsCount` / `sessionsCount` ; créer, lire, modifier (partiel), supprimer. **Terminé quand** : toutes les routes répondent sur de vraies données, 404 si l'id n'existe pas, et la suppression retire participants, sessions et scans (cascade de la base).

### T3 — CRUD participants _(backend)_ · `features/participants/*`

Liste d'un événement avec `q` (prénom, nom, email, organisation), filtre `organization`, tri et pagination ; créer, lire, modifier, supprimer. Email normalisé en minuscules, **`409` si l'email est déjà inscrit à l'événement**. Le token QR est généré par la base. **À exposer dans `service.ts`** pour les autres tâches : `getParticipantById` et `listAllParticipantsOfEvent` (une feature n'importe jamais les `queries.ts` d'une autre). **Terminé quand** : doublon d'email → 409, pagination correcte.

### T4 — CRUD sessions de scan _(backend)_ · `features/scan-sessions/*`

Liste d'un événement avec `scannedCount` et `registeredCount` ; créer (**409** si le nom existe déjà dans l'événement), lire, modifier (dont `isActive` pour fermer), supprimer.

### T5 — Comptes utilisateurs _(backend)_ · `features/users/*`

Liste, créer, lire, modifier, supprimer (admin). Mot de passe haché avec `hashPassword` de `better-auth/crypto` (comme le seed) ; la création insère une ligne dans `users` **et** une dans `accounts` (`providerId: "credential"`). Le mot de passe n'est jamais renvoyé. Un admin ne peut ni supprimer son compte ni retirer son propre rôle admin (409).

### T6 — Prototype de lecture caméra QR _(front)_ · `features/scan/components/`

Un composant qui ouvre la caméra, lit un QR code et affiche le texte décodé ; gérer caméra refusée ou absente. Choisir une petite bibliothèque et **demander accord avant d'ajouter la dépendance**. HTTPS obligatoire en production (`localhost` suffit en développement). **Terminé quand** : scanner un QR affiche son contenu, sur ordinateur et sur téléphone.

### T7 — Fonction `GenereQR(token)` _(backend)_ · `features/qr/service.ts`

Fonction pure (pas de base, pas de Next) : prend le token et les options (taille, couleur, fond, marge, format PNG ou SVG, voir `qrOptionsQuerySchema`) et renvoie l'image. **Terminé quand** : l'image se scanne avec le prototype T6 et toutes les options sont respectées.

## Vague 2 : semaine 2

### Backend

- **T8 API QR** _(après T3, T7)_ : `GET /api/participants/:id/qr` (image) et `GET /api/events/:id/qr` (ZIP, un fichier `<nom>-<prénom>` par participant ; bibliothèque ZIP à valider).
- **T9 Import Excel** _(après T3)_ · `features/import-export/*` : lire un `.xlsx` (ExcelJS), valider chaque ligne avec `createParticipantSchema`, détecter les doublons (dans le fichier et déjà inscrits), insérer les lignes valides sauf si `?dryRun=true`, renvoyer le rapport (`validRows`, `duplicates`, `errors` avec numéros de ligne Excel). Générer aussi le modèle Excel vide.
- **T10 Export CSV / Excel** _(après T3, avec T9)_ : mêmes colonnes que l'import (`IMPORT_COLUMNS`), CSV en UTF-8 avec BOM et séparateur `;`.
- **T11 API de scan** _(après T3, T4)_ — la tâche la plus critique, à confier à la personne la plus solide : `POST /api/scan-sessions/:id/scans` suit le diagramme de [DATABASE.md](DATABASE.md) (session active, token connu, participant du **même événement** que la session, `INSERT … ON CONFLICT DO NOTHING RETURNING`). Résultats `valid`, `already_scanned` (heure et agent d'origine), `invalid` (avec la raison), toujours en 200. Puis `GET …/scans` (historique) et `GET …/participants?status=`. **Terminé quand** : deux scans simultanés du même QR ne donnent qu'un seul « valide ».
- **T12 Badges** _(après T2, T7)_ : fond (`PUT` / `DELETE badge-background` via `getStorage()`), PDF unitaire et en lot (500 max). Bibliothèque PDF à valider. Nécessite le token Vercel Blob.
- **T13 API statistiques** _(après T4)_ : inscrits, scannés (au moins une session), taux entre 0 et 1, détail par session, vue d'ensemble.

### Pages front _(après T1 ; elles utilisent les stubs en attendant le backend)_

- **F1 Événements** : liste (`/events`), création / modification / suppression avec confirmation, et le **cadre à onglets** `event-shell.tsx` + onglet Aperçu (`/events/[id]`) avec les statistiques. **À livrer en premier : les onglets F2, F4, F7 en dépendent.**
- **F2 Onglet Participants** : tableau, recherche, filtres, formulaire, bouton d'export, UI d'import (aperçu en dry-run, puis rapport d'erreurs).
- **F3 Comptes** (`/users`) : liste et ajout.
- **F4 Onglet QR & badges** : téléchargement des QR (options de taille et de couleur), envoi du fond, aperçu, PDF.
- **F5 Scan** : `/scan` (choisir l'événement le plus proche, puis une **session active**) et `/scan/[sessionId]` (onglets Scanner, Historique, Scannés / non scannés, rafraîchis par polling). Résultat vert / orange / rouge ; reprendre T6.
- **F6 Tableau de bord** : cartes et taux par événement et par session, rafraîchis par polling.
- **F7 Onglet Sessions de scan** : créer, renommer, ouvrir / fermer, supprimer ; bouton « Scanner » qui mène à `/scan/[sessionId]`.

## Vague 3 : semaine 3

- **Q1 Test de bout en bout** : créer un événement, importer, générer QR et badges, scanner, voir les stats — avec un compte admin puis un compte agent ; corriger ce qui casse.
- **Q2 Qualité** : responsive à 375 px, messages d'erreur en français, états vides, accessibilité de base. Tests automatiques : décision à prendre (par exemple Vitest).
- **Q3 Déploiement** : projet Vercel, base de production, token Blob, variables d'environnement, migrations, **création du premier admin** (point resté ouvert), test du scan sur un vrai téléphone en HTTPS.
- **Q4 Nettoyage** : supprimer `lib/mock*.ts`, tous les `mocks.ts` et les `TODO` restants ; mettre à jour `docs/API.md` si un contrat a bougé.

## Répartition possible pour 5 personnes

| Personne           | Vague 1 | Vague 2 / 3                                 |
| ------------------ | ------- | ------------------------------------------- |
| A (backend solide) | T4      | **T11**, T13                                |
| B (backend)        | T3      | T9, T10                                     |
| C (backend)        | T7, T2  | T8, T12                                     |
| D (front)          | **T1**  | **F1** (cadre à onglets en premier), F3, F6 |
| E (front)          | T6, T5  | F5, F7, F2, F4                              |

Pour 4 personnes, fusionner les colonnes C et E. En cas de retard, simplifier d'abord les **options de personnalisation des QR** et le **PDF en lot**.
