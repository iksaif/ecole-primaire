# scripts/

Les scripts du dépôt, rangés **par rôle** (ce que fait le script, pas comment il est écrit). Chaque script a, en tête de
fichier, son mode d'emploi et son contrat. Tout nouveau module est en TypeScript (`.ts`, exécuté directement par node
≥ 22.18) ; les `.mjs` restent là où ils sont simples.

| Dossier | Rôle | Pourquoi ici |
|---|---|---|
| `build/` | produit ce qui est publié : PDF et JSON des fiches, pages HTML statiques | appelé par `npm run build*`, les tests et la CI |
| `verifier/` | contrôle sans rien modifier : types, qualité, traductions, couverture | appelé par la CI et à la main avant un commit |
| `generer/` | écrit un fichier **versionné** de `src/` à partir d'autre chose | à relancer quand la source change, puis à commiter |
| `dev/` | outils du développeur, pendant une migration | à la main |
| `deploiement/` | mise en ligne du site et lecture de ses journaux | à la main, ou le workflow GitHub Pages |
| `ponctuel/` | gestes qu'on ne fait qu'une fois par domaine ou par service | à la main, rarement |
| `lib/` | code partagé entre scripts : racine du dépôt, parcours de fichiers, Vite sans navigateur | importé, jamais lancé |
| `nouveau.mjs`, `nouveau-affiche.mjs` | créent un exercice ou une affiche à partir des modèles | `npm run nouveau` |

## Qui appelle quoi

| Script | À quoi il sert | Qui l'appelle | Quand |
|---|---|---|---|
| `build/fiches/commande.ts` | fiches PDF, vignettes et JSON (`fiches/index.json`), via Chrome sans interface | `npm run fiches`, `fiches:dev`, `build`, `build:<site>` ; `tests/lancer.mjs`, `tests/fiches.test.mjs` | à chaque build du site (après `vite build`) |
| `build/statique/commande.ts` | pages HTML statiques des fiches, sitemap, `robots.txt`, `404.html` (à partir des JSON des fiches) | `npm run statique`, `build`, `build:<site>` ; `tests/lancer.mjs`, `tests/statique.test.mjs` | à chaque build, après `fiches` |
| `verifier/types.mjs` | `vue-tsc` strict, sans les erreurs situées dans des `.js` | `npm run types`, CI, compteur `erreursDeType` de `qualite` | avant chaque commit |
| `verifier/qualite.ts` + `qualite/` | compteurs à seuil (`qualite-seuils.json`) : `'br'` en dur, ancien socle, types, couverture… | `npm run qualite`, CI | avant chaque commit ; `-- --enregistrer` resserre les seuils quand un compteur s'améliore |
| `verifier/i18n.ts` + `i18n/` | clés manquantes entre français et breton, textes « à relire » ; `--relecture` écrit `i18n-relecture.html` | `npm run i18n`, `npm run i18n:relecture` | après un texte nouveau ; avant d'envoyer une relecture |
| `verifier/couverture.ts` + `couverture/` | rapport domaine × compétence × classe : ce qui couvre chaque case (`couverture.html`) | `npm run couverture` | pour choisir quoi reporter ou écrire ensuite |
| `generer/ids.mjs` | écrit `src/noyau/ids.ts` (constantes `K` et `D`) d'après `src/data/programme.ts` | à la main : `node scripts/generer/ids.mjs` | quand le programme gagne une compétence ou un domaine (`npm run types` échoue sinon) |
| `generer/metriques-polices.mjs` | écrit `src/affiches/metriques.ts` (largeurs des polices livrées, mesurées dans Chrome) | à la main : `node scripts/generer/metriques-polices.mjs` (serveur de dev lancé) | quand une police livrée change ou qu'un caractère manque |
| `dev/capturer-fiches.ts` + `capturer/` | capture les fiches d'une vue **ancienne** dans Chrome : l'empreinte « avant » devient l'instantané de l'exercice migré | à la main ; décrit dans `src/exercices/README.md` | au début du report d'un exercice (voir ci-dessous) |
| `deploiement/deploy-vps.sh` | construit les sites et les envoie par rsync sur le VPS | `npm run deploy:vps` | à la demande seulement (~8 min) ; lit `.deploy.env` |
| `deploiement/redirection-gh-pages.mjs` | écrit la page de redirection de GitHub Pages vers `ecoleprimaire.app` | `.github/workflows/deploy.yml` | à chaque push sur `main` |
| `deploiement/stats-vps.ts` + `stats/` | statistiques d'usage lues dans les journaux du VPS (pages vues, fiches imprimées, PDF) | à la main : `node scripts/deploiement/stats-vps.ts [jours]` | de temps en temps, pour choisir quelles fiches pré-générer |
| `deploiement/config.ts` | lit `.deploy.env` (hôte SSH, sites, domaines) | `stats-vps.ts` | importé |
| `ponctuel/dns-verification.mjs` | ajoute un enregistrement TXT de vérification (Search Console, Bing…) via l'API Gandi, sans retirer les autres | à la main | une fois par domaine ; jeton Gandi dans `~/gandi` ou `GANDI_TOKEN` |

## Choix de rangement

- **`build/` plutôt que la racine.** `fiches/` et `statique/` sont les deux seuls « gros » programmes (10 à 15 modules
  chacun) ; ils ont leur propre sortie et leurs propres tests. Ils ne se mélangent plus aux contrôles.
- **`verifier/` : on ne modifie rien.** Types, qualité, traductions et couverture ont le même contrat : une sortie lisible
  et un code de sortie non nul en cas de régression. Les trois scripts longs sont découpés par rôle (un module par sorte
  de compteur ou de catalogue), avec le contrat en tête de chaque module.
- **`generer/` : fichiers versionnés.** `ids.ts` et `metriques.ts` portent « Généré par … : ne pas modifier à la main » ;
  le chemin du générateur y est écrit, d'où l'intérêt de ne pas le déplacer sans mettre ces en-têtes à jour.
- **`ponctuel/` : à garder, mais à part.** `dns-verification.mjs` n'est ni dans la CI ni dans un npm run : il ne doit pas
  être confondu avec un outil de tous les jours. Aucun secret dans le dépôt : le jeton est lu dans `~/gandi` ou `GANDI_TOKEN`.
- **`dev/capturer-fiches.ts` : provisoire.** Il sert tant qu'il reste des exercices au format ancien (`src/exercices/ancien.js`).
  Il pilote les VUES anciennes : il ne fonctionne que sur un code où elles sont routées (`main`, pas `base-saine`, où
  `src/router/ancien-routes.js` est déconnecté). À supprimer avec le dernier exercice reporté.
- **`verifier/couverture.ts` lit l'ancien monde.** Le catalogue neuf (`src/ressources/`) ne contient que les exercices déjà
  reportés ; la page `/programme` le lit. Tant que les exercices anciens portent l'essentiel des ressources, ce rapport et le
  compteur `couverture` de `qualite` restent sur `src/impression/couverture.js` ; ils seront réécrits sur `src/ressources/`
  (ou supprimés s'ils font double emploi) au dernier report.
- **Aucun secret, aucun hôte réel.** `deploy-vps.sh` et `stats-vps.ts` lisent l'hôte SSH, le dossier distant et les domaines
  dans `.deploy.env` (ignoré par git ; modèle : `.deploy.env.example`).
