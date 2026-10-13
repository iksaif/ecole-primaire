# Plan 14 — Finir la couverture de la maternelle (PS, MS, GS)

Écrit le 2026-10-07 pour la séance du lendemain. Remplace, pour la maternelle, les propositions encore ouvertes de
`10-couverture-ps.md`, `-ms.md` et `-gs.md` (écrites pour l'ancien monde : chemins `/maternelle/…`, `src/impression/…`), en
les reportant dans le modèle actuel : `src/exercices/<id>/` (`definir`) et `src/affiches/<id>/` (`definirAffiche`).
`src/data/programme.ts` fait foi ; chaque idée cite la compétence qu'elle couvre.

## 1. État (relevé du 2026-10-13, `npm run couverture`)

Fait depuis le 2026-10-07 : presque tout le lot A (affiches du corps, des cinq sens, de la journée, de l'hygiène, des cycles de vie, de
l'eau, des repères d'espace, des couleurs, bande numérique, variante `solides-maternelle` des formes) et la PS (compter, comparer,
formes, motifs, longueurs). Compétences encore sans aucune ressource :

| Domaine | PS | MS | GS |
| --- | --- | --- | --- |
| Nombres | `composer-decomposer`, `problemes-maternelle` | + `rang-maternelle` | + `rang-maternelle` |
| Grandeurs | — | `comparer-masses-maternelle` | `comparer-masses-maternelle` |
| Espace et géométrie | `assemblages-maternelle` | `assemblages-maternelle` | `assemblages-maternelle` |
| Temps et espace | `environnement-proche` | `environnement-proche` | `environnement-proche` |
| Le vivant | `parties-animaux-plantes` | + `deplacements-animaux`, `besoins-vivants` | + `proteger-environnement` |
| Corps et santé | — | `croissance-corps` | `croissance-corps` |
| La matière | `air-existe`, `melanges-dissolution` | idem | idem |
| Objets | `materiaux-objets`, `construire-fabriquer` | idem | + `instructions-robot` |
| Oral, lecture, écriture | `categories-mots`, `syllabes-orales`, `nom-lettres`, `geste-ecriture-maternelle` | `categories-mots`, `syllabes-orales`, `son-lettres`, `geste-ecriture-maternelle` | `categories-mots`, `syllabes-orales`, `phonemes-maternelle`, `son-lettres` |

## 2. Règles pour la maternelle (rappel, valables pour tout ce qui suit)

- **Consigne dite** à chaque question (voix du site, bouton 🔊), lecture non requise ; images (emoji OpenMoji, SVG) plutôt que du texte.
- **2 à 4 choix**, gros boutons ; PS : 5 questions, pas de compteur écrit ; jamais d'échec bloquant.
- **Peu de fiches en PS** (BO n° 19 p. 9 : manipuler d'abord) : en PS, de l'affiche et du matériel à découper plutôt que des fiches à remplir.
- Un exercice de maternelle ne demande ni de lire ni d'écrire au clavier (sauf `nom-lettres` en GS, en choix).
- Breton sans voix bretonne : consigne écrite, lue par l'adulte (décision des plans 10, inchangée) ; textes `// br: à relire`.
- **Regards critiques** (`docs/critiques/`, enfant et enseignant·e) à proposer à la fin de chaque lot.

## 3. Idées, par lot (chaque lot livrable seul)

### Lot A — Explorer le monde : des affiches d'abord

Fait, sauf : **« Grandir »** (`croissance-corps` : bébé → enfant → adulte → personne âgée) et **« Les saisons »** en affiche à part (l'affiche
des mois les montre déjà en bandes de couleur).

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
5. ~~**Compléter `programme.ts`**~~ fait le 2026-10-07 : `rang-maternelle` (MS ≤ 6, GS ≤ 10 ; BO 41 p. 64-65), `phonemes-maternelle`
   (GS : rimes, assonances, phonèmes ; c1consolide p. 15), `son-lettres` dès la MS (BO 41 p. 52 : quelques lettres ; libellé précisé :
   lettres qu'on peut prolonger en GS), `vocabulaire-maternelle` (PS-GS, corpus de mots ; BO 41 p. 47 : sert les affiches du lot A et
   les imagiers). Nouvelles cases vides à couvrir : rang (lot D, « le premier, le dernier » sur une file d'animaux), phonèmes et son des
   lettres en MS (lot F), vocabulaire (lots A et B).
6. **Fiches en PS** : *reco* : seulement du matériel à découper et du graphisme, pas de fiche « à remplir ».
7. **Repris des plans PS, MS et GS** (recommandations entre parenthèses) :
   - PS : `nombreMax` 3, avec « jusqu'à 4 » pour aller plus loin (oui) ; chiffres en PS en option désactivée (oui) ; peu de fiches, deux
     variantes prégénérées au lieu de quatre (oui).
   - MS : solides et masses en MS sont d'abord manipulés (BO p. 68, p. 70) : un champ `support: 'manipulation'` que `/programme` montrerait
     « activité de classe » plutôt que vide (oui) ; prénom de l'enfant saisi sur l'appareil seulement, jamais envoyé, bouton « Oublier » ;
     syllabes et comptine cachées sur skoolik tant qu'il n'y a pas de voix bretonne ; formes en MS : reconnaître et classer, pas nommer
     (p. 68 ; notre exercice demande le nom) ; `comparer-quantites` en MS : « plus que », « moins que », « autant » vient à 5 ans.
   - GS : fiches d'écriture « Lettre A… Z » et « Alphabet attaché majuscule » étiquetées GS (les passer CP · CE1, l'attaché majuscule au
     CE1 seul, et publier des fiches GS en attaché minuscule ; slugs inchangés) ; lignage GS de 5 mm (à valider, plan 07) ; pas de nombres
     en lettres en GS ; `son-lettres` sans les occlusives, avec une liste testable ; encodage de mots transparents sans compétence ;
     `cursive: 'minuscules'` identique en GS et au CP (« trace » en GS ?) ; le commentaire « listes cumulatives » de `CONTRAINTES` est faux
     pour les solides (pyramide en MS-GS, pas au CP).

