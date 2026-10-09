# Plan 11 — La base saine (TypeScript) : règles et fin du chantier

Décision de l'utilisateur, 2026-10-05 : on a construit une base saine, entièrement en TypeScript, puis on y a reporté l'existant. **Le report est terminé**
(26 exercices et 11 affiches dans le modèle de la base ; l'ancien monde est supprimé, commit `c088a7b`). Ce plan ne garde que ce qui
reste valable tant que la branche n'est pas validée et fusionnée.

## Règles (valables jusqu'à la mise en ligne)

1. **Tout se fait dans `main`** (depuis le 2026-10-09 ; la branche `base-saine` est abandonnée). Ce qui est en ligne est l'ancien site : rien n'est déployé tant que l'utilisateur n'a pas validé.
2. **Tout ce qu'on écrit est en TypeScript propre** (`erasableSyntaxOnly`, pas d'`enum`, imports avec extension `.ts`, `import type`). Plus de compatibilité avec
   l'ancien monde, qui n'existe plus.
3. **Les entrées de programme fictives** (domaine `exemple`) ne servent qu'au développement : jamais dans un build de production, dans la couverture ni dans le catalogue public.

## Fini quand

`npm run dev` et `npm run dev:skoolik` montrent la base complète, `npm run types`, `lint`, `i18n` et `qualite` passent, le build produit les JSON de fiches et les pages
statiques, **et l'utilisateur a validé**. Alors seulement : la liste ci-dessous.

## Avant de déployer (par l'utilisateur, pas avant sa validation)

1. **Redirections** des anciens slugs : bretons `-brezhoneg` → `-br`, `exercices-nombres-<classe>` → `exercices-numeration-<classe>`, anciens slugs d'alphabet et de nombres
   bretons (listes dans `docs/TODO.md`) ; redirection des anciennes adresses `#/…`.
2. `deploy/setup-nginx.sh` (adresses propres, 404 réelles pour un fichier absent) : **exécuté avec `sudo` par l'utilisateur**.
3. Image de partage `og-image` (plan 05), `lastmod` du sitemap, `deploy/nginx/*.conf` périmés (voir `docs/TODO.md`).
4. Déploiement par `scripts/deploiement/deploy-vps.sh` (build des deux sites + rsync, ~8 min), seulement après validation.
5. Les builds de production génèrent **toutes** les fiches (le niveau rapide des tests n'en génère qu'un échantillon).

## Encore ouvert

- Validation par l'utilisateur de la base complète (navigation, pages, fiches).
- Relecture du breton marqué « à relire » : voir `docs/TODO.md`.
