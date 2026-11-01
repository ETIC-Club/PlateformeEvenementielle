# Contribuer

Objectif : livrer en 3 semaines sans se marcher dessus. Le principe : **petites branches, petites PR, relecture avant merge**. Lisez d'abord [`Guide.md`](Guide.md).

## Stratégie de branches

- `main` est toujours **déployable** (lint, typecheck et build passent). **On ne pousse jamais directement sur `main`** : tout passe par une Pull Request.
- **Une branche par tâche**, créée depuis un `main` à jour :
  ```bash
  git switch main && git pull
  git switch -c feat/participants-crud
  ```
- Nom de branche : `<type>/<feature>-<description-courte>` en kebab-case. Types : `feat`, `fix`, `docs`, `refactor`, `chore`, `test`.
  Exemples : `feat/events-crud`, `feat/scan-validate-token`, `fix/import-duplicates`, `docs/api-scan`.
- **Une PR = une tâche**, la plus petite possible (idéalement < 400 lignes modifiées, une journée de travail maximum). Une grosse tâche se découpe en plusieurs PR (ex. d'abord les queries, puis le service, puis la route).
- Restez à jour : `git switch <votre-branche> && git merge main` (ou `rebase`) au moins une fois par jour pour éviter les gros conflits.
- Pour les fichiers sensibles (`src/db/schema.ts` + migrations, `src/lib/*`, `src/proxy.ts`, `docs/API.md`, `package.json`) : **prévenir l'équipe avant** et faire une PR dédiée et courte.
- Supprimez la branche après le merge.

## Relecture et merge

1. Ouvrez la PR avec le modèle ci-dessous ; mettez-la en _draft_ tant qu'elle n'est pas prête.
2. **Au moins une personne relit** (pas l'auteur) et approuve avant le merge. Le project lead relit obligatoirement les PR qui touchent au schéma, au contrat d'API ou à l'authentification.
3. Répondez à chaque commentaire (corrigé, ou expliquez pourquoi pas). Le relecteur résout ses propres conversations.
4. Merge en **squash** (un commit propre sur `main`, dont le titre suit le format ci-dessous) par l'auteur, une fois approuvée et à jour avec `main`.
5. Relecteur : comptez ~24 h maximum pour relire. Une PR petite se relit en 10 minutes.

## Format des commits (Conventional Commits)

```
<type>(<portée>): <description à l'impératif, en minuscules, sans point>

[corps optionnel : pourquoi, pas comment]
```

- **Types** : `feat` (nouvelle fonctionnalité), `fix` (correction), `docs`, `refactor`, `test`, `chore` (outillage, dépendances), `perf`, `style` (format).
- **Portée** = la feature : `events`, `participants`, `import-export`, `qr`, `badges`, `scan-sessions`, `scan`, `dashboard`, `users`, `auth`, `db`, `ui`, `api`.
- Exemples :
  - `feat(participants): add search and pagination to list endpoint`
  - `fix(scan): return already_scanned on concurrent duplicate`
  - `feat(db): add index on scans.scanned_by` (+ migration)
  - `docs(api): document import dry-run`
- Un changement de contrat d'API ou de schéma : ajoutez `BREAKING CHANGE:` dans le corps.
- Le titre de la PR suit le même format (il devient le message du squash).

## Checklist de PR

À copier dans la description de chaque PR :

```markdown
## Quoi et pourquoi

<!-- Tâche concernée, en 2-3 lignes. Captures d'écran pour l'UI. -->

## Checklist

- [ ] La PR ne couvre qu'une seule tâche et reste petite
- [ ] `pnpm lint`, `pnpm typecheck` et `pnpm build` passent
- [ ] Testé à la main (décrire comment) ou par un test
- [ ] Je n'ai modifié que les fichiers de ma feature (sinon : expliqué ci-dessus et prévenu l'équipe)
- [ ] Le contrat d'API n'a pas changé — ou `docs/API.md` et les schémas Zod sont à jour dans cette PR
- [ ] Schéma de base : migration générée (`pnpm db:generate`) et validée par le project lead — ou aucun changement de schéma
- [ ] Routes protégées : rôles vérifiés côté serveur (`defineRoute`), jamais seulement dans l'UI
- [ ] Aucune logique métier dans la route ni dans `queries.ts` ; aucune requête DB hors `queries.ts`
- [ ] Aucun secret, `.env.local` ni fichier généré commité ; nouvelle variable ajoutée à `.env.example` et `src/lib/env.ts`
- [ ] Les `// TODO(<feature>)` réglés sont supprimés, les mocks devenus inutiles aussi
- [ ] (UI) Utilisable sur mobile (375 px), au clavier, avec états chargement / erreur / vide
```

## Quand ça coince

- Conflit Git : ne forcez jamais (`push --force`) sur `main`. En cas de doute, demandez avant de résoudre.
- Besoin de changer quelque chose de partagé (schéma, contrat, `lib`) : ouvrez une discussion avec le project lead plutôt qu'une PR surprise.
- Bloqué plus d'une heure : demandez de l'aide dans le canal de l'équipe.
