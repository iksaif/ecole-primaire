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

## 12. Avancement (2026-10-12, sur `main` : pas de branche, décision de l'utilisateur)

Fait (commits `63f513d`, `6a6116c`, `01d9e37`, `2cc63a0`, non poussés) :
- **Socle** `src/ceintures/` : types, palettes (4) avec motifs noir et blanc, dessin SVG (ruban, bandeau, rond), réglages communs lus avec méfiance (`reglages.ts`, `useCeintures.ts`),
  supports pur HTML (`supports.ts` : livret, ceintures à découper, diplôme, passeport, brevet), questions des brevets (`brevets.ts`), `tests/ceintures.test.mjs`.
- **Réglages communs** : page des réglages (onglet « Fiches », bloc « Ceintures » : palette, dessin, N&B, nombre, seuil, questions, chronomètre) et « Sur la fiche » (`<CadreExercice ceintures>`).
- **Option cachée** : `?ceintures=oui|non`, case dans « Appareil », `ceinturesVisibles` dans `src/sites.ts` ; les activités n'apparaissent dans les listes que si elle est active (`useAffichable`, critère `option`).
- **Activité `ceintures`** (`/monde/ceintures`, EMC CP à CM2) : livret, ceintures à découper, diplôme, passeport ; pistes tables, calcul mental, lettres, libre.
- **Activité `ceintures-brevet`** (`/maths/ceintures-brevet`, tables CE1 à CM2) : brevet papier tiré de la graine, seuil et nombre de questions des réglages communs, corrigé.
- Écart au plan : le brevet est une activité à part (le test des exercices interdit un corrigé « parfois »), et il suit la compétence qu'il évalue (tables) ; l'activité générale reste en EMC (même matière que les
  pistes de comportement), sans GS faute de compétence EMC au cycle 1.

Reste : tableau de la classe (affiche A3), brevets des autres pistes (calcul mental, lettres), fiches publiées (slugs `/telechargements/`, voir §10), breton (table de confiance), regards critiques, version en ligne (§6).

## 13. À réfléchir plus tard : les ceintures comme onglet de l'exercice (demande du 2026-10-13)

Aujourd'hui les brevets sont des activités à part (`ceintures-brevet`). Idée : les ajouter comme un **onglet de l'exercice qui évalue déjà la compétence** (les tables de multiplication :
« Faire l'exercice · Imprimer une fiche · **Ceintures** »), au lieu d'une page séparée. À peser :
- pour : on passe le brevet là où on s'entraîne (mêmes réglages, mêmes questions que le jeu, la ceinture atteinte à côté du score) ; plus de page « brevet » à part, ni de compétence dupliquée (voir §12) ;
- contre : le cadre commun `CadreExercice` n'a que deux onglets (`useModeExercice`), à étendre pour tous les exercices ou pour ceux qui ont une piste (option cachée `ceinturesActives`) ; les supports sans exercice
  (livret, diplôme, passeport, tableau) gardent leur activité générale ;
- point technique : le brevet « jeu » à l'écran (`useJeu`) et le brevet papier partageraient le générateur de l'exercice (`questions` / `questionsFiche`) avec les réglages de la ceinture (`Piste.ceintures[n].reglages`, §3 : à écrire).
À reprendre quand le brevet à l'écran (§6) sera décidé.

## 14. Une vraie extension, pas des fuites (demande du 2026-10-13)

Constat : pour aller vite, le code des ceintures a mis son nom dans les parties communes. Les « fuites » actuelles :
`src/sites.ts` (`ceinturesVisibles`), `src/router/index.ts` (`appliquerAdresseCeintures`), `src/noyau/types.ts` (`ParamsFiche.ceintures`), `src/noyau/useFicheExercice.ts` (lit `useCeintures`),
`src/noyau/CadreExercice.vue` et `OptionsFiche.vue` (prop `ceintures`, import de `src/ceintures/ChoixCeintures.vue` : le noyau importe une fonctionnalité, à l'envers des couches),
`src/ressources/{types,filtres,catalogue,useAffichable}.ts` (`option: 'ceintures'`, `optionDe` qui connaît deux ids), `src/pages/ReglagesView.vue` (deux blocs ceintures).

Cible : trois couches, dans le sens `noyau ← extensions ← fonctionnalités`.

**1. Un mécanisme d'extension générique** (`src/extensions/`, petit, sans mot « ceinture »). Une extension se déclare (`definirExtension`) avec ce qu'elle apporte :
- `id`, `actif` (le site la propose, ou l'appareil l'a activée : le patron de `enseignant.ts` devient générique : `?<id>=oui|non`, case dans « Appareil », `extensions: { <id>: boolean }` dans `sites.ts`) ;
- des **options communes de fiche** (un composant montré dans « Sur la fiche » des exercices qui l'acceptent, et sa valeur injectée dans `ParamsFiche.extensions[<id>]`, typée par l'extension) ;
- un **bloc de la page des réglages** (liste de sections par extension active) ;
- des **onglets d'exercice** (voir 3) et des **activités** (exercices et affiches qu'elle ajoute au registre) ;
- un **critère d'affichage** (`masque(ressource)` pour `useAffichable`, qui ne connaît plus que « ressource.extension = <id> » et demande au registre).
Le noyau ne sait rien d'une extension précise : il parcourt le registre. Un exercice dit qu'il accepte une extension (`extensions: ['ceintures']` dans sa définition, vérifié à l'import) ; sans cela, rien ne change pour lui.

**2. L'extension « ceintures »** (`src/ceintures/`) : tout ce qui est spécifique y reste (palettes, dessin, réglages, supports, pistes, brevets, pastille, textes), plus son déclaratif `extension.ts` qui branche les points ci-dessus.
Les activités dédiées (livret, ceintures à découper, diplôme, passeport ; le tableau de classe en affiche A3) restent des **activités / affiches propres** : elles n'ont pas d'exercice parent, c'est leur place.

**3. Ce qui est commun à tous les exercices** (donc générique, pas « ceintures ») :
- **Onglets d'exercice en plus de « Faire » et « Imprimer »** : `useModeExercice` passe de deux valeurs à une liste fournie par les extensions actives pour cet exercice ; l'onglet « Ceintures » (brevet à l'écran, ceinture atteinte, brevet papier) est la contribution de l'extension aux exercices qui déclarent une piste.
- **Options de fiche de l'extension** (palette, dessin, noir et blanc) : le slot « Sur la fiche » ci-dessus.

**4. Une méta-activité « assemblage de fiches »** (générique, indépendante des ceintures) : une feuille composée de fragments de fiches de plusieurs exercices (chacun avec sa configuration), un en-tête, un seul corrigé.
Elle suppose un **contrat de fragment** : aujourd'hui `fiche()` rend un document complet (`documentFiche`) ; il faudra une forme « corps + css » (par exemple `fiche(params, { fragment: true })` ou une fonction sœur), avec un CSS limité au fragment (CSS imbriqué `.fragment-n { … }`) pour que `.ligne` ou `.grid` de deux exercices ne se mélangent pas.
Les ceintures en deviennent un **consommateur** : le brevet papier d'une ceinture = en-tête de ceinture + fragments des exercices de la piste + cadre du résultat ; `ceintures-brevet` n'a alors plus de générateur propre (aujourd'hui `src/ceintures/brevets.ts`).

**Ordre proposé** (un commit chacun, sans changement visible pour l'utilisateur tant que l'option est coupée) :
1. Le registre d'extensions et le patron d'activation générique ; le déclaratif des ceintures ; retirer les fuites listées (les tests existants doivent passer sans modification, plus un test « aucune mention de ceintures dans `src/noyau`, `src/ressources`, `src/shell`, `src/router`, `src/sites.ts` »).
2. Les points d'accroche : options de fiche, réglages, critère d'affichage.
3. Le contrat de fragment et l'assemblage (livrable seul, utile sans les ceintures), puis le brevet sur l'assemblage.
4. Les onglets d'exercice.

Risques : le contrat de fragment touche chaque `fiche()` (ou au moins le gabarit `documentFiche`) et les instantanés des fiches ne doivent pas bouger ; l'ordre des couches doit être vérifié (un test d'imports, comme celui du « noyau n'importe jamais affiches »).

## 15. Étape 1 du §14 faite (2026-10-13)

`src/extensions/` : `types.ts` (une extension : activation, ressources, options de fiche, contexte de fiche, bloc de réglages ; composants chargés à la demande, donc lisible par node), `registre.ts` (l'unique liste),
`activation.ts` (site `extensionsVisibles` ou appareil : case dans « Appareil », `?<id>=oui|non`, clé `extension_<id>`). `src/ceintures/extension.ts` branche les ceintures. Les parties communes n'ont plus le mot « ceinture » :
`CadreExercice` / `OptionsFiche` (prop `extensions`, issue de `definition.extensions`), `useFicheExercice` et `ParamsFiche.extensions[<id>]`, `ReglagesView` (blocs génériques), `useAffichable` (`ressource.extension`), `sites.ts`, routeur.
`tests/extensions.test.mjs` vérifie le registre et balaie les sources (aucune mention hors du dossier des ceintures, de ses deux activités, des registres et des textes). Les instantanés n'ont pas bougé.
Écart : en développement, une extension inactive masque quand même ses ressources (c'est un choix de l'utilisateur, pas une réserve sur une traduction). Restent : l'assemblage de fiches (§14.4), les onglets d'exercice (§14.3).

## 16. Étape 3 du §14 faite : l'assemblage de fiches (2026-10-13)

- **Contrat de fragment** (`src/impression/fragment.ts`) : `fragmentDe(() => fiche(…))` récupère le titre, le CSS propre et le corps d'une fiche ; c'est `documentFiche` qui signale ses morceaux au collecteur, aucune fiche n'a été modifiée
  (instantanés inchangés ; hors de `fragmentDe`, la fiche rend son document comme avant).
- **Assemblage** (`src/impression/assemblage.ts`) : une ligne Prénom / Date, un seul corrigé (un sous-titre par bloc), CSS limité à chaque bloc (CSS imbriqué `.bloc-n { … }`, sans `@page`, `body` devient le bloc), un titre par bloc, saut de page facultatif.
- **Fragment d'un exercice du registre** (`src/exercices/fragment.ts`) : mêmes `questionsFiche` et `fiche` que l'app et le build, avec les réglages par défaut d'un niveau.
- **Consommateur : l'extension « assemblage »** (`src/assemblage/`, cachée, `?assemblage=oui`, page `/assemblage`) : on choisit une classe et des exercices, l'aperçu réunit leurs fiches. Le mécanisme d'extension a gagné des pages (`routes`, `meta.extension`, garde du routeur).
- Reste : le brevet des ceintures construit sur l'assemblage (aujourd'hui `src/ceintures/brevets.ts` a son propre générateur, qui sait faire des divisions : l'exercice des tables n'en fait pas), des réglages par bloc (aujourd'hui les défauts du niveau), l'ordre des blocs,
  les exercices dont la fiche demande la mesure du navigateur (écriture : signalés « pas assemblable ici »), puis les onglets d'exercice (§14.3).

## 17. Étape 4 du §14 faite : l'onglet d'exercice (2026-10-13)

Une extension ajoute des **onglets** à la page d'un exercice (`Extension.onglets` : id, icône, titre, `pour(exercice)`, composant). `CadreExercice` affiche « Faire l'exercice », « Imprimer une fiche », puis les onglets des extensions actives
pour l'exercice de la page (`meta.exercice` de la route ; `?mode=<id>`) et met le composant de l'onglet à la place du panneau. Un cadre sans onglets (fiche seule) ou `imbrique` n'ouvre jamais d'onglet d'extension.
Les ceintures : l'onglet « Ceintures » des tables de multiplication (`EXERCICES_AVEC_BREVET`) contient le brevet papier (`BrevetPapier.vue`, aussi le corps de la page `ceintures-brevet`). Le brevet garde ses propres réglages (classe, ceinture, tables) : ils ne
suivent pas ceux de l'exercice. À faire : suivre la classe de l'exercice, le brevet à l'écran (`useJeu`), la ceinture atteinte à côté du score, l'onglet pour le calcul mental et les lettres (il leur faut un brevet), puis retirer la page `ceintures-brevet` si l'onglet suffit.

## 18. Décision : pas de fiches toutes prêtes pour l'instant (2026-10-13)

Les supports des ceintures s'impriment depuis leurs pages (activités `ceintures`, `ceintures-brevet`, onglet « Ceintures » des exercices, `/assemblage`), avec le rendu actuel (rien ne change à l'impression). On **ne publie aucune fiche toute prête** :
pas de page `/telechargements/<slug>/`, pas de PDF, pas d'entrée au sitemap, donc pas de nouvelle adresse à tenir. Vérifié : `fichesDesRegistres` ne renvoie aucune fiche de ceintures, de brevets ni d'assemblage (745 fiches sur chaque site, comme avant) ;
`tests/extensions.test.mjs` garde cette règle (`fiches: []`, `bilanParClasse: false` pour chaque activité d'extension). Le §10 (« publier mais masquer » ou non) est donc tranché pour l'instant : on ne publie pas. À rouvrir si on veut un jour des fiches publiées.

## 19. Brevet construit sur l'assemblage de fiches : plan détaillé (2026-10-13)

**Constat.** `src/exercices/ceintures-brevet/` et `src/ceintures/brevets.ts` refont, en plus petit, ce que font déjà les exercices `tables` et `calcul-mental` (tirage des calculs, mise en page, corrigé). Décision de l'utilisateur : le brevet d'une ceinture
devient **un assemblage** : un en-tête de ceinture, le **fragment de la fiche de l'exercice** (ses vrais `questionsFiche` et `fiche`, avec les réglages de la ceinture), le cadre du résultat, un seul corrigé. On supprime l'exercice `ceintures-brevet`,
sa page `/maths/ceintures-brevet`, son générateur et ses instantanés ; le brevet n'existe plus que dans l'**onglet « Ceintures »** de l'exercice (le « Brevet » de l'activité générale reste hors sujet : livret, bandes, diplôme, passeport).

### 1. Modèle : une piste dit ce que chaque ceinture demande à l'exercice
`src/ceintures/pistes.ts` (données pures) devient la source unique, utilisée par l'activité (livret…) et par le brevet :
```ts
interface Piste { id; exercice?: string            // l'exercice du registre qui l'évalue (tables, calcul-mental) ; absent : piste libre ou sans brevet
  ceintures: { objectifs: string                    // texte de contenu (src/exercices/ceintures/textes.ts), ce que la ceinture valide
               reglages?: (niveau: Classe) => Record<string, unknown> }[] }   // réglages de l'exercice pour son brevet
```
- Les objectifs décrivent ce que les réglages produisent (plus de « dans les deux sens » si l'exercice ne le fait pas).
- Les valeurs de réglages sont celles des exercices (`ops`, `tables`, `jusqu`), stables par règle du projet (ce sont aussi les réglages mémorisés des visiteurs) ; les constantes d'opérations de `calcul-mental` sont exportées.
- **Tables** (6 ceintures) : ×2 ×5 ×10 · ×3 ×4 · ×6 ×7 · ×8 ×9 · toutes les tables (mélange) · toutes les tables, sans hésiter (30 en 3 minutes). Plus de divisions ni de « sens » : l'exercice des tables n'en fait pas ; si on les veut, on les ajoute à l'exercice
  (`ops` du calcul mental sait faire `÷` : la dernière ceinture pourra s'y appuyer plus tard).
- **Calcul mental** (6 ceintures, d'après les `ops` de l'exercice) : 1 `+` `−` · 2 doubles et moitiés · 3 compléments (`Compléments à 10`, `Vers la dizaine`, et `Compléments à 100` dès le CE1) · 4 calcul astucieux (`± dizaines`, `± 9 / ± 11`, `Passage de dizaine`) ·
  5 `× 10 / × 100` et tables (`×`) · 6 tout mêlé.
- Une ceinture **indisponible à un niveau** (aucune de ses opérations n'est offerte : `× 10 / × 100` au CP, par exemple) est grisée dans le choix, jamais remplacée en silence par `+` (c'est ce que fait `opsDuNiveau`).

### 2. Le brevet (`src/ceintures/brevet.ts`, pur)
`brevetPapier({ module, piste, indice, niveau, graine, langue, ceintures, extensions, prenom })` :
1. réglages de l'exercice = défauts du niveau + `ceinture.reglages(niveau)` (validés par `reglagesDuNiveau`) ; `nbFiche` (calcul mental) pris au plus petit choix ≥ nombre de questions voulu ;
2. tirage = `questionsFiche` de l'exercice, puis **coupé** au nombre de questions des réglages communs (`ajuster` : tableau, ou tirage avec `questions`) : l'API de fragment de l'exercice reçoit un `ajuster?: (tirage) => tirage` ;
3. fragment = `fiche` de l'exercice (`fragmentDe`) ; le nombre réel de questions fixe « {bonnes} bonnes réponses sur {n} » (seuil des réglages communs, `ceil`) ;
4. `assemblerFiches` reçoit de quoi poser un en-tête et un pied : options `avant` / `apres` (HTML), `css` en plus, et `Bloc.sansTitre` (le titre de l'exercice est déjà dans l'en-tête de ceinture) ; le corrigé de l'exercice devient « Corrigé — Brevet … ».
Les supports (`supports.ts`) gardent le dessin de ceinture, l'en-tête et le cadre du résultat ; `brevetHtml` et `LibellesBrevet` ne gardent que l'en-tête et le cadre.

### 3. Interface : l'onglet « Ceintures » (`OngletCeintures.vue`)
Sans exercice de brevet, plus de `useReglages(DEFINITION)` ni de `ChoixReglage` : de simples boutons (comme `AssemblageView`), dans `CadreExercice fiche-seule imbrique` (options « Sur la fiche » et aperçu).
- **Classe** : celle de l'exercice hôte (lue dans ses réglages mémorisés, `cleReglages`), modifiable ici ; ceintures grisées selon le niveau.
- **Ceinture** : numéro + couleur (`PastilleCeinture`).
- **Tables** (seulement pour cette piste) : « celles de la ceinture » ou « je choisis » (×1 à ×10, bonus ×11 ×12), « multiplier jusqu'à » 10 / 12 ; ces choix passent aux réglages `tables` et `jusqu` de l'exercice.
- **Prénom** (facultatif). Mémorisation : clé `ceintures_brevet` (corrompue : défaut, comme les autres réglages).

### 4. À supprimer
`src/exercices/ceintures-brevet/` (5 fichiers), l'entrée du registre (`exercices/index.ts`), la route (`views/exercices.ts`), `src/views/maths/CeinturesBrevetView.vue`, les sections de textes `ceinturesBrevet` (fr/br + `index.ts`),
`tests/instantanes/ceintures-brevet.json`, `src/ceintures/brevets.ts`, `exercice:ceintures-brevet` dans `extension.ressources`. Les clés `ceinturesBrevet.*` encore utiles (tables, jusqu'à, prénom) passent dans `ceintures.*`.

### 5. Tests
- `tests/ceintures.test.mjs` : pour chaque piste avec exercice × ceinture × niveau disponible : réglages acceptés tels quels par `reglagesDuNiveau` (aucune coercition), tirage coupé au bon nombre, questions conformes à la ceinture (tables ⊂ celles de la ceinture ; opérations ⊂ celles de la ceinture), « n bonnes réponses sur n » cohérent, corrigé unique,
  une seule ligne Prénom / Date, mêmes graine et même brevet ; une ceinture indisponible est refusée ; fr et br.
- `tests/assemblage.test.mjs` : `avant` / `apres` / `sansTitre` / `ajuster`.
- `tests/extensions.test.mjs` : onglet pour `tables` et `calcul-mental` ; plus de ressource `ceintures-brevet` ; la règle « aucune fiche publiée » (§18) garde `ceintures`.
- `npm run instantanes` : les exercices existants ne bougent pas (on ne les modifie pas).

### 6. Ordre des commits (chacun vert)
1. API d'assemblage et de fragment (`avant`, `apres`, `css`, `sansTitre`, `ajuster`) + tests.
2. Modèle de pistes (`pistes.ts`) avec réglages par ceinture, objectifs réécrits, validation par niveau + tests.
3. `brevet.ts` (brevet pur) + tests.
4. Onglet réécrit, suppression de `ceintures-brevet` et de ses restes, textes déplacés, documentation (§12, §17, §18, TODO).

### 7. Points à confirmer / risques
- Les ceintures des tables n'ont plus de divisions (l'exercice n'en fait pas). Acceptable ? Sinon : ajouter `÷` à l'exercice des tables d'abord (modifie une fiche existante : instantanés à justifier).
- Les ceintures du calcul mental sont redéfinies d'après les `ops` de l'exercice (les anciens brevets « ± 1, 2, 10 » disparaissent : l'exercice n'a pas cette opération).
- Pas de brevet au CP pour le calcul mental tant que les opérations du CP ne sont pas rangées en ceintures (à décider : 6 ceintures CP différentes, ou seulement CE1 à CM2).
- La page `/maths/ceintures-brevet` disparaît ; les brevets ne se retrouvent plus que dans l'onglet (donc extension active).
- Les tirages de `tables` et de `calcul-mental` ne sont pas conçus pour des brevets (tables : ordre mélangé, deux colonnes) : à regarder à l'écran avant de figer.
