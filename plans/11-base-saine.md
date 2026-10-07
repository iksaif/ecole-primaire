# Plan 11 — La base saine (TypeScript) : règles et fin du chantier

Décision de l'utilisateur, 2026-10-05 : on a construit une base saine, entièrement en TypeScript, puis on y a reporté l'existant. **Le report est terminé**
(26 exercices et 11 affiches dans le modèle de la base ; l'ancien monde est supprimé, voir `REPRISE.md` et l'historique git). Ce plan ne garde que ce qui
reste valable tant que la branche n'est pas validée et fusionnée.

## Règles (valables jusqu'à la fusion dans `main`)

1. **Branche `base-saine`.** `main` est la production et sert de référence ; rien n'est déployé depuis cette branche tant que l'utilisateur n'a pas validé.
2. **Tout ce qu'on écrit est en TypeScript propre** (`erasableSyntaxOnly`, pas d'`enum`, imports avec extension `.ts`, `import type`). Plus de compatibilité avec
   l'ancien monde, qui n'existe plus.
3. **Les entrées de programme fictives** (domaine `exemple`) ne servent qu'au développement : jamais dans un build de production, dans la couverture ni dans le catalogue public.
4. Reporter un exercice ou une affiche de `main` : copier le modèle d'un report récent (`REPRISE.md`, « Comment porter »), instantanés identiques, slugs inchangés.

## Fini quand

`npm run dev` et `npm run dev:skoolik` montrent la base complète, `npm run types`, `lint`, `i18n` et `qualite` passent, le build produit les JSON de fiches et les pages
statiques, **et l'utilisateur a validé**. Alors seulement : redirections des anciennes adresses, `deploy/setup-nginx.sh` (par l'utilisateur), fusion dans `main`,
déploiement (`REPRISE.md`, « Avant de déployer »).

## Encore ouvert

- Validation par l'utilisateur de la base complète (navigation, pages, fiches).
- Textes d'interface encore au format ancien : voir `docs/TODO.md` (traductions, relecture du breton).
