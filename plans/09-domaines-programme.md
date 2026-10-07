# Plan 09 — Programme : décisions de contenu et trous connus

L'organisation par domaine du programme (référentiel `src/data/programme.ts`, catalogue unique, affiches et fiches par domaine, pages par domaine, fiches par
compétence et bilans) est **faite** ; les audits d'avril à octobre ont corrigé les options qui sortaient du programme (tests : `tests/exercices.test.mjs`,
`tests/programme-francais.test.mjs`). Ce plan ne garde que ce qui sert encore : les décisions et leurs sources (les définitions d'exercices y renvoient), le
tableau de l'audit français pour ses « manquants », et la liste de ce qui n'a pas pu être vérifié. Le suivi de la couverture est dans `npm run couverture` et
dans les plans `10-couverture-*.md`.

## Compétences sans activité au CE2-CM2 et « tous niveaux » (relevé du 2026-10-04, à recouper avec `npm run couverture`)

PS à CE1 : voir les plans `10-couverture-*.md`.

- **CM1-CM2** : fractions (> 1, d'une quantité), nombres décimaux, grands nombres (6 et 9 chiffres), multiplication
  et division posées, opérations sur les décimaux, aires, angles, périmètre, proportionnalité, probabilités,
  diviseurs et critères de divisibilité, compléments (COD/COI, CC), passé simple. Seules les tables, le calcul mental
  (sans décimaux), la dictée, l'orthographe et la conjugaison montent au CM.
- **Tous niveaux** : organisation et gestion de données (tableau, diagramme en barres, tableau à double entrée,
  dès le CP), motifs organisés (cycle 1), multiplication posée (CE2), comparaison et addition de fractions, phrase
  (ponctuation, types et formes), fluence de lecture.

## Étape 2 — audit français (2026-10-04) : niveaux, corrections faites, manquants et points à trancher

Périmètre : les exercices de français, Lettres et le quiz de l'époque (anciennes vues, aujourd'hui dans `src/exercices/<id>/`). Référence : `CONTRAINTES` et `COMPETENCES` de `src/data/programme.ts`, et les textes eux-mêmes (BO n° 41 p. 85-94, programme de français
du cycle 3 p. 16-19) quand une notion n'est pas dans `programme.ts` (compléments, phrase complexe, nom noyau).
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
| Quiz (Autres) | CP→CM2 | — | — | Culture générale, hors des programmes de français et de mathématiques. Pas de domaine dans `programme.ts` : rien à vérifier. |

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

Toutes ces sources sont dans `SOURCES` de `programme.ts`.

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
- **Dans le code.** Nouvelle liste `HORS_PROGRAMME` dans `programme.ts`, entrée `homophones-grammaticaux`, avec la
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

## Ce qui n'a pas pu être vérifié (2026-10-04)

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
