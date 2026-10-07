# Consignes communes aux agents de la phase 2 (plan 13)

Tu travailles sur la branche locale `base-saine`. **Ne pousse rien, ne déploie rien, ne commite pas, ni `git stash` ni `git reset` /
`checkout` / `clean`** (plusieurs agents écrivent dans le même arbre : l'utilisateur commite après vérification). Ne touche pas aux
fichiers d'un autre paquet (tableau ci-dessous) ; fichiers partagés : relis juste avant d'écrire, modifie le minimum.

## À lire d'abord
`AGENTS.md` · `plans/12-structure-du-site.md` (décisions) · `plans/13-implementation-structure.md` (architecture, interfaces) ·
**la maquette `plans/maquettes/index.html` (ouvre-la dans Chrome avec Playwright, change de profil/mode/classes avec la barre de
démonstration, regarde `plans/maquettes/captures/`) : c'est la référence de comportement et d'aspect** ; ses données et son breton
sont inventés : le vrai site lit le catalogue. APIs déjà écrites : `src/contexte/README.md` (`useContexte`, adresse, profil),
`src/ressources/README.md` (catalogue, filtres, groupes par domaine, voisines), `src/recherche/index.ts`, `src/router/routes.ts`
(chaque paquet remplace seulement l'import de ses routes), `src/langues/` (traductions typées), `src/data/programme.ts`,
`src/style.css` (charte, `--bleu-fort` pour le texte bleu, `--bleu` pour les aplats), `src/noyau/` (composants du jeu).

## Qualité (non négociable)
- TypeScript strict, aucun `any`, `import type`, extensions `.ts`, pas d'`enum`, `<script setup lang="ts">`. Un fichier = un rôle, en-tête
  qui dit son contrat, composants courts (≈ 150 lignes de script au plus ; extrais).
- **Aucun texte en dur** : traductions typées `src/langues/{fr,br}/textes/<section>.ts` (breton marqué `// br: à relire`) + une ligne
  dans les `index.ts` d'agrégation (relis le fichier juste avant). **Aucun `'br'` en dur** : registre de langues (capacités) ou
  contexte. Emojis : le dictionnaire d'emojis du catalogue/maquette, pas de nouveaux emojis ad hoc pour une même notion.
- L'adresse est la source de vérité : tout changement de contexte passe par `useContexte()` ; aucune lecture directe de `localStorage`
  pour le contexte.
- Accessibilité : éléments natifs, `h1` unique par page, `aria-pressed`/rôles corrects, focus visible, clavier complet,
  `aria-live` pour les changements annoncés, contraste ≥ 4,5:1 (texte bleu `--bleu-fort`), cibles ≥ 44 px pour l'enfant ;
  **aucune violation axe critique ou sérieuse** à 360 et 1280 px, en français et en breton.
- **États honnêtes** : les registres réels sont vides (seuls les exemples existent, **en développement**) ; en production la
  liste est vide. Chaque page a un état vide expliqué (« les exercices arrivent… »), jamais une page cassée. Dans `npm run dev` les
  exemples apparaissent.
- Pas de dépendance nouvelle sans raison forte. Pas d'import de l'ancien socle (règle ESLint). Pas de code mort.

## Tests
Logique pure en Node (`tests/<paquet>.test.mjs`), parcours et accessibilité dans Chrome (`tests/pages-<paquet>.test.mjs`, helper axe de
`tests/accessibilite.test.mjs` ; l'agent P3 l'extrait dans `tests/outils-axe.mjs` et crée `/tmp/outils-axe-pret`). Ajoute tes tests à
`tests/lancer.mjs` (relis avant). Pas d'attente fixe. Chrome : `playwright-core`,
`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` ; serveur de dev sur 5173 (ne le relance pas ; un second serveur
`npx vite --mode skoolik --port 5174 --strictPort`, à arrêter ensuite) ; scripts jetables dans le dépôt puis supprimés.
**`npm test` (ports 4190-4192) : un seul à la fois** : `until mkdir /tmp/npm-test.lock 2>/dev/null; do sleep 5; done; npm test; rmdir /tmp/npm-test.lock`.
Vérifs finales : `npm run types` (0) · `npm run lint` (0) · `npm run i18n` (0) · `npm run qualite` (le compteur
`ancienMondeNonReporte` doit **baisser** quand tes pages importent les modules du catalogue ; resserre ce qui baisse avec `--enregistrer`,
**une seule fois à la fin**) · `npm test`.

## Propriété des fichiers
| Paquet | Possède |
|---|---|
| **P3 shell** | `src/shell/*`, `src/App.vue`, `src/style.css` (variables, barre), `tests/outils-axe.mjs`, `tests/pages-shell.test.mjs` |
| **P4 pages** | `src/pages/Accueil*`, `Matiere*`, `Monde*`, `LangueRegionale*`, `src/ressources/composants/*` (cartes, liste, groupes, sélecteur de vue) |
| **P5 programme** | `src/pages/Programme*`, `Competence*`, `src/programme/*` |
| **P6 recherche** | `src/recherche/*.vue`, `palette.ts`, `useRecherche*.ts`, `tests/pages-recherche.test.mjs` |
| **P7 fiches prêtes** | `src/pages/FichesPretes*`, `Feuille*`, `src/telechargements/*` (vues), routes `/…/fiches`, `/telechargements*` |
| **P8 pages statiques** | `scripts/statique/*`, `deploy/setup-nginx.sh`, `index.html` (balises), sitemap, robots, 404, JSON-LD, `tests/statique.test.mjs` |

Signaux (fichiers dans `/tmp`) : `/tmp/outils-axe-pret` (P3), `/tmp/p4-cartes-pretes` (P4 : composants de cartes/liste/groupes
utilisables), `/tmp/p6-palette-api` (P6 : `ouvrirRecherche()` utilisable par la barre), `/tmp/p3-shell-pret`. Identifiants des agents :
`/tmp/agent-p3-id` … `/tmp/agent-p8-id` ; écris-toi par SendMessage pour tout changement d'API.

## Rapport final court
Ce qui est fait (pages, composants, adresses), les décisions, les tests ajoutés et leur résultat, les écarts à la maquette (et pourquoi),
les limites, ce que les autres paquets doivent savoir.
