# Plan 15 — Ceintures de compétences (réflexion)

Statut : **idée à discuter**, rien n'est codé. Maquettes : `brouillons/ceintures/maquettes.html` (hors git ; à ouvrir dans un navigateur).

## 1. Ce que c'est

Une progression par paliers de couleur (ceintures de judo) : chaque ceinture = une liste précise de savoir-faire, validée par un **brevet**
quand l'élève se sent prêt, à son rythme. On valide, on ne note pas. Origine : pédagogie Freinet (brevets et ceintures) ; très répandu en
calcul mental, tables, lecture, orthographe, et en « ceintures de comportement ».

## 2. Ce que font les autres (recherche du 2026-10-12)

Aucun standard : chaque enseignant·e ou éditeur choisit. Les cas trouvés :

| Source | Couleurs | Mécanique |
|---|---|---|
| Livrets de calcul mental de collège (5e, 3e) | blanche, jaune, orange, verte, bleue, marron, noire, + rouge (8) | 8 séries de 5 capacités, chaque série sur 10 points ; cumul des points → ceinture ; une erreur permise par évaluation |
| Fichier de calcul mental CM1-CM2 (Retz) | 11 ceintures | une évaluation toutes les 2 à 3 séquences |
| Fiches « ceintures de calcul CM1 » d'un enseignant | rose, jaune, orange, verte, bleue, violette (6) | une fiche + un corrigé par ceinture |
| Ceintures de classe (général) | judo | l'élève s'inscrit au test quand il veut ; tests à part des ateliers |
| Évaluations repères du ministère (pas des ceintures) | — | CE1 : 10 calculs ; CM1 : 30 questions en 3 min ; lecture des résultats par tranches |

**Choix proposé** : palette par défaut « judo » en 7 (blanche, jaune, orange, verte, bleue, marron, noire), palettes de rechange (8 avec la
rouge, 6 rose → violet, et une version **sans couleur** : paliers 1 à 5, pour le contraste et le daltonisme). Le **nom de la couleur est
toujours écrit** à côté de la ceinture. Le nombre de ceintures d'une piste est libre (de 3 à 8) : on prend les premières de la palette.

Sources : <https://www.icem-freinet.fr/archives/educ/63-64/18-juin64/20-22.pdf>, livrets de 5e et 3e sur mathsmentales.forge.apps.education.fr,
<https://www.calameo.com/les-editions-retz/books/0061208071ad1cca12e0a>, <https://chezmonsieurpaul.org/wp-content/uploads/2022/03/Ceintures-de-calcul-CM1-2-Ceintures-corriges.pdf>.

## 3. Modèle de données

Une **piste** (en anglais dans le code ? non : en français comme le reste, `Piste`) :

```ts
interface Piste {
  id: string                       // 'tables-multiplication'
  portee: 'exercice' | 'competence' | 'domaine' | 'matiere'
  cible: string                    // id de l'exercice, de la compétence (programme.ts), du domaine ou de la matière
  ceintures: Ceinture[]            // dans l'ordre ; la couleur vient de la palette choisie, pas de la piste
  seuil?: number                   // sinon le seuil par défaut du réglage
}
interface Ceinture {
  objectifs: string[]              // « ce que je sais faire » (clés de texte)
  reglages: Record<string, unknown> // réglages d'exercice du brevet (ex. { tables: [6, 7] }), validés par `definir`
  nbQuestions?: number
}
```

La **portée configurable** vient de ce que le site sait déjà : un exercice (`src/exercices/<id>`), une compétence
(`src/data/programme.ts`), un domaine, une matière. Pour une portée large (domaine, matière), une ceinture n'a pas de réglages
propres : le brevet pioche dans les exercices dont les compétences sont dans la portée (`competences` de `definition.ts`).

**Pistes fournies** (dans le code, comme `confiance.ts`) : quelques pistes prêtes (tables, calcul mental, lettres, nombres jusqu'à 10…).
**Pistes de l'enseignant·e** : créées dans les réglages, stockées sur l'appareil (phase 4).

## 4. Stockage et export (appareil seulement)

- Clés `ep_ceintures` (état) et `ep_ceintures_reglages` (palette, seuils), via `chargerReglages` / `sauvegarder` (jamais de `charger` brut).
- État : par piste et par profil local, `{ ceinture: n, essais: [{ le, note, sur }] }`. Pas de nom, pas d'identifiant.
- **Plusieurs enfants sur un appareil** : « profils locaux » (prénom libre, choisi par l'utilisateur, jamais envoyé). À décider : en V1, un seul profil.
- **Export** : fichier `.json` versionné (`{ version, exporteLe, pistes }`), téléchargé par le navigateur. **Import** : validé (schéma, bornes),
  fusion « le plus avancé gagne » ou remplacement, au choix. Dans l'esprit de `tests/memorises` : des données corrompues ne cassent rien.
- Aucune requête réseau : la promesse de vie privée est tenue (test `vie-privee`).

## 5. Seuils et brevets

- Défaut : 9 sur 10 (une erreur permise, comme les livrets de collège). Réglable : seuil, nombre de questions (5 à 30), chronomètre (aucun / doux / strict),
  délai avant de repasser (0 par défaut). Les valeurs des évaluations repères (CE1 : 10 calculs, CM1 : 30 en 3 min) sont proposées en préréglage.
- Un brevet = le moteur de jeu existant (`useJeu`, `generer` de l'exercice) avec les réglages de la ceinture, sans aide. Un « pas encore »
  n'est jamais un échec (message : « 7 sur 10 : encore un peu d'entraînement »).
- Un brevet **papier** : une fiche (`documentFiche`) avec le corrigé ; l'enseignant·e coche ensuite dans le livret. C'est ce qui fait le lien avec les fiches.

## 6. Écrans (maquettes)

1. « Mes ceintures » : cartes par piste, filtre par portée, imprimer / exporter / importer.
2. Détail d'une piste : l'échelle, les objectifs de chaque ceinture, le brevet.
3. Brevet et réussite : l'écran de jeu, la ceinture qui se noue.
4. Livret à imprimer : cases à cocher et dates.
5. Réglages : seuils, palette, données.

Où : route `/ceintures` (+ entrée dans le menu seulement si le suivi est activé), onglet « Ceintures » dans les réglages.

## 7. Phases proposées

1. **Socle** (`src/ceintures/`) : types, état + stockage + export/import, tests node (corruption, bornes). Aucune interface.
2. **Une piste, un exercice** : tables de multiplication (ou calcul mental) de bout en bout : brevet via `useJeu`, page « Mes ceintures », réussite.
3. **Livret imprimable** et brevet papier (`src/ceintures/fiche.ts`, instantanés).
4. **Portées plus larges** (compétence, domaine, matière) et pistes de l'enseignant·e ; réglages complets (palette, seuils).
5. **Breton** (noms de couleurs : gwenn, melen, orañjez, glas… à vérifier, `// br: à relire`) et passage de la grille de confiance.
6. Regards critiques (`docs/critiques/`) : enfant de CE1, enseignant·e ; en particulier l'effet « classement » et la frustration d'un « pas encore ».

## 8. Questions ouvertes

- Par où commencer : tables, calcul mental, lettres (GS) ? (reco : tables ou calcul mental, ce sont les plus utilisées en classe)
- Ceinture = **maîtrise d'une liste d'objectifs** (pistes fournies) ou **cumul de points** (comme les livrets de collège) ?
- Plusieurs profils d'enfants sur l'appareil, ou un seul en V1 ?
- Mode enseignant (caché aujourd'hui) : créer des pistes, voir une classe ? Sans serveur, une « classe » = des fichiers exportés à rassembler : utile ou hors sujet ?
- Récompenses : seulement la ceinture, ou aussi des « souvenirs » (dates, carnet) ? Éviter tout classement entre élèves.
- Accessibilité : la ceinture ne doit jamais dépendre de la couleur seule (nom écrit, palette sans couleur).
- Un exercice sans réglage de difficulté se prête-t-il à des ceintures ? (liste des exercices candidats à établir)

## 9. Focus impression (demande du 2026-10-12)

Maquettes : `brouillons/ceintures/maquettes-impression.html`. Six supports, tous des fiches ou des affiches du site (aucune donnée saisie) :

| Support | Public | Type | Contenu |
|---|---|---|---|
| A. Livret de la piste | l'élève | fiche A4 portrait | une ligne par ceinture : couleur et nom, objectifs à cocher, date, signature ; cadre « comment faire » |
| B. Brevet papier | élève, enseignant·e | fiche A4 + corrigé | tirage du générateur (graine, « Nouvelle fiche »), seuil et durée écrits, cadre « résultat / validée / pas encore », corrigé à l'envers |
| C. Tableau de la classe | enseignant·e | affiche A4/A3 paysage | une ligne par élève (vide ou prénoms), une colonne par ceinture, ronds à colorier ; option « sans prénoms » pour réutiliser |
| D. Ceintures à découper | l'élève | fiche A4 | bandes à coller sur le livret ou le tableau, prénom et date à écrire |
| E. Diplôme | l'élève | fiche A4 | une ceinture, une page, à emporter |
| F. Passeport | l'élève | carte 86 × 54 mm (4 par feuille) | la ceinture atteinte de chaque piste, à plier ou plastifier |

Décisions à prendre / contraintes :

- **Noir et blanc d'abord.** Beaucoup d'écoles impriment en noir : chaque ceinture a un **motif** (blanche : unie, jaune : rayures, orange : hachures, verte : points,
  bleue : lignes, marron : gris, noire : plein) et son **nom écrit**. Réglage « Couleur / Noir et blanc » comme pour le lignage de l'écriture ; défaut : couleur.
  Dans les deux cas `print-color-adjust: exact`, sinon les couleurs sautent à l'impression (vu sur « formes », 2026-10-12).
- **La ceinture est un dessin SVG**, partagé (`src/ceintures/dessin.ts`, pur) : ruban + nœud, couleur ou motif, taille libre ; pas d'emoji (règle `src/images/`).
- **Brevet = fiche d'un exercice existant.** Le brevet papier appelle `fiche.ts` de l'exercice avec les réglages de la ceinture, puis ajoute le gabarit
  (en-tête, seuil, cadre de résultat) : pas de nouveau générateur. Les exercices qui n'ont pas de fiche n'ont pas de brevet papier.
- **Slugs** : de nouvelles pages `/telechargements/<slug>/` (livret, brevet, tableau…) ; ils ne changent plus ensuite. Une fiche par piste × support serait trop : prévoir
  des fiches « génériques » (le tableau, les bandes, le diplôme, le passeport : on choisit la piste dans le formulaire) et des fiches par piste fournie (livret, brevets par ceinture).
- **Une feuille par support, A4**, sans débordement (`tests/fiches-debordement`, `tests/affiches`), instantanés comme les autres fiches.
- **Breton** : mêmes supports en breton (noms des couleurs, « Pas encore »…), marqués `// br: à relire`, soumis à la grille de confiance (`src/langues/br/confiance.ts`).
- **Coût** : A, B, C (le tableau) sont l'essentiel ; D, E, F sont du confort. Ordre proposé : B → A → C → D → E → F.

## 10. Intégration au site, en option (demande du 2026-10-12)

Le site a déjà le mécanisme : le mode « enseignant » (`src/contexte/enseignant.ts`) est caché par défaut, activé par l'adresse `?enseignant=oui|non` ou par une case des
réglages, mémorisé sur l'appareil, et le site peut l'activer d'office (`enseignantVisible`, `src/sites.ts`). **On copie ce patron** pour les ceintures.

**Activation**
- `src/contexte/ceintures.ts` : `ceinturesActives` (site `ceinturesVisibles` OU réglage de l'appareil `ceintures`), `?ceintures=oui|non` (bandeau de confirmation comme `BandeauEnseignant`),
  case dans l'onglet « Appareil » des réglages. Désactivé : **rien ne change** sur le site (menu, exercices, catalogue, sitemap identiques ; un test le vérifie).
- Indépendant du mode enseignant (un parent peut vouloir les ceintures sans le profil enseignant) ; le tableau de classe (C) apparaît si l'un ou l'autre est actif ? (à décider).

**Où ça se voit quand c'est activé** (rien à toucher dans les exercices : les pistes référencent des ids d'exercices, `src/ceintures/pistes.ts`)
1. Menu et accueil : une rubrique « Mes ceintures » (`src/shell/rubriques.ts`, tuile d'accueil) → route `/ceintures` ; désactivé, la route redirige comme `/francais/grammaire`.
2. Page d'un exercice : une pastille « Ceinture orange » et un bouton « Passer le brevet » dans le cadre commun (`CadreExercice`, un emplacement `ceinture`), seulement si une
   piste couvre l'exercice. Le brevet = le jeu de l'exercice avec les réglages de la ceinture (`useJeu`) : un mode de plus à côté de « Faire l'exercice » / « Imprimer une fiche ».
3. Onglet « Imprimer une fiche » : une option « Brevet papier » (fiche B) pour l'exercice, et les supports A, C, D, E, F dans `/telechargements` sous un filtre « Ceintures ».
4. Réglages : un onglet « Ceintures » (palette, seuils, export / import, effacer), visible seulement si actif.

**Les fiches imprimables quand l'option est coupée** : elles sont publiées comme les autres (pages statiques, PDF) mais marquées « ceintures » ; le crible commun
`useAffichable` (celui de la confiance du breton) gagne un critère `ceintures` et les masque des listes (`/telechargements`, recherche, accueil) tant que l'option est coupée ;
l'adresse directe d'une fiche marche toujours. Alternative plus simple : ne les publier qu'une fois la fonction validée (aucune page statique tant que `ceinturesVisibles` est faux).

**Code** : `src/ceintures/` (types, état et stockage, export / import, `dessin.ts` de la ceinture, `pistes.ts`, `fiche.ts` des supports, `useCeintures.ts`), vues `src/views/ceintures/`,
textes fr / br (section `ceintures`), table de confiance du breton. Rien de plus dans les exercices existants, à part l'emplacement du cadre.

**Livrer sans risque** : tout se fait dans `main`, caché par défaut. Chaque phase du §7 est mergeable seule puisque le site public ne la montre pas ; seule la phase « activer
d'office » (`ceinturesVisibles: true` pour un site) est une décision de mise en ligne, comme pour l'enseignant.

**Tests** : l'option coupée = instantanés, menus, sitemap et fiches inchangés (`tests/ceintures-cachees.test.mjs`) ; l'option activée = parcours (brevet réussi / raté, export puis import,
données corrompues) ; accessibilité des nouvelles routes ; vie privée (aucune requête).

## 11. Plan détaillé (2026-10-12) — remplace les phases du §7

Décisions de l'utilisateur : (1) **l'impression d'abord**, la version en ligne ensuite sauf si elle vient presque gratuitement ; (2) **sur une branche** `ceintures`, on décidera de
fusionner ou non ; (3) en plus des brevets par exercice, **une activité « ceintures » générale** (accessoires à découper, tableau, diplômes… indépendante d'une piste) ;
(4) **le type de ceinture et les options communes vont dans les réglages communs** (page des réglages + bloc « Sur la fiche ») ; (5) on commence quand l'autre session a
libéré le dépôt (15 fichiers non commités à son nom au 2026-10-12 : pictogrammes, vues de maternelle…).

### 0. Avant de commencer
- **Dépôt libre** : `git status` propre (ou seulement mes fichiers). Alors `git switch -c ceintures` depuis `main`. Changer de branche dans l'arbre partagé déplacerait les fichiers
  de l'autre agent : on ne le fait **pas** tant qu'il travaille. Plan B si l'attente dure : `git worktree add ../ecole-primaire-ceintures -b ceintures` (un second dossier : `npm ci`,
  serveur de dev sur un autre port, verrou `/tmp/npm-test.lock` partagé pour les tests).
- Rien à commiter sur `main` en dehors de `plans/15-ceintures.md` et de la ligne de `docs/TODO.md` (à y mettre au premier commit de la branche).
- Un commit par étape ci-dessous, tests verts (`npm test`, `lint`, `types`, `qualite`, `i18n`, `instantanes`), jamais de seuil relâché.

### 1. Socle partagé `src/ceintures/` (pur, node)
- `types.ts` : `Palette`, `StyleCeinture`, `Piste`, `Ceinture`, `SupportCeinture` (§3 du plan).
- `palettes.ts` : les palettes (judo 7, judo + rouge 8, rose → violet 6, sans couleur 5) : id, couleurs hex, **motif noir et blanc** de chacune, **nom de la couleur**
  par langue (`ceintures.couleur.<id>` en fr / br).
- `dessin.ts` : `ceintureSvg({ couleur, motif, taille, style })` → SVG (ruban + nœud ; styles : « ruban », « bandeau » sans nœud, « étoile / gommette » pour le tableau). Pur, sans emoji.
- `reglages.ts` : réglages **communs** mémorisés (clé `ceintures`, `chargerReglages`) : `palette`, `style`, `noirEtBlanc`, `nbCeintures` (3 à 8), `seuil` (5 à 10 sur 10),
  `questions` (5 à 30), `chronometre`. Même patron que `confianceReglage.ts` / `polices.ts` : un `ref`, une valeur assainie, tests de données corrompues (`tests/memorises`).
- `pistes.ts` : quelques pistes fournies (tables de multiplication, calcul mental, lettres GS), données pures référençant des ids d'exercices et leurs réglages ; validées à l'import
  (id d'exercice existant, réglages valides pour `definir`, objectifs en clés de texte).
- Tests : `tests/ceintures.test.mjs` (node) : palettes complètes, une couleur ≠ un motif, nom de couleur dans les deux langues, pistes valides, réglages corrompus.

### 2. Réglages communs (interface)
- **Page des réglages** : onglet « Fiches » : un bloc « Ceintures » (`src/ceintures/ReglageCeintures.vue`) : palette (aperçu des ceintures), style, couleur / noir et blanc, seuil par défaut,
  nombre de questions du brevet, chronomètre. Textes fr / br (`reglages.ceintures.*`, breton `// br: à relire`).
- **Bloc « Sur la fiche »** (`OptionsFiche.vue`) : une propriété `ceintures: true` (comme `images`) affiche `ChoixCeintures` (palette + couleur / N&B), lue par la fiche comme `imagesDe(params)`.
  Les valeurs viennent de `reglages.ts` : un seul endroit, comme la police.
- Activation « en option » : `src/contexte/ceintures.ts` sur le modèle de `enseignant.ts` (`?ceintures=oui|non`, case dans « Appareil », `ceinturesVisibles` dans `src/sites.ts`).
  Sur la branche : actif par défaut en dev seulement.

### 3. Activité générale « ceintures » (fiche seule, `jeu: false`)
- Un exercice `src/exercices/ceintures/` sur le modèle d'`ecriture/` (fiche seule) : `definition.ts`, `generateur.ts` (tire les contenus), `fiche.ts`, `textes.ts`, inscrit au registre, à la table des vues et au catalogue
  (`npm run nouveau -- exercice ceintures "Ceintures" …`).
- Réglages : **support** (livret · ceintures à découper · diplôme · passeport · tableau de la classe), **piste** (une des pistes fournies, ou « libre »), **intitulé** et **objectifs libres** (champs de texte comme `ecriture`),
  nombre de ceintures, **prénom** (vide ou saisi), nombre de lignes du tableau. Palette, style et noir et blanc : les réglages communs du §2.
- Supports (maquettes `brouillons/ceintures/maquettes-impression.html`) : A livret, D bandes, E diplôme, F passeport (4 cartes par feuille), C tableau.
  À trancher au premier essai : le tableau de classe est-il un support de la fiche (A4 portrait / paysage, `documentFiche`) ou une affiche A3 (`src/affiches/ceintures/`, `definirAffiche`) ?
  Reco : fiche pour A, D, E, F ; **affiche** pour C (paysage, A3, comme les autres affiches de classe).
- **Programme** : l'activité n'est pas dans les programmes officiels. `definir` exige des compétences : choisir entre un domaine « vie de classe » hors programme (`domainesFictifs`, `horsProgramme` avec raison)
  ou une compétence transversale existante (`emc` : s'engager dans un projet ?). À trancher à l'étape.
- Slugs : fiches génériques publiées une fois (`fiche-ceintures-livret`, `-bandes`, `-diplome`, `-passeport`, affiche `affiche-ceintures-classe`) ; ils ne changent plus.
- Tests : instantanés (`tests/instantanes/ceintures.json`), `tests/exercices.test.mjs`, débordement (`tests/fiches-debordement`, `tests/affiches`), aperçu en noir et blanc (motifs distincts, test visuel : capture).

### 4. Le brevet papier (par exercice)
- Pour une piste fournie : une fiche « brevet » par ceinture = `fiche()` de l'exercice avec les réglages de la ceinture (même graine, « Nouvelle fiche »), enveloppée du gabarit (en-tête, seuil, durée, cadre
  « résultat / validée / pas encore », corrigé à l'envers). Un helper `brevetPapier(piste, n, graine)` dans `src/ceintures/brevet.ts` (pur).
- Première piste : **tables de multiplication** (une seule vue d'exercice, fiche existante) ; ensuite calcul mental, puis lettres (la fiche « relier » a déjà un seuil naturel).
- Option dans l'onglet « Imprimer une fiche » de l'exercice (`Brevet papier : ceinture verte`) quand une piste le couvre ; entrées dans `/telechargements` sous « Ceintures ».
- Tests : instantanés des brevets (par piste × ceinture × graine), `tests/exercices.test.mjs` (les brevets restent au programme du niveau : une ceinture hors programme = bug).

### 5. Breton
- Noms des couleurs et textes des supports en breton (`// br: à relire`), puis évaluation de confiance (`src/langues/br/confiance.ts` : `exercice:ceintures` niveau 0 tant que non relu,
  donc masquée par le réglage par défaut 2/4 : comportement voulu). Sources : docs/confiance-breton/.

### 6. Version en ligne (si facile, sinon plus tard)
- **Gratuit** avec ce qui précède : le brevet « jeu » = `useJeu` de l'exercice avec les réglages de la ceinture ; la ceinture atteinte est un enregistrement `{ piste, ceinture, le, note }` dans `ep_ceintures_etat`
  (même module `reglages.ts`, assaini), page `/ceintures` (liste des pistes, ceinture actuelle, brevet), pastille dans le cadre d'exercice. Export / import `.json` versionné.
- **À reporter** si cela gonfle la branche : plusieurs profils d'enfants, pistes créées par l'enseignant·e, portée « domaine / matière ».

### 7. Décision de fusion
Critères : l'impression est utile sur de vraies fiches imprimées (noir et blanc compris) ; les regards critiques (`docs/critiques/`, enfant de CE1 + enseignant·e) ne rejettent pas l'idée ;
`npm test` et `test:complet` verts ; **aucun changement** sur le site quand l'option est coupée. Sinon : la branche reste ouverte ou est abandonnée sans effet sur `main`.

### Ordre des commits sur la branche
1. socle (`src/ceintures/`, tests) → 2. réglages communs → 3. activité générale : livret, bandes (D), diplôme (E) → 4. passeport (F) et tableau (C) → 5. brevet papier « tables » →
6. autres pistes → 7. breton → 8. version en ligne (si retenue).
