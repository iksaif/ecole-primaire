# Reprise du travail sur une autre machine

> Écrit le 2026-10-07, à la fin d'une longue session. À lire en premier, puis `AGENTS.md`, puis `docs/TODO.md`.
> Rien de ce qui est ici n'est un secret : les clés, l'hôte du serveur et la clé Mistral restent hors du dépôt.

## Où on en est

- Branche **`base-saine`** (poussée sur `origin/base-saine`). **`main` est la production et n'a pas bougé** (`f8080e1`) ;
  **rien n'est déployé** depuis cette branche et rien ne doit l'être tant que l'utilisateur n'a pas validé (voir « Avant de déployer »).
- La « base saine » (plan 11) est **toute en TypeScript** : noyau d'exercices (`src/noyau/`), modèle d'affiches (`src/affiches/`),
  contexte/routeur/pages (plan 13 : `src/contexte/`, `src/router/`, `src/shell/`, `src/pages/`, `src/ressources/`, `src/recherche/`,
  `src/programme/`), fiches en JSON + PDF (`scripts/build/fiches/`), pages HTML statiques (`scripts/build/statique/`).
- La **migration de l'ancien monde** est avancée : **17 exercices et 11 affiches** sont portés dans le modèle de la base.
  Compteurs de `npm run qualite` : `ancienMondeNonReporte` 121, `importeursAncienSocle` 50, `couverture` 56,7 %.

### Porté (modèle `definir` / `definirAffiche`, fiches sous leurs slugs historiques)
- Exercices : calcul-mental, calcul-pose, tables, numération, suites, problèmes, heure, monnaie, longueurs, mesures, fractions,
  formes, géométrie, motifs, compter, comparer, ranger (= « ordonner », id gardé pour le slug `exercices-ranger-*`), lettres.
- Affiches : alphabet, nombres, numération (tableau), droite numérique, tables (× et +), monnaie (+ planches à découper),
  horloge (aiguilles colorées), formes et solides. Trois exemples de développement : `exemple`, `exemple-jours`, `exemple-riche`.

### Reste à porter (voir `src/exercices/ancien.js`, `src/impression/`)
- Exercices **de français** : **vocabulaire, orthographe, grammaire, conjugaison, dictée**.
- Affiches/fiches : **conjugaison** (`src/impression/affiches/conjugaison.js`), **resume** (`resume.js`), **écriture** (Seyès,
  `src/impression/ecriture.js` : exercice « fiche seule », `jeu: false`), `affichesProgramme.js`.
- Décisions déjà prises pour ces reports : l'**orthographe perd son niveau « CP → CM2 »** (le slug `exercices-orthographe-cp-cm2`
  disparaît ou redirige) ; la **dictée** peut appeler Mistral **seulement avec la clé saisie par l'utilisateur**, et un test doit
  prouver que rien ne sort sans clé (garde générique déjà dans `tests/vie-privee.test.mjs`, à viser sur la vraie dictée) ;
  le français est toujours en `fr` (`enLangue('fr', …)`).
- **Comment porter** : copier le modèle d'un report récent (`git show de94063 --stat` calcul-mental, `70db8c9` heure,
  `2b285f8` monnaie, `dbfdd31` tables, `fd1b429` numération, `da40463` alphabet, `a286573` monnaie affiche), `npm run nouveau`
  pour le squelette d'un exercice, instantanés identiques (`npm run instantanes`), slugs inchangés, `tirerUniques`, textes typés
  fr/br (breton marqué `// br: à relire`), supprimer l'ancien code et ses références (`ancien.js`, `activites.js`, `ancien-routes.js`…).

## Remettre en route

```sh
git clone git@github.com:iksaif/ecole-primaire.git && cd ecole-primaire && git checkout base-saine
node --version        # >= 22.18 (Node exécute les .ts directement)
npm ci
npm run dev           # http://localhost:5173/ecole-primaire/
npm test              # rapide (~1 min) ; npm run test:complet : tous les PDF et toute l'accessibilité (~2 min)
npm run types && npm run lint && npm run i18n && npm run qualite
```

- **Chrome** (playwright-core) : `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` sur macOS ; ailleurs, `CHROME_PATH`.
- **Commits signés** (auteur `Corentin Chary <corentin.chary@gmail.com>`) : si la signature échoue, ne pas la contourner ; déverrouiller
  l'agent de signature puis réessayer.
- **Hors dépôt, à recréer ou copier à la main** : `.deploy.env` (voir `.deploy.env.example`), `polices-locales/` (Belle Allure et
  Écolier, usage local seulement : voir `docs/TODO.md`, licences), la clé Mistral (saisie dans l'app), la mémoire locale de Claude
  (`~/.claude/projects/…/memory`) : tout ce qu'il faut savoir est dans ce fichier, `AGENTS.md`, `docs/TODO.md` et `plans/`.
- Un seul `npm test` à la fois (ports 4190 à 4192) : verrou `/tmp/npm-test.lock` quand plusieurs agents travaillent.

## Où lire quoi

| Fichier | Pour |
|---|---|
| `AGENTS.md` | règles de travail, commandes, où sont les choses |
| `docs/TODO.md` | toutes les demandes, décisions et reports restants (la plus à jour) |
| `plans/11-base-saine.md`, `12-structure-du-site.md`, `13-implementation-structure.md` | décisions et architecture de la base saine et du site |
| `plans/maquettes/index.html` (+ `captures/`) | maquette cliquable de référence (données et breton inventés) |
| `src/exercices/README.md`, `src/affiches/README.md`, `src/contexte/README.md`, `src/ressources/README.md` | les modèles |
| `scripts/README.md` | les scripts, rangés par rôle |
| `tests/lancer.mjs` (en-tête) | règle de dépendances des tests et les deux niveaux (rapide / complet) |

## Décisions à connaître

- **Fiches toutes prêtes** : PDF en **Playwrite FR Trad** (OFL). Belle Allure et Écolier : seulement en local, avec la police installée
  (licences relevées dans `docs/TODO.md` ; publier l'une d'elles demande l'accord écrit de l'auteur).
- **Structure** : adresses propres, pas de « Fiches » dans la barre ; la page d'une matière liste les exercices et affiches à
  personnaliser ; les fiches prêtes sont sur `/<matière>/fiches` et `/telechargements/`. **Le Monde reste visible.** Cartes par défaut
  partout. Un **parent peut choisir plusieurs classes** ; seul l'**enfant** a une classe verrouillée. Profil facultatif, jamais dans l'adresse.
- **skoolik** : interface en français par défaut, mode « français + breton », breton choisissable dans les réglages.
- `/brezhoneg` est une page de matière comme les autres (les données vérifiées de l'alphabet, des nombres, jours et mois restent
  dans `src/langues/br/` pour les affiches ; ne pas les modifier sans source).
- **Jamais deux fois la même question** (`src/noyau/uniques.ts`, vérifié pour tout exercice du noyau).
- Plages de classes dans les définitions : `plageDeClasses('cp+')`, `pourClasses(...)`.

## Avant de déployer (par l'utilisateur, pas avant sa validation)

1. **Redirections** des anciens slugs : bretons `-brezhoneg` → `-br`, `exercices-nombres-<classe>` → `exercices-numeration-<classe>`,
   anciens slugs d'alphabet et de nombres bretons (listes dans `docs/TODO.md`).
2. `deploy/setup-nginx.sh` (adresses propres, 404 réelles pour un fichier absent) : **exécuté avec `sudo` par l'utilisateur**.
3. Image de partage `og-image`, `lastmod` du sitemap, `deploy/nginx/*.conf` périmés (voir `docs/TODO.md`).
4. Merge dans `main` seulement après validation ; ensuite `scripts/deploiement/deploy-vps.sh` (build des deux sites + rsync, ~8 min).
5. Les builds de production génèrent **toutes** les fiches (le niveau rapide des tests n'en génère qu'un échantillon).

## Pièges déjà rencontrés

- Plusieurs agents en parallèle : commits **limités aux chemins** de chacun (`git commit -m … -- chemins`), jamais `git stash/reset/checkout/clean` ;
  relire les fichiers partagés (registres, `index.ts` de textes, `tests/lancer.mjs`) juste avant de les modifier.
- Les instantanés d'affiches sont dans `tests/instantanes/affiches.json` (`node tests/affiches-modele.test.mjs --maj` pour accepter un écart voulu,
  après l'avoir regardé).
- Une boîte de texte SVG dépasse de la page par la hauteur de la police sans que les lettres sortent : `tests/fiches-debordement.test.mjs` ne mesure que l'horizontale pour le texte SVG.
- Charge de la machine : des tests Chrome peuvent échouer par course sous charge (titres lus trop tôt…) ; les relancer seuls avant de chercher un bug.
