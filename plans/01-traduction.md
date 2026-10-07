# Plan 01 — Refaire proprement la traduction (interface / contenu)

**But** : remplacer le système actuel, bricolé, par une traduction propre qui distingue deux niveaux, se relit
facilement et s'ouvre à d'autres langues régionales.

**Couvre les points du TODO** : « Refaire proprement la traduction », toute la section « Généraliser français +
breton », synthèse vocale, relecture par un brittophone.

## État actuel (relevé le 2026-10-03)

- 40 composants appellent `useI18n({ fr: {...}, br: {...} })` avec leurs messages en dur ; textes communs dans
  `src/i18n/commun.js`.
- 147 branches `langue === 'br'`, `enBr()`, `BR()` ou `config.langue === 'br'`, réparties dans 26 fichiers,
  surtout les générateurs d'exercices et de fiches.
- 226 marqueurs `// br: à relire`.
- Tables de traduction écrites au cas par cas : catégories de dictée, explications d'orthographe, quiz
  (`QUESTIONS_BR`), formes, libellés du calcul (`L(fr, br)`).
- `scripts/telechargements.mjs` a son propre dictionnaire `T` et `duo()`.
- `src/impression/nombres.js` : `langue` vaut 'fr' | 'bilingue' | 'br', plus `langueTextes` ; `alphabet.js` et
  `ecriture.js` ont un champ `br` dans STYLES.
- Langue régionale : `src/data/languesRegionales.js` (alphabet, nombres, listes, mots) et
  `useLangueRegionale` (réglage, ou breton d'office si l'interface est en breton).

## Modèle cible

Trois notions séparées :

1. **Langue de l'interface** (`ui`) : boutons, menus, consignes, messages. Le visiteur la choisit (FR / BR).
2. **Langue du contenu** (`contenu`) : ce qui est généré ou imprimé (énoncés, mots, nombres, documents). Elle
   dépend de l'exercice :
   - exercice de français : toujours `fr`, même avec une interface bretonne ;
   - maths, quiz, maternelle : par défaut, la langue de l'interface ;
   - fiches bilingues : une **liste** de langues, par exemple `['fr', 'br']`.
3. **Langue régionale active** (`regionale`) : ce qui est montré ou caché (fiches bretonnes, mentions…).

Une fonction unique, `t(cle, params, { langue })`, prend toujours la langue explicitement côté contenu.

## Étapes

1. **Catalogues de messages** :
   - créer `src/i18n/fr/*.js` et `src/i18n/br/*.js`, un fichier par domaine (`commun`, `nav`, `maths/heure`,
     `impression/fiches`…) ;
   - format plat `cle: 'texte'`, avec le contexte en commentaire pour le relecteur ;
   - un script `scripts/i18n-verifier.mjs` signale les clés manquantes ou en trop entre `fr` et `br`, et liste
     les clés marquées « à relire ».
2. **Migration de l'interface**, vue par vue :
   - remplacer les messages locaux par des clés de catalogue (`t('heure.titre')`) ;
   - faire la migration avec un script de déplacement, sans réécrire les traductions ;
   - faire passer les tests Playwright existants (`/tmp/pw/i18n-all.mjs`, `cadre-all.mjs`) à chaque lot.
     Il faudra les rapatrier dans le dépôt, voir le plan 08.
3. **Règles de langue** (`src/i18n/regles/br.js`) :
   - nom au singulier après un nombre ;
   - mutations après `un`/`ur`/`ar`, `daou`/`div`, `tri`/`teir`… ;
   - « ha » ou « hag » ;
   - `pluriel(n, forme)`, `apres(nombre, nom)`.

   Les générateurs utilisent ces fonctions au lieu d'écrire le breton à la main. Le français a son équivalent
   (élision « que » / « qu' », pluriels).
4. **Générateurs de contenu** :
   - chaque générateur reçoit `{ langue }` et puise ses gabarits dans le catalogue de contenu
     (`contenu/br/problemes.js`…) au lieu de faire `if (br) … else …` ;
   - commencer par les plus touffus : `ProblemesView`, `HeureView`, `MonnaieView`, `calcul.js`.
5. **Documents et pages statiques** :
   - `src/impression/*.js` et `scripts/telechargements.mjs` utilisent les mêmes catalogues ;
   - le build les lit en node, ce qui oblige à les garder sans dépendance Vue ;
   - remplacer `duo()` par un rendu des deux langues à partir des catalogues ;
   - `nombres.js` : `langues: ['fr', 'br']` remplace `langue` et `langueTextes`.
6. **Langues régionales génériques** :
   - `languesRegionales.js` porte aussi la langue d'interface associée, le drapeau (SVG dans la donnée), les
     fiches à générer (alphabet, listes, nombres) et les mots illustrés ;
   - le catalogue des fiches bretonnes (`BR`, `lettresBretonnes`, `breton` dans `catalogue.js`) est généré à
     partir de cette donnée ;
   - les fiches d'exercices (`exercices.js`) sont générées pour chaque langue de contenu disponible.
7. **Synthèse vocale** :
   - pas de voix bretonne dans les navigateurs ;
   - option A : enregistrements audio des listes de mots et des nombres (fichiers `.mp3` par mot, enregistrés
     par un brittophone) ;
   - option B : voix serveur (aucune bonne voix bretonne libre connue à ce jour) ;
   - en attendant, garder les boutons 🔊 masqués en breton.
8. **Relecture par un brittophone** :
   - exporter les catalogues `br` en tableau (CSV ou page HTML : clé, français, breton, contexte) ;
   - réimporter les corrections ;
   - retirer les marqueurs « à relire » au fil de l'eau.

## Vérification

- `scripts/i18n-verifier.mjs` : 0 clé manquante.
- Tests Playwright de toutes les pages en `fr` et en `br`, sans erreur et sans libellé français dans
  l'interface bretonne.
- Les PDF générés au build sont identiques avant et après la migration, à graine et langue égales : comparer
  les md5 des documents HTML.

## Ordre et effort

Étapes 1, 2 et 3 : 2 à 3 jours, à faire par lots, une matière par commit. Étapes 4 et 5 : 2 jours. Étape 6 :
1 jour. Étapes 7 et 8 dépendent de personnes extérieures. **À faire avant d'ajouter une autre langue
régionale.**

## Décisions à prendre

- Format des catalogues : JS, pour les fonctions de pluriel, ou JSON avec ICU MessageFormat ?
  Recommandation : JS plat, plus simple et sans dépendance.
- Faut-il un `lang="fr"` sur les contenus français affichés dans l'interface bretonne ? Oui, pour
  l'accessibilité (voir le plan 06).

## Bibliothèques d'i18n — évaluation (2026-10-04)

| Option | Pour | Contre | Verdict |
|---|---|---|---|
| **Noyau maison** (`src/i18n/index.js`, ~60 lignes) | aucune dépendance ; marche dans Vue, dans node (build des PDF) et dans les pages statiques ; catalogues JS avec commentaires et fonctions | pas d'outil de traduction collaboratif | **gardé** |
| **`Intl.PluralRules`** (natif) | règles de pluriel CLDR, dont le breton (one/two/few/many/other) ; zéro octet | — | **adopté** : messages `{ one, other }` / `{ one, two, few, many, other }` choisis d'après `params.n` |
| **vue-i18n** | standard Vue, `t('cle', { n })` identique au nôtre, pluriels, chargement paresseux, outils | pensé pour l'interface Vue : nos textes servent aussi au build node et aux documents | utile seulement si l'app grossit beaucoup ; migration facile (même API) |
| **Fluent** (`@fluent/bundle`, Mozilla) | conçu pour les langues à grammaire riche : variantes (genre, mutations), termes partagés, format `.ftl` lisible par un traducteur, géré par Weblate et Pontoon | nouveau format ; étape d'analyse ; réécriture des catalogues | **meilleur candidat** le jour où une relecture collaborative est organisée |
| **i18next**, **ICU MessageFormat** (`intl-messageformat`) | très répandus, gérés par Weblate et Crowdin | plus lourds ; ICU est verbeux pour le breton | non |

**Recommandation** : noyau maison et `Intl.PluralRules` maintenant. Si des relecteurs bretons (ou d'autres
langues) veulent travailler dans un outil web comme Weblate, convertir les catalogues en Fluent `.ftl`. Un
script peut le faire, puisque les catalogues sont plats ; les quelques messages en fonction deviennent des
sélecteurs Fluent. Les règles de `src/i18n/regles.js` peuvent rester en JS ou devenir des termes Fluent.
