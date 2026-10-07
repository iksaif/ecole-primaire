# Plan 09 — Tout organiser par domaine du programme (affiches, fiches, exercices)

**But** : il n'y a plus de catégorie « Affiches du programme » à part, puisque presque tout suit le programme. Chaque
domaine (nombres et calcul, grandeurs et mesures, espace et géométrie, français…) regroupe ses affiches (pour
apprendre), ses fiches et ses exercices (pour s'entraîner), puis un bilan. Ça se fait en deux temps : d'abord le
code (un seul catalogue, un seul générateur d'affiches), puis l'affichage (`/imprimer`, `/telechargements/`).

**Couvre les points du TODO** : « Refonte affiches / maths / programme », « Réorganiser le code qui génère les
affiches », « Vérifier compétences et étapes du programme pour chaque activité » (fiches prégénérées par
compétence + bilan + affiche résumé).

## État actuel (relevé le 2026-10-04)

- Les affiches sont générées à quatre endroits :
  - `alphabet.js` ;
  - `nombres.js` (mise en page « affiches ») ;
  - `calcul.js` (mode affiche : tables) ;
  - `affichesProgramme.js` (droite, numération, horloge, euros, conjugaison, figures, solides).

  Chacun a son cadre (titre, marges, échelle A3) mais tous passent par `documentImpression`.
- Les catalogues sont aussi éparpillés :
  - `catalogue.js` (`TELECHARGEMENTS`, `CATEGORIES` : ecriture, alphabet, nombres) ;
  - `calcul.js` (`TELECHARGEMENTS_CALCUL`) ;
  - `affichesProgramme.js` (`TELECHARGEMENTS_PROGRAMME`) ;
  - `api-build.js`, qui les réunit.
- Le build (`scripts/telechargements.mjs`) range chaque entrée avec `classer()` dans un `usage` (apprendre ou
  exercice) et un `groupe` (`GROUPES`) écrits à la main.
- Les exercices de l'app ont un `domaine` (`src/data/activites.js`), mais pas les fiches ni les affiches.
- `/imprimer` a deux rubriques (affiches, fiches) ; les pages matières groupent déjà par `domaine`.

## Modèle cible

Une entrée de catalogue unique :

```js
{
  slug, titre, court, description,
  domaine: 'nombres-calcul',            // id d'un domaine du programme (src/data/programme.js)
  competence: 'droite-numerique',       // facultatif : compétence ou étape du domaine
  genre: 'affiche' | 'fiche' | 'exercice' | 'bilan',
  niveaux: ['cp', 'ce1'],
  langues: ['fr'],                      // langues de contenu publiées
  generateur: 'affiche' | 'ecriture' | 'calcul' | 'nombres' | 'exercice',
  config: {…},
  lien: '/imprimer/…?…',                // « Personnaliser »
}
```

Il faut aussi un fichier `src/data/programme.js` qui sert de référence. Il contient :
- les domaines, par cycle, avec leur nom officiel et leur lien Éduscol ;
- pour chaque domaine, les compétences ou étapes et leur niveau d'introduction, par exemple « droite numérique
  0–100 : CP » ;
- les contraintes déjà relevées dans le TODO (champ numérique par niveau, pas de tableau de conversion, etc.).

Ce fichier sert à trois choses : ranger les fiches, afficher les liens vers le programme, et tester que les
options des formulaires respectent ces contraintes.

## Étapes

1. **Référentiel `programme.js`** :
   - relire les programmes (BO n° 41 du 31/10/2024 pour les cycles 1 et 2, BO n° 16 du 17/04/2025 pour le
     cycle 3) et les repères annuels Éduscol, qui n'ont pas encore été relus ;
   - écrire les domaines et les compétences avec leur source ;
   - effort : 1 jour, plus une relecture par un ou une enseignante (plan 07).
2. **Audit des activités** :
   - pour chaque exercice (22 vues) et chaque générateur, vérifier :
     - les compétences couvertes ;
     - que les options des formulaires restent dans le champ du niveau (nombres max, temps de conjugaison,
       fractions…) ;
     - ce qui manque ;
   - produire un tableau dans ce plan, puis corriger les options qui sortent du programme ;
   - ajouter des tests de contraintes dans `tests/logique.test.mjs`, par exemple : en CP, aucun nombre au-delà
     de 100.
3. **Un seul cadre d'affiche** (`src/impression/affiches/`) :
   - un `cadreAffiche({ titre, format, orientation, corps, css })` commun (marges, titre, échelle A3) ;
   - un module par famille : `alphabet`, `nombres`, `tables`, `droite`, `numeration`, `horloge`, `monnaie`,
     `conjugaison`, `formes` ;
   - `alphabet.js`, `nombres.js` (mise en page « affiches ») et `calcul.js` (mode affiche) délèguent à ce cadre ;
   - les fiches restent dans leurs générateurs ;
   - garde-fou : pour chaque slug existant, md5 des HTML identique ou différence justifiée, plus le test
     `tests/affiches.test.mjs`.
4. **Catalogue unique** (`src/impression/catalogue.js`) :
   - toutes les entrées au format cible, avec `domaine` et `genre` ;
   - `classer()` et `GROUPES` du build sont remplacés par un tri par domaine puis genre ;
   - **les slugs ne changent pas** : liens publiés et sitemap ;
   - un test vérifie que chaque entrée a un domaine connu de `programme.js`.
5. **Fiches prégénérées par compétence, puis bilan** :
   - pour les exercices, une fiche par compétence (au lieu de 4 variantes de « tout l'exercice »), puis une fiche
     **bilan** qui mélange les compétences de la classe ;
   - pour chaque domaine et chaque niveau, une **affiche résumé** de « ce qu'il faut savoir », générée à partir
     des compétences de `programme.js` ;
   - à valider avant de générer : la liste des compétences par exercice (sortie de l'étape 2).
6. **Affichage** :
   - `/imprimer` : une section par domaine, et dans chacune « 📘 Pour apprendre » (affiches), « ✏️ Pour
     s'entraîner » (fiches et exercices) et « ✅ Bilan » ;
   - le titre « 🖼️ Affiches à accrocher » disparaît ;
   - `/telechargements/` : mêmes sections, avec les filtres existants (classe, langue, usage) ;
   - les pages matières (Maths, Français) gardent leur grille d'exercices et ajoutent un lien vers les affiches
     du domaine ;
   - les liens vers le programme officiel viennent de `programme.js` (point du TODO).
7. **Nettoyage** :
   - supprimer la catégorie `programme`, `TELECHARGEMENTS_PROGRAMME` à part et la carte « Affiches du
     programme » ;
   - mettre à jour `README`, `CHANGELOG` et les tests de liens (`tests/statiques.test.mjs`).

## Vérification

- `npm test` : routes, liens, `affiches.test.mjs` (débordements), et les nouveaux tests de contraintes du
  programme.
- Aucun slug publié ne disparaît : comparer la liste des slugs avant et après, avec des redirections si l'un
  d'eux change malgré tout.
- Capture de `/imprimer` et de `/telechargements/`, en fr et en br.

## Ordre et effort

L'étape 1 conditionne le reste. Les étapes 2 et 3 peuvent se faire en parallèle : 3 agents (maths, français et
maternelle pour l'audit, plus le cadre d'affiche). Ensuite viennent les étapes 4 et 6, puis la 5, une fois les
compétences validées. Total : 3 à 4 jours.

## Décisions à prendre (utilisateur)

Plan validé le 2026-10-04. En attendant les réponses, on part sur : noms **courts** affichés (nom officiel en
lien), **garder** les 4 variantes tant que les fiches par compétence n'existent pas, bilan **par exercice et par
niveau**.


- Les noms des domaines affichés : noms officiels du programme (« Nombres, calcul et résolution de problèmes »)
  ou noms courts (« Nombres et calcul ») ?
- Fiches prégénérées : faut-il garder les 4 variantes actuelles de chaque exercice en plus des fiches par
  compétence, ou les remplacer ?
- Le bilan : une fiche par domaine et par niveau, ou par exercice et par niveau ?

## Étape 1 — résultat (2026-10-04)

Fichier créé : `src/data/programme.js` (données pures, s'importe avec node). Il contient 14 domaines, 102 compétences,
7 jeux de contraintes (un par niveau, de la MS au CM2), les sources, et les fonctions `domaineDe`, `competenceDe`,
`competencesDu(domaine, niveau)`, `contraintesDe(niveau)`, `nomOfficiel(domaine, niveau)` et
`lienProgramme(domaine, niveau)`. Chaque compétence et chaque contrainte a une `source` : texte, page du PDF, URL
`#page=` et extrait. Les interprétations sont marquées `interpretation`.

Les textes ont été relus en entier pour les parties citées :
- **BO n° 41 du 31/10/2024** : cycle 1 (langage et mathématiques), cycle 2 (français et mathématiques) ;
- **BO n° 19 du 07/05/2026** : programme complet du cycle 1, en vigueur à la rentrée 2026. Il renvoie au BO n° 41
  pour le langage et les mathématiques, et ajoute « Se repérer dans le temps et l'espace » (jours en MS, mois en GS) ;
- **BO n° 16 du 17/04/2025** : cycle 3, en vigueur au CM1 depuis 2025 et au CM2 depuis la rentrée 2026.

**Repères annuels Éduscol** : il n'existe plus de document séparé pour les nouveaux programmes. Selon Éduscol, ils
sont inclus dans les programmes sous forme d'objectifs annuels. Les programmes sont en effet écrits année par année,
et par âge au cycle 1.

### Contraintes du TODO : vérification

| Contrainte du TODO | Verdict | Texte officiel |
|---|---|---|
| Pas de tableau de conversion aux cycles 2 et 3 | ✓, **à nuancer** | Cycle 2 : aucun tableau de conversion. Cycle 3 : « un tableau peut être utilisé pour présenter les différentes unités… et leurs relations », mais pas pour effectuer des conversions. Une affiche des unités en tableau est donc permise au CM1-CM2 (`tableauUnites: true`). |
| Divisibilité : 2, 5 et 10 seulement | ✓ | CM1 et CM2. |
| Champ numérique : CP ≤ 100, CE1 ≤ 1 000, CM1 6 chiffres, CM2 9 chiffres | ✓, **complété** | CE2 ≤ 10 000. Au CM1, 4 chiffres au plus en périodes 1-2 ; au CM2, 6 chiffres au plus en périodes 1-2. Champ des problèmes au CP : ≤ 30 pour les problèmes en deux étapes et les problèmes multiplicatifs. Écriture en lettres au CP : jusqu'à 50. Cycle 1 : 6 en MS, 10 en GS (« voire au-delà »). |
| Fractions : CE1 moitié/demi/quart | **✗ corrigé** | Le CE1 commence par moitié, demi et quart, puis passe aux fractions unitaires et non unitaires de dénominateur **2, 3, 4, 5, 6, 8 ou 10**, toujours ≤ 1. |
| Fractions : CE2 dénominateur ≤ 12 et ≤ 1 ; CM1 ≤ 20 ; CM2 ≤ 60 | ✓, **complété** | Fractions décimales en plus : /100 au CM1, /100 et /1 000 au CM2. Fractions > 1 dès le CM1. Fraction d'une quantité : unitaire au CM1, quelconque au CM2. |
| Heure : CP heures entières ; dès le CE1 heures + minutes | **✗ corrigé** | CP : heures entières, aiguilles ≤ 12 h. **CE1 : heures entières, demi-heures, quarts d'heure seulement**, avec les heures > 12. **Minutes au CE2.** **Secondes au CM2**, pas au cycle 2. |
| Solides : CE2 cube, boule, pavé, cône, pyramide, cylindre (faces, sommets, arêtes) ; CM1 + prisme droit, patron du cube | **✗ corrigé** | La pyramide, les faces, les sommets et les arêtes arrivent **dès le CE1**. Le **patron du cube** est au **CE2**. Le CM1 ajoute le prisme droit, le CM2 le patron du pavé. CP : reconnaître cube, boule, cône, cylindre, pavé, en nommer trois. |
| Figures : CP disque, carré, rectangle, triangle ; cycle 3 + triangles particuliers, losange, trapèze, (CM2) pentagone, hexagone | **✗ corrigé** | **Cercle et triangle rectangle : CE1.** **Losange et symétrie : CE2.** CM1 : triangles isocèle et équilatéral, quadrilatère. **Trapèze, trapèze rectangle, pentagone, hexagone : CM2 seulement.** |
| Conjugaison : cycle 2 être/avoir + 1er groupe (4 temps) ; CM1 + 2e groupe et 8 irréguliers ; CM2 + passé simple, plus-que-parfait ; 6e impératif, conditionnel | **✗ corrigé** | **CP : être et avoir au présent seulement.** CE1 : être, avoir, 1er groupe aux 4 temps. **Les 8 irréguliers (faire, aller, dire, venir, pouvoir, voir, vouloir, prendre) : dès le CE2.** CM1 : + 2e groupe. CM2 : passé simple et plus-que-parfait de tous ces verbes. 6e : impératif et conditionnel présent (✓). |

Contraintes ajoutées (absentes du TODO) :
- pas de calculatrice au cycle 2, pas de calculatrice personnelle au cours moyen ;
- pas de tableau de proportionnalité au CM1-CM2 ;
- nombres décimaux : aucun au cycle 2 hors monnaie, centièmes au CM1, millièmes au CM2 ;
- monnaie : montants entiers ≤ 100 € au CP ;
- liste exacte des doubles et des moitiés à connaître du CP au CE2 ;
- opérations posées par année ;
- unités de mesure par année ;
- classes de mots par année ;
- fluence de lecture : 30, 70 puis 90 mots par minute ;
- cursive : majuscules au CE1.

**Homophones grammaticaux** (a/à, et/est…) : le terme n'apparaît dans aucun texte relu. Il n'y a que « homonyme »
dans la terminologie du cycle 3 et un « corpus de mots invariables » au CE1. Ils ne figurent donc pas dans les
compétences.

### 1. Correspondances avec ce qui existe

Routes de `activites.js` :

| Route | Niveaux | Domaine(s) | Compétences (`COMPETENCES`) |
|---|---|---|---|
| `/imprimer/ecriture` (fiche) | GS→CE2 | ecriture | geste-ecriture-maternelle, cursive, copie |
| `/imprimer/alphabet` (affiche) | MS→CE1 | lecture | nom-lettres |
| `/imprimer/calcul?mode=affiche` | CP→CM2 | nombres-calcul | tables-addition, tables-multiplication |
| `/imprimer/calcul?mode=fiche` | CP→CM2 | nombres-calcul | tables-addition, tables-multiplication, complement-dizaine, doubles-moities, ajouter-dizaines, ajouter-9, multiplier-10-100, sens-division, suites-nombres |
| `/imprimer/nombres?mise=affiches` | GS→CM2 | nombres-calcul | nombres-en-lettres, numeration-100, numeration-1000 |
| `/imprimer/affiches` | GS→CM2 | plusieurs | voir les affiches plus bas |
| `/maternelle/compter` | MS, GS | nombres-calcul | denombrer-6, denombrer-10 |
| `/maternelle/comparer` | MS, GS | nombres-calcul | comparer-quantites |
| `/maternelle/ordonner` | MS, GS | nombres-calcul | bande-numerique (interprétation : ranger des nombres) |
| `/maths/numeration` | CE1, CE2 | nombres-calcul | numeration-1000, numeration-10000, comparer-ranger, droite-graduee, suites-nombres, ajouter-dizaines |
| `/maths/calcul-mental` | CP→CM2 | nombres-calcul | tables-addition, tables-multiplication, doubles-moities, complement-dizaine, ajouter-dizaines, ajouter-9, multiplier-10-100, sens-division |
| `/maths/calcul-pose` | GS→CM2 | nombres-calcul | addition-posee, soustraction-posee |
| `/maths/tables` | CE1→CM2 | nombres-calcul | tables-multiplication |
| `/maths/fractions` | CE1, CE2 | nombres-calcul | fractions-unitaires, fractions-inferieures-1, fractions-egales, fractions-mesure, fraction-quantite |
| `/maths/problemes` | CE1, CE2 | nombres-calcul | problemes-additifs, problemes-multiplicatifs, problemes-etapes |
| `/maths/heure` | CE1, CE2 | grandeurs-mesures | heure-entiere, heure-demi-quart, heure-minutes, durees |
| `/maths/monnaie` | CE1, CE2 | grandeurs-mesures | monnaie-euros, monnaie-centimes |
| `/maths/mesures` | CE1, CE2 | grandeurs-mesures | longueurs, masses, contenances ; le calendrier n'a pas de compétence (voir écarts) |
| `/maternelle/formes` | MS, GS | espace-geometrie | formes-maternelle |
| `/maths/geometrie` | CE1, CE2 | espace-geometrie | figures-planes, solides, patrons, symetrie, tracer-figures, reperage-deplacements, angle-droit |
| `/maternelle/lettres` | GS, CP | lecture | nom-lettres |
| `/francais/dictee` | CP→CM2 | ecriture, vocabulaire | dictee, orthographe-lexicale |
| `/francais/orthographe` | CP→CM2 | vocabulaire, grammaire | orthographe-lexicale, accents-lettres, accords-gn (homophones : sans compétence) |
| `/francais/grammaire` | CE1, CE2 | grammaire | phrase, classes-mots, sujet-verbe, accords-gn |
| `/francais/conjugaison` | CE1→CM2 | grammaire | conjugaison-present-etre-avoir, conjugaison-4-temps, conjugaison-irreguliers, conjugaison-2e-groupe, radical-terminaison |
| `/francais/vocabulaire` | CE1, CE2 | vocabulaire | ordre-alphabetique, synonymes-antonymes, familles-mots |
| `/lecture` | CP→CE2 | lecture | decodage, comprendre-texte (syllabes-orales pour le mode syllabes) |
| `/autres` | CP→CM2 | aucun | culture générale, hors des programmes de français et de mathématiques |

Fiches et affiches du catalogue :

| Entrées (slugs) | Domaine | Compétences |
|---|---|---|
| `fiche-ecriture-lettre-*`, `fiche-ecriture-alphabet-*` | ecriture | cursive, copie, geste-ecriture-maternelle |
| `fiche-ecriture-chiffres` | ecriture (+ nombres-calcul) | cursive, denombrer-10 |
| `fiche-ecriture-jours-de-la-semaine-attache`, `…-mois-de-l-annee-attache` | ecriture (+ temps-espace) | cursive, jours-mois |
| `fiche-ecriture-nombres-en-lettres-attache` | ecriture (+ nombres-calcul) | cursive, nombres-en-lettres |
| `affiche-alphabet-*`, `cartes-alphabet-une-lettre-par-page` | lecture | nom-lettres |
| `nombres-francais-breton-*`, `affiches-nombres-francais-breton`, `nombres-en-breton-0-100`, `nombres-en-lettres-*` | nombres-calcul | nombres-en-lettres, numeration-100, numeration-1000 |
| fiches régionales (`fiche-ecriture-*-brezhoneg`, `affiche-alphabet-brezhoneg-*`…) | ecriture / lecture | cursive, nom-lettres. Le breton relève des langues vivantes et régionales, que nous n'avons pas relues. |
| `fiche-table-de-multiplication-*`, `fiche-tables-de-multiplication-*`, `fiche-toutes-les-tables…` | nombres-calcul | tables-multiplication |
| `affiche(s)-tables-de-multiplication-*`, `table-de-pythagore-multiplication` | nombres-calcul | tables-multiplication |
| `affiche-tables-d-addition`, `tableau-des-additions-0-a-10`, `fiche-tables-d-addition-cp` | nombres-calcul | tables-addition |
| `fiche-complements-a-10`, `…-a-100`, `…-dizaine-superieure` | nombres-calcul | complement-dizaine |
| `fiche-doubles-et-moities-cp`, `…-ce1` | nombres-calcul | doubles-moities |
| `fiche-additions-jusqu-a-20`, `fiche-additions-soustractions-ce1`, `fiche-calcul-mental-ce1` | nombres-calcul | tables-addition, ajouter-dizaines, complement-dizaine |
| `fiche-ajouter-retirer-10`, `fiche-ajouter-retirer-9-11` | nombres-calcul | ajouter-dizaines, ajouter-9 |
| `fiche-multiplier-par-10-et-100` | nombres-calcul | multiplier-10-100 |
| `fiche-divisions-combien-de-fois`, `fiche-divisions-tables-cm1` | nombres-calcul | sens-division, tables-multiplication |
| `fiche-suites-de-nombres` | nombres-calcul | suites-nombres |
| `affiche-droite-numerique-de-0-a-*` | nombres-calcul | droite-graduee, nombres-en-lettres |
| `affiche-tableau-numeration-*` | nombres-calcul | numeration-1000, numeration-6-chiffres, numeration-9-chiffres, decimaux |
| `affiche-horloge-heures-entieres`, `…-heures-minutes` | grandeurs-mesures | heure-entiere ; heure-demi-quart, heure-minutes |
| `affiche-monnaie-euros`, `…-centimes` | grandeurs-mesures | monnaie-euros ; monnaie-centimes |
| `affiche-conjugaison-<verbe>`, `…-passe-simple` | grammaire | conjugaison-4-temps, conjugaison-irreguliers, conjugaison-2e-groupe ; conjugaison-passe-simple |
| `affiche-formes-planes-cycle-1-2`, `affiche-figures-planes-cycle-3` | espace-geometrie | formes-maternelle, figures-planes |
| `affiche-solides-ce2`, `affiche-solides-cm1` | espace-geometrie | solides, patrons |

Les fiches d'exercices prégénérées (`scripts/telechargements.mjs`, chaque exercice × chaque classe) reprennent le
domaine et les compétences de la route correspondante.

### 2. Écarts repérés à première vue (à traiter à l'étape 2 ; rien n'est corrigé ici)

Options ou niveaux qui sortent du programme :
- **Heure** (`HeureView`) :
  - au CE1, la précision « 5 minutes » et les durées de 5, 10 ou 20 min sont proposées, alors que le CE1 s'arrête
    aux demi-heures et aux quarts d'heure ;
  - au CE2, les conversions avec les secondes (`min-s`, `minsec-s`, `s-min`) relèvent du CM2 ;
  - l'affiche `affiche-horloge-heures-minutes` est indiquée « CE1 · CE2 », alors que les minutes ne commencent
    qu'au CE2.
- **Mesures** (`MesuresView`) :
  - le CE1 propose les contenances et le litre, qui ne commencent qu'au CE2 ;
  - le calendrier (jours, mois) n'est pas dans le programme de mathématiques du cycle 2 : il relève de
    « Questionner le monde » (non relu), et au cycle 1 de `temps-espace` ;
  - le CE2 ne propose ni le dm ni la tonne.
- **Géométrie** (`GeometrieView`) :
  - au CE1, la symétrie et le losange sont proposés, alors qu'ils sont au programme du CE2 ;
  - au CE2, `trapeze_rectangle` apparaît dans les angles. Le trapèze rectangle est au CM2, mais il ne sert ici
    que d'exemple de figure : à juger.
- **Formes** (`FormesView`, MS/GS) : la liste contient cercle, losange, pentagone, hexagone et ovale. Le cycle 1
  ne prévoit que carré, rectangle, triangle et **disque**. Le texte demande aussi de distinguer les formes
  géométriques des formes non géométriques : l'ovale pose donc problème, et « cercle » devrait être « disque ».
- **Fractions** (`FractionsView`) :
  - au CE2, la droite graduée de 0 à 2 fait apparaître des fractions > 1, alors que le CE2 se limite à ≤ 1 (le texte
    cite pourtant « deux unités et un quart d'unité » en mesure de longueur : à trancher) ;
  - « le tiers de 9 », « le quart de 12 » (`partDe`) : une fraction utilisée comme opérateur est un objectif du CM1.
    « La moitié de » relève en revanche du calcul mental du cycle 2.
- **Conjugaison** :
  - `ConjugaisonView` n'a pas de niveau : dès le CE1, on peut choisir aller, faire, venir, pouvoir (CE2) et finir
    (CM1) ;
  - dire, voir, vouloir, prendre manquent, de même que le passé simple (CM2) ;
  - les affiches « 4 temps » sont indiquées « CE1 · CE2 · CM1 · CM2 » pour tous les verbes, y compris finir (CM1) et
    les irréguliers (CE2).
- **Calcul posé** : la route est indiquée GS→CM2 (et l'option « 1 chiffre (GS/CP) »), alors que le cycle 1 ne
  prévoit aucune opération posée. Le libellé « 4 chiffres (CM) » correspond au CE2.
- **Calcul** (`calcul.js`) : les plages (jusqu'à 1 000…) ne sont pas filtrées par niveau. Une fiche « additions
  jusqu'à 1 000 » reste possible au CP : à vérifier avec les contraintes `calculMentalMax`.
- **Tables** (`TablesView`) : les tables de 11 et 12 sont proposées. Le programme s'arrête à 10 × 10 ; c'est un
  complément acceptable, mais hors programme.
- **Affiches** :
  - `affiche-tableau-numeration-cm1` montre les millièmes, alors que le CM1 s'arrête aux centièmes ;
  - `affiche-figures-planes-cycle-3` (CM1 · CM2) contient trapèze, pentagone et hexagone, qui relèvent du CM2 seul ;
  - `affiche-droite-numerique-de-0-a-20` est indiquée GS · CP, alors que la bande numérique de GS va jusqu'à 10 ;
  - `affiche-solides-ce2` conviendrait aussi au CE1.
- **Nombres** : `nombres-en-lettres-0-100` et `nombres-francais-breton-0-100` sont indiqués dès le CP, alors que
  l'écriture en lettres attendue au CP va jusqu'à 50 ; `affiches-nombres-francais-breton` (jusqu'aux milliers) est
  indiqué dès le CP, dont le champ s'arrête à 100.

Compétences importantes sans activité :
- **CP** : aucune activité de numération jusqu'à 100 (`/maths/numeration` commence au CE1). L'heure entière et la
  monnaie en euros entiers n'ont qu'une affiche. Problèmes, géométrie, grammaire et vocabulaire n'ont pas de CP.
- **CM1-CM2** : fractions (> 1, d'une quantité), nombres décimaux, grands nombres (6 et 9 chiffres), multiplication
  et division posées, opérations sur les décimaux, aires, angles, périmètre, proportionnalité, probabilités,
  diviseurs et critères de divisibilité, compléments (COD/COI, CC), passé simple. Seules les tables, le calcul mental
  (sans décimaux), la dictée, l'orthographe et la conjugaison montent au CM.
- **Tous niveaux** : organisation et gestion de données (tableau, diagramme en barres, tableau à double entrée,
  dès le CP), motifs organisés (cycle 1), multiplication posée (CE2), comparaison et addition de fractions, phrase
  (ponctuation, types et formes), fluence de lecture.

### 3. Ce qui n'a pas pu être vérifié

- La page Éduscol des repères annuels (`eduscol.education.gouv.fr/6910/…`) et les pages HTML du BO renvoient
  une erreur 403 (Cloudflare). Le constat « repères inclus dans les programmes » vient d'un résultat de recherche.
  Les PDF des BO et des annexes ont, eux, été lus.
- Les « exemples de réussite » du cycle 3 en français (documents Éduscol séparés), les livrets d'accompagnement et
  « Questionner le monde » (cycle 2) n'ont pas été lus.
- Le passage par âge du cycle 1 aux classes (« à partir de 4 ans » = MS, « à partir de 5 ans » = GS) est une
  interprétation.
- Les unités intermédiaires (dam, hm, dag, hg, daL) au CM1 sont déduites de « du millimètre au kilomètre ».
- `lien` : il n'existe pas de page pour les parents par domaine. On renvoie à la page « Programmes et horaires » du
  cycle sur education.gouv.fr ; les pages Éduscol pour les enseignants sont dans `RESSOURCES`.
- Les niveaux des compétences « jusqu'au CM2 » (`depuis(…)`) supposent que la compétence est réinvestie ensuite,
  même quand le texte du cycle 3 ne la redit pas. Ce point est à relire avec un ou une enseignante (plan 07).
- Les activités n'ont été regardées que par leurs tableaux `NIVEAUX` et leurs listes d'options : pas de lecture
  complète des 22 vues (étape 2).

## Étape 2 — audit français (2026-10-04)

Périmètre : `src/views/francais/*.vue`, `LectureView`, `maternelle/LettresView`, `AutresView` (quiz), leurs entrées
d'`activites.js` et d'`EXERCICES` (`src/impression/exercices.js`, lu par `scripts/telechargements.mjs`). Référence :
`CONTRAINTES` et `COMPETENCES` de `programme.js`, et les textes eux-mêmes (BO n° 41 p. 85-94, programme de français
du cycle 3 p. 16-19) quand une notion n'est pas dans `programme.js` (compléments, phrase complexe, nom noyau).
Principe appliqué : un niveau ne propose que ce qui est au programme ; aucune option « bonus » n'existait dans ces vues.

| Vue | Niveau | Conforme | Corrigé | Manquant / à trancher |
|---|---|---|---|---|
| Conjugaison | CP | — | **Nouveau niveau** : être et avoir au présent | — |
| Conjugaison | CE1 | être, avoir, 1er groupe (chanter, jouer, parler, aimer) ; présent, imparfait, futur, passé composé | **Avant : aucun niveau**, finir, aller, faire, venir, pouvoir proposés dès le CE1. Ils ne le sont plus. | Radical et terminaison sont montrés (mode lacunes), mais pas d'exercice « trouver l'infinitif ». |
| Conjugaison | CE2 | + les 8 irréguliers | dire, voir, vouloir, prendre **ajoutés** (manquaient) | — |
| Conjugaison | CM1 | + 2e groupe (finir, grandir, choisir) | **Nouveau niveau** | Variations du radical des verbes en -cer, -ger, -eler, -eter, -yer (CM1) : `manger` a été retiré, car `conjugaison.js` ne sait pas écrire « nous mangions ». Accord du participe passé avec être : accepté (« allé(e)s »), mais pas travaillé. |
| Conjugaison | CM2 | + passé simple et plus-que-parfait | **Passé simple et plus-que-parfait ajoutés** (manquaient) | Accord du participe passé avec le COD. |
| Grammaire | CE1 | phrase, ordre, majuscule et point, types de phrases, négation, classes de mots du CE1 (nom, verbe, déterminant, adjectif, pronom), sujet, pronom sujet, genre et nombre, accord dans le GN, accord sujet-verbe | « Mettre au pluriel » : les noms en -eau et -eu (pluriel en -x) sont retirés, car le CE1 ne prévoit que -s ; le -x arrive au CE2 (BO n° 41 p. 94) | À trancher : « Accorder l'adjectif » contient encore *beaux* et des féminins irréguliers (*blanche*, *belle*, *gentille*, *neuve*). Manquent : radical, terminaison et infinitif ; nom propre et nom commun ; forme exclamative. |
| Grammaire | CE2 | négation (ne… pas / plus / jamais / rien), classes de mots, sujet, pronom, pluriels en -al/-aux et -ou/-oux, accords | **Retirés du CE2** : « Trouver le complément de phrase », « Où ? Quand ? », « Complément du verbe ou de phrase ? », « Phrase simple / complexe », « Nom principal du GN ». Le cycle 2 ne distingue pas les compléments (« l'étude des compléments circonstanciels est réservée au cycle 3 », BO n° 41 p. 91), et la phrase complexe ainsi que le nom noyau relèvent du cycle 3. Le CE2 garde ses fiches publiées (exercice par défaut : « Trouver le verbe »). | Manquent : l'adverbe (classe de mots du CE2), les types de phrases et la ponctuation (proposés au CE1 seulement), le discours rapporté. |
| Grammaire | CM1 | les exercices du CE2, plus nom noyau, complément de phrase, complément du verbe ou de phrase (« distinguer le complément d'objet du complément circonstanciel ») | **Nouveau niveau**, qui reprend les phrases du CE2 | Manquent : COD et COI, conjonctions de coordination, pronoms compléments, nom des déterminants (possessifs, démonstratifs), accord du participe passé. |
| Grammaire | CM2 | + compléments de lieu et de temps, phrase simple ou complexe | **Nouveau niveau** | Manquent : attribut du sujet, CC de cause, prépositions, conjonctions de subordination, complément du nom. |
| Vocabulaire | CE1 | ordre alphabétique, lettre avant/après, définitions, contraires, synonymes, familles, préfixes (les affixes commencent au CP), mot étiquette, intrus | — | — |
| Vocabulaire | CE2 | mots-repères du dictionnaire, sens dans la phrase, sens propre / figuré, suffixes | — | À trancher : « Homonymes ». Le mot est dans la terminologie du cycle 3 ; le cycle 2 parle de polysémie. Manquent : niveaux de langue, termes génériques et spécifiques au CE2 (« mot étiquette » n'est proposé qu'au CE1), et aucun niveau CP ni CM. |
| Dictée | CP | mots fréquents, déterminants, pronoms, « je mange » (le CP observe les formes verbales fréquentes et régulières) | — | — |
| Dictée | CE1 | corpus thématiques, mots invariables, adjectifs | — | À trancher : « Verbes courants » (*il fait, il dit, il voit, il vient, il prend, il peut, il veut*, ainsi que *il doit, il sait, il tient*). Ces irréguliers ne sont en conjugaison qu'au CE2 (et devoir, savoir, tenir ne font pas partie des 8). En dictée de mots, c'est plutôt de la mémorisation lexicale. |
| Dictée | CE2 | mots invariables, -tion, -eur, adverbes en -ment | — | — |
| Dictée | CM | vocabulaire des disciplines, connecteurs, mots savants | **Fiche prégénérée ajoutée** (`exercices-dictee-cm1-cm2`) | Un seul bouton « CM » pour CM1 et CM2. |
| Orthographe | sans niveau (CP→CM2) | lettres manquantes (CGP, h muet) : CP-CE1 | — | **Pas de niveau**. « Accords » propose sans distinction les pluriels en -eau, -eu, -al/-aux et *genou* (CE2) ; « Homophones » (a/à, et/est, on/ont, son/sont…) ne correspond à **aucun texte du programme relu** (gardé, voir plus bas). Pour ajouter des niveaux, la classe publiée `cp-cm2` doit rester : à décider. |
| Lecture | CP, CE1, « CE2+ » | syllabes, reconstitution de mots, textes à lire (décodage au CP-CE1) | — | Manquent : fluence (30, 70, 90 mots par minute), questions de compréhension, et une fiche prégénérée (absente d'`EXERCICES`). Le découpage de quelques mots est à relire (*nu-age*, *é-cole*, *ca-mi-on*). |
| Les lettres | GS, CP | nom des lettres, capitale et script | — | Manquent : la cursive (en GS, associer capitale, script et cursive), le son des lettres (GS-CP) et les confusions b/d, p/q. |
| Quiz (Autres) | CP→CM2 | — | — | Culture générale, hors des programmes de français et de mathématiques. Pas de domaine dans `programme.js` : rien à vérifier. |

Fiches prégénérées (`EXERCICES`) : nouvelles classes `conjugaison` CP, CE1, CE2, CM1, CM2, `grammaire` CM1 et CM2, et
`dictee` CM1→CM2. Aucune classe n'a été retirée, et les libellés des boutons existants n'ont pas changé.
`activites.js` : Conjugaison CP→CM2 (avant CE1→CM2), Grammaire CE1→CM2 (avant CE1, CE2).

Autres changements :
- `src/data/conjugaison.js` : nouvelle liste `AUTRES_VERBES` (jouer, parler, aimer, grandir, choisir), utilisée par
  l'exercice seulement ; les affiches suivent toujours `VERBES`. Nouvelle fonction `verbeDe()`.
- Conjugaison : la fiche contient 4 tableaux tirés au hasard (graine) parmi les verbes et temps cochés. Avant, c'était
  un tableau unique, toujours le même. Les verbes et temps sont désormais à choix multiples, et tout ce qui est au
  programme du niveau est coché par défaut.

Tests : `tests/programme-francais.test.mjs`, lancé par `npm test`.
- Conjugaison, à chaque niveau : les verbes et les temps proposés sont au programme, tous les temps et groupes du
  programme sont proposés, et les tableaux de la fiche restent au programme (3 graines).
- Grammaire, à chaque niveau, avec tous les exercices cochés : aucun exercice de compléments avant le CM1, ni de
  phrase complexe ou de CC de lieu et de temps avant le CM2.
- Grammaire CE1 : aucun pluriel en -x.

**Homophones grammaticaux** (Orthographe) : ils ne sont dans aucun texte relu. Voir « Décisions français » : ils sont
« pour aller plus loin » du CE2 au CM2 ; c'est à confirmer avec un ou une enseignante (plan 07).

## Décisions français (2026-10-04)

L'utilisateur ne tranche pas ces quatre points de l'audit français : ils sont décidés d'après les textes. Les numéros
de page sont ceux du PDF. Liens :
- BO n° 41 (cycle 2) : https://www.education.gouv.fr/sites/default/files/document/Bulletin%20officiel%20n%C2%B0%2041%20du%2031%20octobre%202024-404808.pdf
- programme de français du cycle 3 (BO n° 16) : https://www.education.gouv.fr/sites/default/files/programme-de-fran-ais-pour-le-cycle-3-439824.pdf
- exemples de réussite Éduscol, CM1 : https://eduscol.education.gouv.fr/sites/default/files/document/exemplesmiseenoeuvrecm1-francaispdf-111546.pdf
- exemples de réussite Éduscol, CM2 : https://eduscol.education.gouv.fr/sites/default/files/document/exemplesmiseenoeuvrecm2francaispdf-111540.pdf
- exemples de réussite Éduscol, 6e : https://eduscol.education.gouv.fr/sites/default/files/document/exemplesmiseenoeuvre6e-francaispdf-111534.pdf

Toutes ces sources sont dans `SOURCES` de `programme.js`.

### 1. Orthographe : des niveaux
- **Sources.**
  - CP, BO n° 41 p. 92 : marque du féminin « (+e) », marque du pluriel « (+s) », avec les exemples *deux lapins*,
    *une olive/des olives*, *un joli vélo/de jolis vélos*, *une boulangère/un boulanger*.
  - CE1, p. 93 : « pluriel en –s, féminin en –e ».
  - CE2, p. 94 : « pluriels irréguliers pour les noms (-x, -al/-aux) », féminin « quand [il s']entend » dans les
    adjectifs (*joyeux/joyeuse*).
  - Cycle 3, p. 16 : les pluriels irréguliers sont « stabilisés et complétés en fin de cycle 3 ».
  - Les mots irréguliers fréquents sont à mémoriser à partir du CE1 (p. 90).
- **Décision.**
  - Niveaux CP, CE1, CE2, CM1, CM2, plus un bouton « CP → CM2 » (tous les niveaux). Défaut : CE1, thème Accords.
  - Chaque question porte le niveau où elle entre au programme. Accords : -e et -s au CP-CE1, avec 9 questions
    nouvelles tirées des exemples du programme ; au CE2, on ajoute *blanche*, *grosse*, *beaux*/*châteaux*, -eau,
    -eu, -al/-aux et *genou*.
  - Lettres manquantes : *fait*, *hibou* et *clown* au CE1 (mots irréguliers), le reste au CP.
  - Changer de niveau revient au premier thème du programme de ce niveau.
- **Fiches.**
  - `exercices-orthographe-cp-cm2` est produite par le bouton « CP → CM2 » (`bouton: '^CP → CM2$'`). Elle garde le
    thème Homophones, toutes ses questions dans le même ordre et le même titre. Les tirages changent, parce que la
    page calcule d'abord la fiche CE1 avant le clic.
  - Nouvelles fiches : `exercices-orthographe-cp`, `-ce1` et `-ce2` (Accords). Le CM1 et le CM2 proposeraient les
    mêmes questions que le CE2, d'où pas de fiche pour eux.
- **Contraintes.** Nouvelles clés `pluriels` et `feminins` dans `CONTRAINTES`, pour chaque niveau du CP au CM2, avec
  leur source.

### 2. Homophones grammaticaux (a/à, et/est, on/ont, son/sont, ou/où, ce/se, mes/mais)
- **Recherche.** Mots-clés « homophone », « a / à », « et / est », « son / sont », « distinguer ». Textes fouillés :
  - BO n° 41, cycle 2 : p. 85-94 relues ;
  - programme du cycle 3 : p. 13-19 ;
  - exemples de réussite Éduscol du CM1, du CM2 et de 6e.
- **Résultat.** **Aucune occurrence.** Le seul « homophones » est en 6e (exemples 6e p. 11), pour des morphèmes :
  *-mane* / *-man*.
- **Historique.** Le programme du cycle 2 de 2015 les citait : « Homophones : les formes verbales a / est / ont / sont
  distinguées des homophones (à / et / on / son) » (copie de l'académie de Versailles,
  https://sti.ac-versailles.fr/IMG/pdf/c2.pdf, p. 23). Le programme consolidé de 2020 ne les cite plus (copie
  Mulhouse 1, https://circ-ien-mulhouse1.site.ac-strasbourg.fr/wp-content/uploads/2021/06/2020-07-C2.pdf, aucune
  occurrence).
- **Pratique.** Les manuels de 2025 les font toujours travailler au CE2. D'après des résultats de recherche (non
  vérifiés), ce sont « À portée de mots CE2 » (Hachette) et « En route pour la dictée CE2 » (Hatier). Les outils
  pour les distinguer sont, eux, au programme : être et avoir à l'imparfait dès le CE1 (p. 93), et les classes de
  mots.
- **Décision (option prudente, faute de texte).** Les homophones sont gardés, mais seulement en **« Pour aller plus
  loin (hors programme) »**, du CE2 au CM2. Ils sont absents au CP et au CE1, et ne sont jamais choisis par défaut.
  Ils restent aussi dans « CP → CM2 ».
- **Dans le code.** Nouvelle liste `HORS_PROGRAMME` dans `programme.js`, entrée `homophones-grammaticaux`, avec la
  recherche, les sources et l'interprétation. **À faire confirmer par un ou une enseignante** (plan 07).

### 3. Dictée CE1 : « Verbes courants »
- **Sources.**
  - Orthographe lexicale, CE1 p. 90 : « Mémoriser l'orthographe des mots réguliers et irréguliers fréquemment
    rencontrés ». Les exemples donnés sont des mots invariables (*tôt/aussitôt/plutôt*, *ici/là-bas*) et des lettres
    muettes : pas de formes verbales.
  - Conjugaison CE1, p. 93 : être, avoir et 1er groupe seulement.
  - CE2, p. 94 : les 8 irréguliers, et « Il orthographie correctement les formes verbales étudiées en situation de
    dictée ».
  - CE2, p. 91 : « mots irréguliers les plus fréquents ».
- **Décision.**
  - La catégorie est **déplacée au CE2**.
  - Elle se limite aux 8 verbes du programme : *il fait, il va, il dit, il voit, il vient, il prend, il peut,
    il veut*. *Il va* est ajouté, avec sa phrase.
  - *Il doit*, *il sait* et *il tient* sont retirés : devoir, savoir et tenir ne sont à aucun programme de
    conjugaison de l'école.
- **Fiches touchées.** La fiche `exercices-dictee-ce1` perd ces mots, et `exercices-dictee-ce2` les gagne.
- **Dans le code.** Interprétation notée sur la compétence `orthographe-lexicale`.

### 4. Vocabulaire CE2 « Homonymes » et Grammaire CE1 « Accorder l'adjectif »
- **Homonymes.**
  - Le mot « homonyme » est absent du BO n° 41 : le cycle 2 parle de polysémie (CP p. 88, CE2 p. 90-91).
  - Il figure dans la « Terminologie utilisée » du cycle 3 (programme du cycle 3 p. 16 : « synonyme, antonyme,
    homonyme, polysémie »).
  - Exemples CM1, p. 11 : « Il différencie des homonymes en s'appuyant sur la dérivation ou en ayant recours au
    dictionnaire, exemple : comte, comtesse/conte ».
  - **Décision.** L'exercice reste au CE2 (Vocabulaire n'a pas de niveau CM). Il est renommé **« Mots qui se disent
    pareil »** et porte la mention « pour aller plus loin » ; il n'était déjà pas dans les réglages par défaut
    (Contraires). Entrée `homonymes-ce2` dans `HORS_PROGRAMME`. À revoir si un niveau CM1 est ajouté au Vocabulaire.
- **Accorder l'adjectif, CE1.**
  - Source : p. 93, « pluriel en –s, féminin en –e ».
  - **Décision.** 11 groupes nominaux remplacés par des adjectifs réguliers. Sont retirés : *beaux*, *belle*,
    *blanche* (×2), *gentille*, *gentils*, *neuves*, *longue*, *longs*, *gros*, et les noms en -x (*yeux*,
    *cheveux*, *châteaux*). Le CE2 les avait déjà (*beau*, *blanc*, *long*, *nouveau*…).

### Tests ajoutés (`tests/programme-francais.test.mjs`)
- **Grammaire CE1.** Chaque réponse de « Accorder l'adjectif » est la forme de base, +e, +s ou +es (3 graines,
  15 questions).
- **Correction du test « pluriels en -s seulement ».** Il était sans effet : il cherchait `class="corrige"`, alors
  que le cadre écrit `class="corrige sur-page"`.
- **Orthographe, à chaque niveau.**
  - Les homophones ne sont jamais parmi les thèmes du programme. Ils sont en « plus loin » exactement aux niveaux de
    `HORS_PROGRAMME`.
  - Le thème par défaut est au programme.
  - Les accords respectent `pluriels` et `feminins` (3 graines, 15 questions).
  - « CP → CM2 » donne les homophones, sous le titre « Orthographe — Homophones ».
- **Dictée.** « Verbes courants » est absent au CE1, avec aucune forme *il fait / il dit…* sur la fiche ; il est
  présent au CE2, avec 8 mots.
- **Vocabulaire.** « Mots qui se disent pareil » n'apparaît qu'au CE2, avec la mention « pour aller plus loin », et
  n'est jamais coché par défaut ; le libellé « Homonymes » n'apparaît plus.

## Étape 3 — résultat (2026-10-04)

### Structure

`src/impression/affiches/` :
- `cadre.js` : le cadre commun.
  - `mesuresAffiche({ format, orientation, marge, hTitre, echelle })` donne la page, la marge, la hauteur du titre
    (× 1,41 en A3) et la zone W × H sous le titre ;
  - `pageAffiche({ marge, hTitre, titre, corps, style })` donne une page : bloc `.contenu` à la marge, `h1`, corps ;
  - `cadreAffiche({ titre, titreDocument, format, orientation, marge, hTitre, corps | pages, css, polices, centrer, ratioTitre })`
    écrit la police du texte, le CSS de base (`.contenu`, `h1`) et appelle `documentImpression`. Il renvoie
    `{ html, nbPages, format, orientation }` ;
  - les outils de dessin partagés : `COULEURS`, `cm`, `txt`.
- `catalogue.js` : données pures, importables avec node.
  - `DOMAINES_AFFICHES` : domaine de `programme.js` pour chaque famille ;
  - `AFFICHES_PROGRAMME` : les variantes et leurs niveaux ;
  - le contenu des variantes : `NUMERATION`, `LOTS_FORMES` (ids des dessins) ;
  - `TELECHARGEMENTS_PROGRAMME`, avec `domaine` et `genre: 'affiche'` ;
  - `niveauxConjugaison(verbe, temps)`, `TEMPS_PRESENT`, `choixTemps`.
- Un module par famille du programme : `droite`, `numeration`, `horloge`, `monnaie`, `conjugaison`, `formes`. Chacun
  exporte `titre(c)`, `dessin(c, W, H)` et son `css`. Le CSS est maintenant celui de la famille, et non plus celui de
  toutes les affiches.
- `tables.js` : le mode affiche de `calcul.js`, déplacé tel quel. `genererCalcul` y délègue, et les fiches de calcul
  restent dans `calcul.js`.

`affichesProgramme.js` n'est plus qu'un aiguillage : il normalise la config, choisit la famille et appelle le cadre.
Il réexporte ce qu'importent `AffichesView` et `api-build.js`, qui n'ont pas changé.

Ce qui passe par le cadre, et comment :
- **Affiches du programme** et **tables** : passent entièrement par le cadre (marge 10 mm et titre de 16 mm pour le
  programme, 12 et 14 pour les tables, × 1,41 en A3).
- **Alphabet** et **nombres** : leur corps a une mise en page à part (cartes de lettres, colonnes de nombres), qui
  reste dans `alphabet.js` et `nombres.js`. Ils n'utilisent le cadre que pour les pages, la marge, le titre et le
  document. On garde leurs valeurs :
  - marge fixe de 8 ou 10 mm, non agrandie en A3 ;
  - titre de 11/16 mm ou 14/20 mm ;
  - titre en haut de sa hauteur, contenu non centré (`centrer: false`).

  Les harmoniser avec les autres affiches changerait leur rendu : c'est à décider à part.
- La mise en page « fiche » de `nombres.js` utilise la même fonction de page que les affiches : elle passe donc aussi
  par le cadre, sans changement de rendu.

### Garde-fou : comparaison avant / après

Snapshot fait avant toute modification dans `/tmp/aff-avant/` : 71 affiches × 3 rendus (`generer(slug)`,
l'autre orientation, l'A3), soit 213 documents. Chaque `.page` a été capturée avant et après (`/tmp/aff/comparer.mjs`).
- **209 documents** : HTML différent, mais pixels identiques. Les différences sont le CSS propre à chaque famille et
  les blancs entre les balises. Le titre de l'alphabet est maintenant échappé (`'` → `&#39;`).
- `cartes-alphabet-une-lettre-par-page` : de 1 à 46 pixels d'écart d'une unité. C'est du bruit de rendu des emojis :
  le même HTML « avant », rendu deux fois, donne le même genre d'écart.
- `affiche-tableau-numeration-cm1` (× 3) : la colonne des millièmes a été retirée (correction voulue, voir plus bas).
  Vérifié en image.
- Un seul changement possible hors build : dans l'app, si l'on choisit une autre police script, le titre de l'affiche
  de l'alphabet la suit, comme celui des autres affiches. Il restait avant dans la police par défaut.
- `TEST_URL=… node tests/affiches.test.mjs` : 276 / 276 documents sans débordement, aucune erreur JS. Les 4 nouvelles
  affiches y sont comprises.
- Les vues `/imprimer/affiches`, `/imprimer/alphabet`, `/imprimer/nombres` et `/imprimer/calcul?mode=affiche` ont été
  vérifiées en fr et en br, ainsi que tous les boutons d'affiche et de variante : aucune erreur JS.
- `npm run i18n` : 0 problème.

### Niveaux corrigés (selon `programme.js`)

| Affiche (slug) | Avant | Après | Raison |
|---|---|---|---|
| `affiche-droite-numerique-de-0-a-20` | GS · CP | CP | la bande numérique de GS va jusqu'à 10 |
| `affiche-horloge-heures-minutes` | CE1 · CE2 | CE2 | les minutes sont au CE2 |
| `affiche-tableau-numeration-cm1` | CM1 | CM1, **sans les millièmes** | CM1 : centièmes au plus (`decimalesMax: 2`) |
| `affiche-figures-planes-cycle-3` | CM1 · CM2 | CM2 | trapèze, pentagone et hexagone sont au CM2 |
| `affiche-solides-ce2` | CE2 | CE1 · CE2 | les six solides, faces, sommets et arêtes : dès le CE1 |
| `affiche-conjugaison-finir` | CE1 → CM2 | CM1 · CM2 | 2e groupe au CM1 |
| `affiche-conjugaison-<irrégulier>` (8 verbes) | CE1 → CM2 | CE2 · CM1 · CM2 | les irréguliers sont au CE2 |
| `affiche-conjugaison-etre`, `-avoir`, `-chanter` | CE1 → CM2 | inchangé | 4 temps dès le CE1 |
| `affiche-conjugaison-*-passe-simple` | CM2 | inchangé | |
| `nombres-francais-breton-0-100`, `nombres-en-breton-0-100`, `nombres-en-lettres-0-100` | CP · CE1 · CE2 | CE1 · CE2 | en lettres : 50 au plus au CP |
| `nombres-francais-breton-50-60` … `-90-100` | CP · CE1 | CE1 · CE2 | idem |
| `affiches-nombres-francais-breton`, `nombres-en-lettres-dizaines-centaines` | CP/CE1 → CE2 | CE2 | la page des milliers va jusqu'à 9 000 (CE1 : 1 000) |

Les niveaux de conjugaison sont calculés par `niveauxConjugaison(verbe, temps)`. Les descriptions qui citaient un
niveau ont été mises à jour, ainsi que le titre et le titre court de `affiche-figures-planes-cycle-3` (« (CM2) »).

**Nouveaux slugs** (aucun slug n'a disparu : 75 affiches, contre 71) :
- `affiche-horloge-quarts-demies` (CE1) : variante `horloge/quarts`. Grande aiguille sur 12, 3, 6, 9, heures de
  l'après-midi, sans la couronne des minutes ;
- `affiche-figures-planes-cm1` (CM1) : variante `formes/plan-cm1`, les figures du cycle 3 sans le trapèze, le
  pentagone et l'hexagone ;
- `affiche-conjugaison-etre-present`, `affiche-conjugaison-avoir-present` (CP · CE1) : le présent seul. Sur ces
  affiches, la légende ne parle pas de l'auxiliaire. Sur `/imprimer/affiches`, il y a un troisième choix de temps,
  « Présent seul (CP) » (`?temps=present`, breton marqué « à relire »).

**Tests** (bloc ajouté à la fin de `tests/logique.test.mjs`) :
- chaque famille d'affiches et chaque affiche du catalogue (alphabet, nombres, programme) a `genre: 'affiche'` et un
  `domaine` connu de `programme.js` ;
- le contenu des affiches du programme est permis à chaque niveau indiqué :
  - droite : nombre max ≤ `nombreMax` ;
  - numération : décimales et chiffres permis ;
  - horloge : précision de lecture ;
  - monnaie : centimes ;
  - conjugaison : verbe et temps ;
  - formes : figures et solides de l'année ;
- les niveaux des variantes (page `/imprimer/affiches`) sont égaux à ceux du catalogue ;
- les affiches des nombres ne dépassent pas l'écriture en lettres attendue à chaque niveau.

Les affiches des tables (dans `calcul.js`, que node ne peut pas importer) prennent leur domaine dans
`DOMAINES_AFFICHES.tables`, qui est vérifié.

### Pour l'étape 4

- `scripts/telechargements.mjs` (non modifié) :
  - `classer()` peut maintenant utiliser `genre` et `domaine`, au lieu de `categorie` et de la regex sur le slug des
    tables (`/^(affiches?|table-de-pythagore|tableau-des|cartes)-/`) ;
  - `GROUPES` peut devenir un tri par domaine puis par genre ;
  - les 4 nouveaux slugs y entrent tout seuls (rubrique « programme ») : vérifier leurs pages et le sitemap au
    prochain build.
- Les fiches (`categorie` ecriture et calcul hors affiches) n'ont pas encore de `domaine` ni de `genre`.
- Les affiches n'ont pas de `competence` : on pourra la reprendre du tableau de l'étape 1.
- Ce qui manque désormais, à voir avec l'étape 5 (affiches résumé) :
  - la GS n'a plus de droite numérique : une bande numérique 0–10 serait à créer ;
  - le CP n'a plus d'affiche des nombres en lettres au-delà de 50 : variante 0–50, ou unités + 10–20 ;
  - il n'y a pas d'affiche de figures pour le CE1 (cercle, triangle rectangle) ni pour le CE2 (losange).

## Étape 2 — audit maths (2026-10-04)

Vues lues en entier : `src/views/maths/*.vue` et `src/views/maternelle/{Compter,Comparer,Ordonner,Formes}View.vue`,
comparées à `CONTRAINTES` et `COMPETENCES`. Légende : ✓ conforme, **corrigé** (le défaut ne sort plus du programme),
bonus (hors programme, libellé « bonus » / « Pour aller plus loin », jamais par défaut), manque (à faire plus tard).

| Vue | Niveau | Conforme | Corrigé | Manque |
|---|---|---|---|---|
| Compter | MS, GS | ✓ 1–6 (MS), 1–10 (GS) | | composer / décomposer, petits problèmes (réunir, partager) |
| Comparer | MS, GS | ✓ ≤ 5 (MS), ≤ 10 (GS) | | |
| Ordonner | MS, GS | ✓ 1–5 (MS), 1–10 (GS), bande numérique | | |
| Formes | MS/GS (pas de niveau) | carré, triangle, rectangle | **« cercle » → « disque »** (forme pleine) ; **losange, pentagone, hexagone, ovale retirés** ; le jeu tire 8 questions (chaque forme deux fois) au lieu de 8 formes | pas de bouton MS / GS : le rectangle est attendu à 5 ans seulement ; solides du cycle 1 |
| Calcul mental | CP | ✓ + et − ≤ 20, compléments à 10, doubles 1–10, moitiés 2–20 | | stratégies du CP (complément à la dizaine, ± 10, + 9) : `strat: null` |
| Calcul mental | CE1 | ✓ ≤ 1 000, tables 2, 3, 4, 5, 10, pas de division | **× 100 retiré** (CE2) : le bouton devient « × 10 » | |
| Calcul mental | CE2 | ✓ ≤ 10 000, × 10 et × 100, division « combien de fois » | | |
| Calcul mental | CM1, CM2 | entiers, tables jusqu'à 12 et 25 en calcul (pas de contrainte chiffrée au cycle 3) | | décimaux, × et ÷ par 10, 100, 1 000 d'un décimal |
| Calcul posé | (tailles) | ✓ 2 chiffres ≤ 99, 3 chiffres ≤ 999, 4 chiffres ≤ 9 999 | **plus de GS** (`activites.js` : CP → CM2, aucun slug publié en GS) ; libellés « 1 chiffre (CP) », « 2 chiffres (CP / CE1) », « 3 chiffres (CE1 / CE2) », « 4 chiffres (CE2 / CM) » (avant : GS/CP, CP, CE, CM) ; aide « au CP : additions seulement » | pas de niveau : la soustraction reste possible avec « 2 chiffres » (signalée, pas bloquée) ; multiplication posée (CE2), division (CM1), décimaux (CM) |
| Tables | CE1 → CM2 | ✓ tables de 1 à 10 | « Toutes » = 1 à 10 | bonus : × 11, × 12 et « jusqu'à × 12 » (« Pour aller plus loin ») |
| Les nombres | CE1 | ✓ ≤ 1 000 | | CP (≤ 100) : aucune activité |
| Les nombres | CE2 | ✓ ≤ 10 000 | | |
| Problèmes | CE1 | ✓ ≤ 20 / 100 / 1 000, tables 2, 3, 4, 5, 10 | | |
| Problèmes | CE2 | ✓ ≤ 100 / 1 000, « fois plus » | | champ jusqu'à 10 000 ; trois étapes ; CP (≤ 30) |
| Fractions | CE1 | ✓ dénominateurs 2, 3, 4, 5, 6, 8, 10, fractions ≤ 1 | **« le tiers de », « le quart de » retirés** (fraction d'une quantité : CM1) ; reste « la moitié de » (calcul mental) | comparer, additionner des fractions de même dénominateur |
| Fractions | CE2 | ✓ fractions égales, droite graduée, dénominateurs ≤ 10 | **droite de 0 à 2 retirée** (fractions > 1 : CM1) et distracteurs > 1 filtrés ; **« Plus ou moins que 1 ? » retiré** (fractions > 1) ; **tiers, quart, cinquième, dixième de… retirés** | dénominateurs 7, 9, 12 ; comparer, additionner ; CM1-CM2 (fractions > 1, d'une quantité, décimales) |
| Heure | CE1 | ✓ heures, demies, quarts, heures > 12, durées en quarts d'heure | « 5 minutes » devient bonus (libellé « 5 minutes (bonus) », aide affichée au CE1 seulement, jamais par défaut) ; distracteurs des QCM à la précision choisie (avant : « 3 h 20 » parmi des quarts d'heure) | CP (heures entières) : aucune activité |
| Heure | CE2 | ✓ minutes, durées, emploi du temps | **conversions en secondes retirées** (CM2) : « h, min, s » → « h et min », rappel « 1 min = 60 s » et titre « Heures, minutes, secondes » retirés de la fiche | |
| Monnaie | CE1, CE2 | ✓ euros et centimes, ≤ 99 € (CE1), ≤ 199 € (CE2) | | CP (euros entiers ≤ 100) : aucune activité |
| Mesures | CE1 | ✓ m, cm, km, g, kg, 1 kg = 1 000 g, règle en cm | **contenances retirées** (exercice grisé, litre retiré de « Unité adaptée ») | |
| Mesures | CE2 | ✓ mm, cm, m, km, g, kg, L, dL, cL | | dm, tonne ; périmètre |
| Mesures | calendrier | — | gardé, libellé « 📅 Calendrier (hors programme de maths) » : il relève de « Questionner le monde », et `temps-espace` n'existe qu'au cycle 1 | |
| Géométrie | CE1 | ✓ carré, rectangle, triangle, triangle rectangle, cercle ; solides avec faces / sommets ; repérage, reproduction | **symétrie et losange retirés** (CE2) ; passer d'un niveau à l'autre garde « tous les exercices » (la fiche CE2 garde la symétrie) | angle droit, tracés à l'équerre |
| Géométrie | CE2 | ✓ losange, symétrie, angles droits, cercle (rayon, diamètre), patrons du cube | | `trapeze_rectangle` (CM2) sert de quadrilatère dans « Angles droits » sans être nommé : jugé conforme |

Tests :
- `tests/programme-maths.test.mjs` (ajouté à `tests/lancer.mjs`) : 33 cas (exercice × niveau × options), 5 graines
  chacun. Il lit le texte de la fiche et vérifie, d'après `CONTRAINTES` : `nombreMax` / `calculMentalMax`, la précision
  de l'heure et l'absence de secondes, les fractions du corrigé (dénominateurs, ≤ 1, pas d'opérateur), les unités de
  contenance, les figures nommées et la symétrie, l'absence de tables > 10 et de × 100 au CE1. Avant les corrections,
  il signalait bien les écarts (formes, × 100, fractions, secondes, litre, losange).
- `tests/logique.test.mjs` : chaque activité de maths a au moins une compétence de son domaine à chacun de ses niveaux,
  reste dans son cycle (maternelle / école), et le calcul posé ne commence qu'avec `operationsPosees`.

Fiches prégénérées (`src/impression/exercices.js`) : aucune classe perdue, aucun bouton de niveau renommé (`^2`, `^3`,
`^4` du calcul posé correspondent toujours). Le contenu change : en-tête « Calcul posé — CP / CE1 » (avant « CP ») et
« CE2 / CM » (avant « CM ») ; heure CE2 sans secondes ; mesures CE1 sans contenances ; géométrie CE1 sans symétrie ;
fractions sans « tiers de » ; formes avec le disque.

## Étapes 4 et 6 — résultat (2026-10-04)

### Catalogue (étape 4)

Chaque entrée de téléchargement a maintenant `domaine` (id de `programme.js`) et `genre` :
- `catalogue.js` : fiches d'écriture (y compris régionales) → `ecriture` / `fiche` (constante `ECRITURE`) ; alphabet et
  nombres → affiches (déjà fait à l'étape 3). La catégorie `programme` de `CATEGORIES` est supprimée (elle n'avait ni
  texte ni intro) ; `categorie` reste dans les entrées (générateur, intro des pages).
- `calcul.js` : fiches → `nombres-calcul` / `fiche`, affiches des tables → `affiche`.
- `exercices.js` : `EXERCICES` reçoit `genre: 'exercice'` et le `domaine` de l'activité de même route
  (`activites.js`) ; `null` pour le quiz (culture générale, hors programme). Le fichier importe `activites.js`
  (données pures) : il reste lisible par node.
- `activites.js` : `domaine` est maintenant un id de `programme.js`. L'ancien texte devient `rubrique` (titres des
  groupes des pages matières, inchangés ; `DOMAINES_BR` garde ses clés). Correspondances : Problèmes →
  `nombres-calcul`, Lettres et sons → `lecture`, Dictée → `ecriture`, Orthographe → `vocabulaire`, `/lecture` →
  `lecture`. Les cartes « À imprimer » ont un domaine ; la carte « Affiches du programme » devient `resume` (accueil
  seulement) et 6 cartes `detail` la remplacent sur `/imprimer`, une par famille (`/imprimer/affiches?affiche=…`).
- `scripts/telechargements.mjs` : `classer()` ne fait plus que `genre` → usage (`affiche` → apprendre, `fiche` et
  `exercice` → s'entraîner) et refuse un domaine ou un genre inconnu ; `GROUPES` et la regex sur les slugs sont
  supprimés. `trier()` range par domaine (maths, puis français, puis le reste, ordre de `DOMAINES`), puis par genre,
  en gardant l'ordre du catalogue. `fiches.json` donne `domaine` et `genre` (plus `groupe`).
- Noms courts : `src/i18n/fr/domaines.js` (tiré de `programme.js`) et `src/i18n/br/domaines.js` (tout marqué
  « à relire » ; ceux des pages matières repris de `DOMAINES_BR`).

### Affichage (étape 6)

- `/imprimer` : une section par domaine (Nombres et calcul, Grandeurs et mesures, Espace et géométrie, Lecture,
  Écriture, Vocabulaire, Grammaire et conjugaison, puis Culture générale). Titre = nom court (nom officiel en
  infobulle) + petit lien « programme officiel ↗ » (`lienProgramme`, pour la classe choisie, sinon cycle 2). Dans
  chaque section : « 📘 Pour apprendre » (affiches, dont les familles de `/imprimer/affiches`), « ✏️ Pour
  s'entraîner » (générateurs de fiches, puis exercices en mode impression). Le titre « 🖼️ Affiches à accrocher » et la
  carte « Affiches du programme » ont disparu de cette page.
- `/telechargements/` : mêmes sections (`section.domaine`, ancre = id du domaine), chacune avec « Pour apprendre »
  et « Pour s'entraîner » ; filtres classe, langue, usage et recherche inchangés (les sections vides se cachent).
  Lien « programme officiel » par adresse (une pour la maternelle, une pour l'élémentaire, avec les classes
  concernées). Page d'une fiche : fil d'Ariane vers le domaine, ligne « 📚 Domaine : … — programme officiel », données
  structurées `educationalAlignment` ; fiches voisines du même domaine.
- Pages Maths et Français : sous la première rubrique de chaque domaine, une ligne discrète « 📘 Affiches à
  imprimer : … » vers les affiches du domaine.

### Vérifications

- Slugs : catalogue avant/après (`window.__ecolePrimaire.catalogue(['fr','br'])` + `EXERCICES`) : 0 disparu, niveaux
  et langues identiques. Builds `--sans-exercices` ecoleprimaire et skoolik comparés aux `dist-*` du déploiement :
  aucun dossier ni URL de sitemap disparus (118 et 78 URL hors exercices). Les 6 slugs `exercices-orthographe-cp|ce1|ce2`
  (+ breton) sont nouveaux : ils viennent du travail en cours sur l'orthographe, pas de ces étapes.
- `npm run i18n` : 0 problème. `npm test` : tout passe. Nouveaux tests : `logique` (domaine et genre du catalogue, des
  exercices et des activités) ; `statiques` (fiches.json complet, calcul compris ; sections et filtre d'usage de
  l'index ; domaine sur la page d'une fiche ; `/imprimer` par domaine, affiches sans lien vers une fiche, liens
  « programme officiel », liens vers les affiches de la page Maths).
- Captures regardées : `/imprimer` fr, br et CP, Maths, Français, accueil (aucune erreur JS) ; `/telechargements/` fr
  et br, page d'affiche (horloge) fr, page de fiche bretonne (table de 7).

### Reste

- Étape 5 : fiches par compétence, bilan, affiches résumé (aucun « Bilan » pour l'instant dans les sections).
- Étape 7 : supprimer la carte `resume` de l'accueil, `TELECHARGEMENTS_PROGRAMME` à part et `categorie: 'programme'`
  des entrées ; README, CHANGELOG.
- Breton à relire : noms des domaines, cartes des familles d'affiches, nouveaux textes des pages statiques.
