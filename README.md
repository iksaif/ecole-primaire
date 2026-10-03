# École Primaire / Skoolik

Des exercices et des fiches à imprimer pour la maternelle et l'élémentaire, de la MS au CM2.
On a commencé ça pour nos enfants, pour réviser à la maison, et c'est devenu un petit site :

- **https://ecoleprimaire.app** — en français
- **https://skoolik.app** — la même chose en breton, pour les écoles bilingues et Diwan

Il y a des exercices à faire à l'écran (calcul mental, tables, heure, monnaie, dictée, grammaire…)
et des fiches à imprimer : écriture sur lignes Seyès en script et en attaché, affiches de l'alphabet,
nombres en lettres en français et en breton, fiches de calcul avec corrigé. Chaque exercice peut aussi
sortir en fiche papier.

On n'est pas enseignants. Les exercices suivent les programmes officiels (cycles 1 à 3, programmes 2024
pour le cycle 2), mais si une règle ou une réponse vous paraît fausse, dites-le nous.

## Vie privée

Tout tourne dans le navigateur. Il n'y a pas de compte, pas de publicité, pas de cookie, et aucune requête
vers un autre site que le nôtre.

- La langue, les réglages et les scores restent dans le stockage local du navigateur (`localStorage`).
  Rien n'est envoyé au serveur ; on peut tout effacer depuis les Paramètres.
- Pour savoir ce qui sert, l'app envoie à notre serveur un signal anonyme (page vue, fiche imprimée et ses
  réglages, langue) : pas de cookie, pas d'identifiant, et nginx l'enregistre **sans adresse IP**
  (`src/utils/journal.js`, `deploy/setup-nginx.sh`). Rien n'est envoyé si le navigateur demande à ne pas être
  suivi. `node scripts/stats-vps.mjs` en fait un résumé (pages vues, fiches imprimées, PDF téléchargés).
- Le serveur ne fait que servir des fichiers statiques. Comme tout serveur web, il garde des journaux
  techniques (IP, page demandée) quelque temps.
- Seule exception, facultative : si vous entrez votre propre clé API Mistral dans les Paramètres, la dictée
  et la lecture peuvent générer des phrases. La requête part alors directement de votre navigateur vers
  Mistral AI, avec votre clé. Sans clé, le site utilise ses phrases prédéfinies.

## À propos de l'IA

Le code a été écrit en grande partie avec l'aide d'un assistant de programmation (Claude). On s'en est
servi comme d'un outil de développement : écrire du code, des tests, chercher des sources. Le site
publié, lui, n'utilise pas d'IA : les exercices sont générés par du code classique, dans votre navigateur.

Ce qui a demandé de la vigilance :

- **Le contenu pédagogique** a été relu, et vérifié contre des sources (programmes, dictionnaires) quand on
  pouvait. Il reste sûrement des erreurs : signalez-les.
- **Les nombres, l'alphabet, les jours et les mois en breton** ont été vérifiés dans le Wiktionnaire, le
  Meurgorf (dictionnaire de l'Office public de la langue bretonne) et Kervarker.
- **Le reste de l'interface en breton est une traduction automatique** qui n'a pas encore été relue par un
  brittophone. Le site le signale aux visiteurs. Les passages dont on est le moins sûr sont marqués
  `// br: à relire` dans le code : `grep -rn "br: à relire" src`.

## Contribuer

Les retours sont les bienvenus, même sans écrire de code :

- une erreur, une faute, un bug : ouvrez une [issue](https://github.com/iksaif/ecole-primaire/issues)
  ou écrivez à contact@skoolik.app ;
- une idée d'exercice ou de fiche qui vous servirait en classe ou à la maison ;
- une relecture de la traduction bretonne, même partielle ;
- pour le code : les pull requests sont bienvenues, voir ci-dessous pour lancer le projet.

## Lancer le projet

Vue 3 + Vite, sans autre dépendance à l'exécution.

```sh
npm install
npm run dev               # http://localhost:5173/ecole-primaire/
npm run dev:skoolik       # la version bretonne
npm run build:app         # build de l'app seule (dist/)
```

### Organisation

- `src/views/` — une vue par exercice. Toutes utilisent le cadre commun `ConfigExercice` : onglets « Faire
  l'exercice » / « Imprimer une fiche » (mode dans l'URL, `?mode=imprimer`), aperçu en direct. Une vue
  fournit son formulaire et une fonction `htmlFiche()` qui renvoie le document à imprimer.
- `src/impression/` — les générateurs de fiches (écriture, alphabet, nombres, calcul), partagés par l'app
  et par la génération des PDF au build.
- `src/i18n/` — traductions : `useI18n({ fr: {...}, br: {...} })` dans chaque composant, textes communs
  dans `commun.js`.
- `src/data/` — catalogue des activités (niveaux, filtre par classe), langues régionales.
- `src/utils/nombres.js` — nombres en lettres en français (orthographe rectifiée ou traditionnelle) et en breton.

### Fiches PDF toutes prêtes

`npm run build:ecoleprimaire` et `npm run build:skoolik` construisent le site puis lancent
`scripts/telechargements.mjs`. Ce script ouvre le site dans Chrome sans interface (playwright-core) et
génère, pour chaque fiche de `src/impression/catalogue.js` (et des fiches de calcul) :

- un PDF ;
- une vignette ;
- une page statique `telechargements/<fiche>/`, que les moteurs de recherche peuvent indexer.

Il génère aussi l'index des fiches, le `sitemap.xml`, le `robots.txt` et la page 404. Chrome est cherché
aux emplacements habituels, ou via `CHROME_PATH`.

Pour générer les PDF avec une police qu'on n'a pas le droit de redistribuer (Belle Allure, Écolier…),
déposez-la dans `polices-locales/attache/` : ce dossier n'est pas versionné. Vérifiez la licence avant
de publier les PDF.

### Sites et déploiement

Le même code donne les deux sites. Le mode Vite choisit le site (`.env.ecoleprimaire`, `.env.skoolik`,
`src/site.js`) : nom, adresse, langue par défaut, et langues des fiches publiées.

Le déploiement se fait par rsync sur un VPS :

```sh
cp .deploy.env.example .deploy.env   # hôte et dossiers (non versionné)
scripts/deploy-vps.sh --dry-run      # ce qui serait envoyé
scripts/deploy-vps.sh                # construit et envoie les deux sites
scripts/deploy-vps.sh skoolik        # un seul site
```

`deploy/setup-nginx.sh` configure nginx et les certificats Let's Encrypt sur le serveur (à lancer avec sudo).

GitHub Pages ne sert plus qu'une redirection vers https://ecoleprimaire.app, qui garde le chemin et la
route (`scripts/redirection-gh-pages.mjs`, publiée à chaque push sur `main`).

## Polices

Toutes les polices utilisées sont livrées avec le site, sous licence libre :

- Playwrite FR Trad (écriture cursive scolaire), Andika (script, pensée pour l'apprentissage de la lecture)
  et OpenDyslexic, sous licence SIL OFL ;
- Luciole © Laurent Bourcellier & Jonathan Perez, sous licence CC BY 4.0.

## À faire

Voir [TODO.md](TODO.md) : passage à d'autres langues régionales, relecture du breton, licence, surveillance…
