# Plan 16 — La géométrie du cycle 2 (CP, CE1, CE2)

**État (2026-10-13)** : fait (commit `95d43c7`). L'ancien exercice `geometrie` est coupé en cinq exercices, un par groupe de compétences,
sur un moteur commun `src/moteurs/geometrie/` (comme la grammaire) : `figures` (CP-CE2 ; figures, angles, aigu/obtus, « justifier »,
propriétés, cercle), `solides` (CP-CE2 ; + patrons au CE2), `symetrie` (CE2), et deux exercices refaits d'après le BO avec leur propre
code : `tracer-regle` (CP-CE2 ; points alignés, compléter, reproduire, construire avec des mesures) et `reperage` (CP, CE1 ; coder le
déplacement d'un robot). Programme : compétence `alignements` (CP, CE1), `reperage-deplacements` sans le CE2, libellé de
`tracer-figures` élargi. Les slugs publiés qui ont encore un contenu au programme sont gardés ; les bilans `exercices-geometrie-ce1`,
`-ce2` et `-ce2-reperage` (hors programme) ont disparu ; `/maths/geometrie` renvoie vers `/maths`. `relier-points` est abandonné (pas de
compétence propre). Regards critiques (enfant, enseignant·e) passés deux fois, suites faites.

Source : annexe 4 du BO n° 41 du 31 octobre 2024, `docs/programmes/c2maths.md`, pages 31 à 36 (pages du PDF). Les « exemples de
réussite » sont ce que l'élève doit savoir faire : ce sont eux qui font foi pour un exercice.

## 1. Ce que dit le BO

Le domaine s'appelle **« Espace et géométrie »**. Il a trois parties au CP et au CE1, **deux au CE2** (pas de « repérage dans l'espace »
au CE2 : le sommaire et le texte sautent de la géométrie plane du CE2 à « Organisation et gestion de données »).

### Les solides

| | CP (p. 31-32) | CE1 (p. 33-34) | CE2 (p. 35) |
| --- | --- | --- | --- |
| Reconnaître | cube, boule, cône, cylindre, pavé | + pyramide | idem |
| Nommer | cube, pavé, boule | cube, boule, pavé, cône, pyramide | + cylindre |
| Décrire | cube, pavé avec « face » ; nombre et nature des faces | cube, pavé, pyramide : « face », « sommet », « arête » ; nombre d'arêtes et de sommets | + nature des faces d'une pyramide ; justifier par les faces |
| Construire | cubes et pavés (assembler les faces d'un modèle) | cube, pavé, pyramide | + **cube à partir d'un patron** ; dire si un assemblage est un patron du cube |
| Représentations | — | photos, perspective cavalière (associer, pas dessiner) | perspective : faces et arêtes cachées, pointillés |

Notes : « au CP […] le cube n'est pas considéré comme un pavé » ; activités suggérées : intrus, jeu de Kim, jeu du portrait.

### La géométrie plane

| | CP (p. 32) | CE1 (p. 34) | CE2 (p. 36) |
| --- | --- | --- | --- |
| Figures | reconnaître et nommer disque, carré, rectangle, triangle ; décrire carré, rectangle, triangle avec « sommet » et « côté » | + cercle, triangle rectangle ; nombre de sommets et de côtés d'un polygone | + losange ; polygone, quadrilatère, pentagone, hexagone |
| Propriétés | carré, rectangle : côtés égaux (pour justifier) | **angles et égalités de longueur des carrés et rectangles** ; « ce n'est pas un rectangle car… » | + losange ; « ce n'est pas un carré car… » |
| Alignement | **repérer visuellement des alignements ; utiliser la règle pour repérer ou vérifier des alignements** ; dire si trois points sont alignés (règle quand ce n'est pas évident) ; **tracer une droite passant par deux points** (horizontale, verticale, oblique) ; d'abord des objets réels, puis « des points (représentés par des petites croix) sur une feuille » | **repérer et tracer des points alignés** ; dire sans règle quand il n'y a aucun doute | — |
| Tracer, reproduire | règle comme instrument de tracé ; construire carré, rectangle, triangle ou un assemblage sur papier **quadrillé ou pointé** (côtés sur les lignes) ; **compléter un rectangle dont deux côtés consécutifs sont tracés, un carré dont un côté est tracé** ; gabarits et pochoirs | règle graduée, équerre, compas ; sur papier quadrillé, pointé ou uni, **compléter ou tracer** carré, rectangle, triangle, triangle rectangle ; **côtés obliques** possibles | + sur tout support, avec des **longueurs données** (rectangle 7 cm × 3 cm, carré de 6 cm et cercle de 4 cm de rayon…) ; codage des longueurs égales |
| Angle droit | — | **identifier et tracer** un angle droit (gabarit, puis équerre) ; aigu, obtus ; code de l'angle droit | dire si chaque angle d'un polygone est droit ; coder un rectangle |
| Cercle | — | tracer un cercle au compas, de centre donné, passant par un point ; centre | + rayon, diamètre |
| Milieu | — | trouver le milieu d'un segment (par pliage) | vocabulaire |
| Symétrie | — | — | **axe de symétrie** (pliage, calque, objets usuels, lettres) ; **compléter une figure** sur quadrillage ou papier pointé (axe vertical ou horizontal) |

### Le repérage dans l'espace (CP et CE1 seulement)

| | CP (p. 33) | CE1 (p. 34-35) |
| --- | --- | --- |
| Vocabulaire | gauche, droite ; sur, sous, entre, devant, derrière, au-dessus, en dessous | + à gauche, à droite ; près, loin |
| Plans | plan de la classe (positions des camarades, objet caché) ; choisir la photo qui correspond à une maquette | plan de l'école, du quartier ; itinéraire |
| Coder un déplacement | avancer, reculer, tourner à droite, à gauche, monter, descendre ; robot sur tapis quadrillé : « avancer d'une case », « pivoter d'un quart de tour à droite / à gauche » ; **au plus dix instructions, dont deux virages** | « avancer de… », pivoter ; **au plus quinze instructions, dont quatre virages** ; coder un déplacement qu'un autre trace sur un plan |
| Assemblages | assemblages de cubes et de pavés d'après un modèle 3D ou une photo | idem, ou d'après une perspective cavalière |

**Ce que le BO ne dit pas** : nommer une case par ses coordonnées (« B3 ») n'apparaît nulle part au cycle 2 (ni au cycle 3 : on y repère
des points sur une demi-droite graduée).

## 2. Ce qui reste

- **Breton** : relecture humaine de tous les textes nouveaux des cinq exercices (marqués `// br: à relire`).
- **Positions relatives** (sur, sous, entre, à gauche de… ; plan de la classe), CP et CE1 : pas de compétence ni d'exercice. À décider :
  une compétence `positions-relatives` et un exercice d'images, ou rien (c'est surtout une activité de classe).
- **Solides au CE2** : la perspective avec les faces et les arêtes cachées en pointillé n'est pas proposée.
- **Hors écran, en fiches seulement si on les fait** : construire des solides, plier pour trouver le milieu d'un segment, tracer un
  cercle au compas (CE1 : centre donné ; CE2 : rayon de 4 cm).
- Avertissement « Imprimer à 100 % » : en rouge sur la fiche imprimée ; le passer en orange dans le formulaire et le retirer de la fiche,
  comme pour Mesures ? (`docs/TODO.md`)
