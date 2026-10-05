<p align="center">
  <img src="public/favicon.svg" width="96" alt="">
</p>

<h1 align="center">École Primaire · Skoolik</h1>

<p align="center">
  Des exercices et des fiches à imprimer pour l'école, de la MS au CM2, en français et en breton.<br>
  <a href="https://ecoleprimaire.app"><b>ecoleprimaire.app</b></a> · <a href="https://skoolik.app"><b>skoolik.app</b></a>
</p>

<p align="center">
  <a href="https://ecoleprimaire.app"><img src="https://img.shields.io/website?url=https%3A%2F%2Fecoleprimaire.app&label=ecoleprimaire.app&up_message=en%20ligne&down_message=hors%20ligne" alt="ecoleprimaire.app"></a>
  <a href="https://skoolik.app"><img src="https://img.shields.io/website?url=https%3A%2F%2Fskoolik.app&label=skoolik.app&up_message=en%20ligne&down_message=hors%20ligne" alt="skoolik.app"></a>
  <img src="https://img.shields.io/badge/langues-fran%C3%A7ais%20%C2%B7%20brezhoneg-0055a4" alt="Langues : français, breton">
  <img src="https://img.shields.io/badge/classes-MS%20%E2%86%92%20CM2-f39c12" alt="Classes : MS à CM2">
  <br>
  <img src="https://img.shields.io/badge/cookies-0-2ea44f" alt="Aucun cookie">
  <img src="https://img.shields.io/badge/publicit%C3%A9-aucune-2ea44f" alt="Aucune publicité">
  <img src="https://img.shields.io/badge/compte-pas%20besoin-2ea44f" alt="Pas de compte">
  <a href="LICENSE"><img src="https://img.shields.io/badge/code-AGPL--3.0-blue" alt="Code : AGPL-3.0"></a>
  <a href="LICENCE-CONTENU.md"><img src="https://img.shields.io/badge/contenu-CC%20BY--SA%204.0-lightgrey" alt="Contenu : CC BY-SA 4.0"></a>
  <br>
  <img src="https://img.shields.io/badge/Vue-3-42b883?logo=vuedotjs&logoColor=white" alt="Vue 3">
  <img src="https://img.shields.io/badge/Vite-646cff?logo=vite&logoColor=white" alt="Vite">
  <a href="https://github.com/iksaif/ecole-primaire/commits/main"><img src="https://img.shields.io/github/last-commit/iksaif/ecole-primaire?label=derni%C3%A8re%20mise%20%C3%A0%20jour" alt="Dernière mise à jour"></a>
  <a href="https://github.com/iksaif/ecole-primaire/issues"><img src="https://img.shields.io/github/issues/iksaif/ecole-primaire?label=retours" alt="Retours ouverts"></a>
</p>

On a commencé ça pour nos enfants, pour réviser à la maison, et c'est devenu un petit site :

- **https://ecoleprimaire.app** — en français
- **https://skoolik.app** — la même chose en breton, pour les écoles bilingues et Diwan

Il y a des exercices à faire à l'écran (calcul mental, tables, heure, monnaie, dictée, grammaire…)
et des fiches à imprimer : écriture sur lignes Seyès en script et en attaché, affiches de l'alphabet,
nombres en lettres en français et en breton, fiches de calcul avec corrigé. Chaque exercice peut aussi
sortir en fiche papier.

<table>
  <tr>
    <td width="33%"><a href="https://ecoleprimaire.app"><img src="docs/captures/accueil.jpg" alt="Page d'accueil"></a></td>
    <td width="33%"><a href="https://ecoleprimaire.app/#/maths/heure?mode=imprimer"><img src="docs/captures/impression.jpg" alt="Réglages d'une fiche à imprimer"></a></td>
    <td width="33%"><a href="https://ecoleprimaire.app/telechargements/"><img src="docs/captures/fiches.jpg" alt="Fiches PDF toutes prêtes"></a></td>
  </tr>
  <tr>
    <td align="center"><sub>Les exercices, par matière et par classe</sub></td>
    <td align="center"><sub>Chaque exercice se fait à l'écran ou s'imprime</sub></td>
    <td align="center"><sub>Plus de 200 fiches PDF toutes prêtes</sub></td>
  </tr>
</table>

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
  `// br: à relire` dans les catalogues ; `npm run i18n:relecture` en fait un tableau à relire.

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
npm test                  # tests (Chrome sans interface, ~3 min)
npm run lint              # ESLint, règles de correction seulement (pas de règle de style)
npm run qualite           # compteurs qui ne doivent pas régresser (scripts/qualite-seuils.json)
npm run i18n              # vérifie que les traductions sont complètes
npm run couverture        # couverture du programme (couverture.html) : domaine × classe × compétence
                          # (la même chose côté site : page /programme, src/impression/couverture.js)
```

Node 22 ou plus récent, et Google Chrome pour les tests. La CI (`.github/workflows/tests.yml`) lance `lint`,
`qualite` et `npm test` sur chaque push et pull request vers `main`.

### Organisation

- `src/views/` — une vue par exercice. Toutes utilisent le cadre commun `ConfigExercice` : onglets « Faire
  l'exercice » / « Imprimer une fiche » (mode dans l'URL, `?mode=imprimer`), aperçu en direct. Une vue
  fournit son formulaire et une fonction `htmlFiche()` qui renvoie le document à imprimer.
- `src/impression/` — les générateurs de fiches (écriture, alphabet, nombres, calcul) et d'affiches
  (`affiches/` : un cadre commun et un module par famille), partagés par l'app et par la génération des PDF
  au build. `catalogue.js` liste les fiches et affiches toutes prêtes, chacune avec son domaine du programme.
- `src/i18n/` — traductions : un catalogue par composant et par langue (`fr/…`, `br/…`), les règles de
  chaque langue (`regles.js` : mutations bretonnes, ha/hag, élision, pluriels).
- `src/data/` — catalogue des activités (niveaux, filtre par classe, domaine), langues régionales, et
  `programme.js` : les programmes officiels (domaines, compétences, contraintes de chaque classe, avec leurs
  sources). C'est lui qui fait foi pour les niveaux, et il range les fiches par domaine.
- `src/utils/nombres.js` — nombres en lettres en français (orthographe rectifiée ou traditionnelle) et en breton.

### Fiches PDF toutes prêtes

`npm run build:ecoleprimaire` et `npm run build:skoolik` construisent le site puis lancent
`scripts/telechargements.mjs`. Ce script ouvre le site dans Chrome sans interface (playwright-core) et
génère, pour chaque fiche de `src/impression/catalogue.js` (et des fiches de calcul ; pour chaque exercice et
chaque classe, 4 fiches « bilan » et 2 fiches par compétence du programme, voir `src/impression/exercices.js`) :

- un PDF ;
- une vignette ;
- une page statique `telechargements/<fiche>/`, que les moteurs de recherche peuvent indexer.

Les fiches sont générées en parallèle, un onglet de Chrome par cœur (`--travailleurs <n>` pour changer) :
environ 2 minutes par site. `--exercice <id>` ne génère qu'un exercice, `--sans-exercices` aucun (pour tester).

Il génère aussi l'index des fiches (rangé par domaine du programme, puis « pour apprendre » /
« pour s'entraîner »), le `sitemap.xml`, le `robots.txt` et la page 404. Chrome est cherché
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

Pour l'écriture attachée, on conseille [Belle Allure](https://www.jeanboyault.fr/belle-allure/) de Jean Boyault,
la cursive la plus utilisée en classe (ou [Écolier](https://www.dafont.com/fr/jean-marie-douteau.d75)). Leur licence
ne permet pas de les livrer avec le site : installez-les vous-même sur l'ordinateur (elles apparaissent alors dans le
choix de la police des fiches), ou ajoutez le fichier depuis ce choix ; il reste mémorisé dans le navigateur.

## Licence

- **Le code** est sous [GNU AGPL 3.0](LICENSE) (ou version ultérieure) : vous pouvez le reprendre, le
  modifier et héberger votre propre version, à condition de publier vos modifications sous la même licence,
  même si le site n'est utilisé qu'en ligne.
- **Le contenu** (fiches, PDF, textes, listes de mots, traductions bretonnes) est sous
  [CC BY-SA 4.0](LICENCE-CONTENU.md) : imprimez, photocopiez, distribuez et adaptez librement, en citant la
  source.

On a choisi ces licences pour que le site et ses améliorations restent libres et gratuits pour tout le
monde, en particulier les traductions dans les langues régionales.
