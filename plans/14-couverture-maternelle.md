# Plan 14 — Finir la couverture de la maternelle (PS, MS, GS)

Écrit le 2026-10-07 pour la séance du lendemain. Remplace, pour la maternelle, les propositions encore ouvertes de
`10-couverture-ps.md`, `-ms.md` et `-gs.md` (écrites pour l'ancien monde : chemins `/maternelle/…`, `src/impression/…`), en
les reportant dans le modèle actuel : `src/exercices/<id>/` (`definir`) et `src/affiches/<id>/` (`definirAffiche`).
`src/data/programme.ts` fait foi ; chaque idée cite la compétence qu'elle couvre.

## 1. État (relevé du 2026-10-07, `src/ressources/couverture.ts`)

Couvert : dénombrer (3, 6, 10), comparer des quantités, bande numérique, comparer des longueurs, formes, motifs, jours et mois
(MS, GS), nom des lettres (MS, GS), geste d'écriture (GS) ; en breton : alphabet, jours (MS, GS), mois, météo (GS).

Vide (∅) :

| Domaine | Compétences sans ressource |
| --- | --- |
| Nombres | `composer-decomposer` (PS-GS), `problemes-maternelle` (PS-GS) |
| Grandeurs | `comparer-masses-maternelle` (MS, GS) |
| Espace et géométrie | `solides-maternelle` (MS, GS), `assemblages-maternelle` (PS-GS) |
| Temps et espace | `moments-journee` (PS, MS), `chronologie-maternelle` (PS-GS), `reperes-espace` (PS-GS), `environnement-proche` (PS-GS) |
| Le vivant | `parties-animaux-plantes`, `cycle-vie-vivants`, `deplacements-animaux`, `besoins-vivants`, `proteger-environnement` |
| Corps et santé | `parties-corps`, `cinq-sens`, `hygiene-vie`, `croissance-corps` |
| La matière | `eau-etats`, `air-existe`, `melanges-dissolution` |
| Objets | `materiaux-objets`, `construire-fabriquer`, `instructions-robot` (GS) |
| Français | `syllabes-orales` (PS-GS), `nom-lettres` (PS), `son-lettres` (GS), `geste-ecriture-maternelle` (PS, MS), `categories-mots` (PS-GS) |
| Breton | `nombres-jusqua-10-langue-regionale` (MS) |

Tout « Explorer le monde » est vide : c'est le plus gros trou, et le plus visible (la tuile Le Monde en maternelle).

## 2. Règles pour la maternelle (rappel, valables pour tout ce qui suit)

- **Consigne dite** à chaque question (voix du site, bouton 🔊), lecture non requise ; images (emoji OpenMoji, SVG) plutôt que du texte.
- **2 à 4 choix**, gros boutons ; PS : 5 questions, pas de compteur écrit ; jamais d'échec bloquant.
- **Peu de fiches en PS** (BO n° 19 p. 9 : manipuler d'abord) : en PS, de l'affiche et du matériel à découper plutôt que des fiches à remplir.
- Un exercice de maternelle ne demande ni de lire ni d'écrire au clavier (sauf `nom-lettres` en GS, en choix).
- Breton sans voix bretonne : consigne écrite, lue par l'adulte (décision des plans 10, inchangée) ; textes `// br: à relire`.
- **Regards critiques** (`docs/critiques/`, enfant et enseignant·e) à proposer à la fin de chaque lot.

## 3. Idées, par lot (chaque lot livrable seul)

### Lot A — Explorer le monde : des affiches d'abord (rapide, très visible)

Le modèle `listeMots.ts` (jours, mois, météo) sert déjà de base : une liste illustrée, en français, en breton ou les deux.

1. **Affiche « Les parties du corps »** (`parties-corps`, PS-GS) : un enfant dessiné (SVG simple) avec étiquettes ; variantes PS
   (tête, bras, jambes, ventre, mains, pieds) et MS-GS (+ coude, genou, épaule, cou, dos). Bilingue.
2. **Affiche « Les cinq sens »** (`cinq-sens`, PS-GS) : 5 cases (œil, oreille, nez, bouche, main) et un verbe (voir, entendre…).
3. **Affiche « Les moments de la journée »** (`moments-journee`, PS-MS ; `chronologie-maternelle`) : matin, midi, après-midi,
   soir, nuit, avec un rituel par moment (petit-déjeuner, cantine, sieste…) ; réutilisable comme frise de la classe.
4. **Affiche « Les saisons »** (`chronologie-maternelle`, `mois-saisons-langue-regionale`) : 4 cases, arbre qui change ; complète
   l'affiche des mois.
5. **Affiche « Se laver les mains »** (`hygiene-vie`) : les étapes en 5 ou 6 images ; c'est une affiche que les classes accrochent vraiment.
6. **Affiche « Grandir »** (`croissance-corps`, `cycle-vie-vivants`) : bébé → enfant → adulte → personne âgée ; et une variante animal
   (œuf → poussin → poule ; têtard → grenouille) pour `cycle-vie-vivants`.

### Lot B — Explorer le monde : des exercices de tri (un seul moteur, beaucoup de contenu)

Un exercice générique **« Trier les images »** (modèle corpus) : deux ou trois boîtes, des images à ranger, consigne dite. Un même
moteur, un corpus par compétence :

- `categories-mots` (oral) : animaux / fruits / vêtements / véhicules ;
- `materiaux-objets` : bois / métal / plastique / tissu (GS), « ça flotte / ça coule » (MS-GS, lié à `eau-etats`) ;
- `besoins-vivants`, `parties-animaux-plantes` : vivant / pas vivant ; « qu'est-ce qu'il mange ? » ;
- `deplacements-animaux` : il vole / il nage / il marche / il rampe ;
- `cinq-sens` : « avec quoi je le sens ? » (une image → un sens) ;
- `proteger-environnement` (GS) : la bonne poubelle (tri des déchets) ;
- `hygiene-vie` : « bon pour la santé ? » (avec prudence : pas de jugement moral sur la nourriture, décision à prendre).

C'est le levier le plus rentable : un moteur, une dizaine de compétences couvertes, et des fiches « relie / colorie » à imprimer
pour la MS et la GS à partir du même corpus.

### Lot C — Temps et espace

1. **Exercice « Où est le chat ? »** (`reperes-espace`, PS-GS) : une scène, « montre le chat **sur** la boîte » ; PS : dans, sur, sous ;
   MS : devant, derrière, à côté ; GS : entre, à gauche, à droite (droite/gauche en option, programme de GS).
2. **Exercice « Remets dans l'ordre »** (`chronologie-maternelle`) : 3 images (PS-MS : 2 ou 3 ; GS : 4) d'une action (planter une
   graine, faire un gâteau, s'habiller) ; réutilise l'ordonnancement de `ranger`.
3. **Fiche « Ma journée à découper »** (`moments-journee`) : les vignettes de l'affiche du lot A, à découper et coller dans l'ordre.
4. `environnement-proche` : affiche « L'école et ses lieux » (classe, cour, cantine, dortoir) ; petit exercice « où range-t-on ? ». À
   garder pour la fin : très dépendant de chaque école.

### Lot D — Nombres et grandeurs

1. **Exercice « La valise »** (`problemes-maternelle`, `composer-decomposer`) : on met 2 ours puis 1 dans la valise, combien ? ;
   GS : « il en faut 5, il y en a 3, combien en ajouter ? ». Réutilise le dessin des collections de `compter`.
2. **Affiche « Les décompositions de 5 et de 10 »** (`composer-decomposer`, GS) : boîtes de 5 et de 10 (doigts, cadre à 10).
3. **Exercice « Le plus lourd »** (`comparer-masses-maternelle`, MS-GS) : une balance à plateaux qui penche ; « lequel est le plus
   lourd ? » ; GS : ranger 3 objets. Le BO dit qu'on soupèse : l'exercice reste un appui, à signaler dans sa description.
4. **Breton, nombres jusqu'à 10 en MS** : la variante « unités » de l'affiche des nombres est CP-CE1 ; ajouter une variante MS-GS
   (0 à 5 en MS, 0 à 10 en GS, points plus gros, sans le mot écrit en MS ?) — c'est la décision « variante GS des unités » en attente.

### Lot E — Espace et géométrie

1. **Fiche « Assemblages »** (`assemblages-maternelle`) : reproduire un modèle avec des formes découpées (tangram simplifié) ; PS :
   2 ou 3 pièces, GS : 5 à 7 ; matériel à découper fourni.
2. **Affiche « Les solides »** existe en CE1 : variante MS-GS (`solides-maternelle`) avec photos d'objets réels plutôt que des dessins en
   perspective (le BO exclut la perspective en maternelle) : boule ↔ ballon, cube ↔ dé, cylindre ↔ boîte de conserve.

### Lot F — Français

1. **Exercice « Frappe les syllabes »** (`syllabes-orales`, PS-GS) : une image, la voix dit le mot, l'enfant tape autant de fois que
   de syllabes (ou choisit 1, 2 ou 3 points) ; GS : « quelle image commence comme… ».
2. **`son-lettres` (GS)** : dans `lettres`, un mode « j'entends » (la voix dit le son, l'enfant choisit la lettre), en se limitant aux
   sons que le programme cite (voyelles et consonnes continues, pas les occlusives).
3. **`nom-lettres` (PS)** : la lettre de son prénom ; reconnaître quelques lettres parmi 2 (PS, en option).
4. **Graphisme** (`geste-ecriture-maternelle`, PS-MS) : fiches de tracés (traits, ronds, ponts, boucles) dans le générateur d'écriture,
   lignes très espacées ; PS : en grand, au feutre.

### Lot G — Objets et matière (expériences)

`air-existe`, `melanges-dissolution`, `construire-fabriquer`, `instructions-robot` relèvent de la manipulation en classe. Idées
modestes : **fiches « expérience »** pour l'enseignant (déroulé illustré, une page : « l'air existe-t-il ? » avec un sac et une
paille, « ça se mélange ? » eau + sucre / huile / sable) ; et pour `instructions-robot` (GS), un exercice « fais avancer la
coccinelle » (flèches ↑ → ↓ ← sur un petit quadrillage), proche des robots de sol utilisés en GS. À traiter en dernier.

## 4. Ordre conseillé

1. **Lot B** (moteur « Trier les images ») et **lot A** (affiches du Monde) : remplissent la tuile Le Monde en maternelle, un seul
   moteur nouveau, le reste est du contenu.
2. **Lot D** (la valise, les masses, la variante d'affiche) et **lot C** (où est le chat, remets dans l'ordre).
3. **Lot F** (syllabes, sons), puis **lot E** (assemblages, solides MS-GS).
4. **Lot G** en dernier.

Effort indicatif : lot A, une demi-journée (6 affiches sur `listeMots`/un dessin simple) ; lot B, une journée (moteur + 6 corpus) ;
lots C et D, une journée chacun ; lot F, une journée ; E et G, une demi-journée chacun.

## 5. Décisions à prendre (avec recommandation)

1. **Images** : emojis OpenMoji partout (déjà la règle des fiches) ; pour le corps et les étapes (lavage des mains), un dessin SVG
   propre au site. *Reco* : OpenMoji d'abord, SVG seulement là où aucun emoji ne convient (guide d'iconographie dans `brouillons/`).
2. **Tri « bon pour la santé »** : *reco* : ne pas le faire ; garder `hygiene-vie` sur les gestes (se laver, dormir, se brosser les dents).
3. **Monde en breton** : les affiches du lot A en bilingue (vocabulaire du corps, des sens, des saisons : à vérifier dans le Meurgorf
   avant publication, sinon `// br: à relire`). *Reco* : oui, c'est ce qui manque le plus sur skoolik en maternelle.
4. **Variante MS-GS de l'affiche des unités** (lot D4) : 0 à 5 en MS, 0 à 10 en GS ? avec ou sans le mot écrit ?
5. **Compléter `programme.ts`** avant de coder (relevés des plans 10, toujours ouverts) : le rang (MS, GS), les habiletés phonologiques
   au-delà des syllabes (GS), le libellé de `son-lettres`, l'oral de cycle 1 (`categories-mots` est seule). *Reco* : oui pour le rang
   et la phonologie, avec la source exacte (BO n° 41 et n° 19, `docs/programmes/`).
6. **Fiches en PS** : *reco* : seulement du matériel à découper et du graphisme, pas de fiche « à remplir ».
