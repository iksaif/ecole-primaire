# Plan 10 — Couvrir le programme du CP au CE2

**But** : chaque compétence de `src/data/programme.ts` travaillée au CP, au CE1 et au CE2 a au moins un exercice (qui s'imprime aussi) ou,
quand un exercice n'a pas de sens, une fiche ou une affiche ; aucune option ne sort des `CONTRAINTES` du niveau. Remplace les plans
`10-couverture-cp.md` et `-ce1.md` du 2026-10-07 (écrits pour l'ancien code ; historique : `git log -- plans/`). La maternelle : plan 14.

Un exercice nouveau se crée par `npm run nouveau` (`src/exercices/README.md`) ; un niveau ou un type de plus va dans la `definition.ts`
de l'exercice. Un type coché par défaut change des fiches publiées : instantanés regardés, `--maj`, écart dit dans le commit ; les slugs
existants ne changent pas.

## 1. Ce qui manque (relevé du 2026-10-13, `npm run couverture`)

Compétences sans aucune ressource (exercice, fiche ou affiche) ; « Questionner le monde » (vivant, corps, matière, objets, histoire,
géographie, EMC) est à part, en bas.

| Domaine | CP | CE1 | CE2 |
| --- | --- | --- | --- |
| Nombres et calcul | `ordinaux`, `sens-multiplication`, `problemes-additifs`, `problemes-multiplicatifs`, `problemes-etapes` | `ordinaux`, `parite-multiples`, `fractions-comparer`, `fractions-additionner`, `sens-multiplication` | `parite-multiples`, `fractions-comparer`, `fractions-additionner`, `sens-multiplication` |
| Grandeurs et mesures | `longueurs`, `masses` | — | `perimetre` |
| Données | `tableaux-diagrammes` | `tableaux-diagrammes` | `tableaux-diagrammes` |
| Lecture | `son-lettres`, `comprendre-texte` | `comprendre-texte` | `comprendre-texte` |
| Vocabulaire | `ordre-alphabetique`, `synonymes-antonymes`, `familles-mots` | — | `accents-lettres` |
| Grammaire | `classes-mots` | — | — |
| Breton | `date-langue-regionale` | `date-langue-regionale` | — |

Questionner le monde et EMC : CP `vivant-non-vivant`, `proteger-environnement`, `parties-corps`, `hygiene-vie`, `aliments-equilibre`,
`masse-mesurer`, `objet-technique-besoin`, `situer-evenements`, `plan-ecole`, `symboles-republique`, `droits-libertes-egalite` ; CE1
`proteger-environnement`, `hygiene-vie`, `croissance-corps`, `aliments-equilibre`, `cerveau-attention`, `air-existe`, `masse-mesurer`,
`instructions-robot`, `objet-technique-besoin`, `parties-objet-technique`, `traces-du-passe`, `villes-peuplement`, `climats-reliefs`,
`symboles-republique`, `laicite`, `dangers-alerter` ; CE2 `proteger-environnement`, `cerveau-attention`, `solide-liquide-gaz`,
`masse-mesurer`, `instructions-robot`, `objet-technique-besoin`, `parties-objet-technique`, `prehistoire`, `rome-gaule`,
`royaume-de-france`, `symboles-republique`, `laicite`, `dangers-alerter`, `bien-commun-institutions`.

## 2. Propositions (du plus rentable au plus long)

1. **Ordinaux** (CP, CE1), dans `numeration` : une file d'images, « Quelle est la quatrième voiture ? », « Je suis le troisième, combien
   devant moi ? », « ABGFABGF… : quelle est la 17e lettre ? » ; rangs ≤ 20 au CP, ≤ 100 au CE1 (c2maths p. 4 et p. 11). Coché par
   défaut seulement là où il est au programme.
2. **Pair ou impair** (CE1, CE2), dans `numeration` : « 347 est-il pair ? », « Entoure les nombres pairs », « Écris les nombres pairs
   entre 767 et 778 » ; et une suite évolutive (+1, +2, +3…) dans `suites`.
3. **Fractions : comparer, additionner** (CE1, CE2), dans `fractions` : deux barres de même longueur et `<`, `=`, `>` (CE1 : même
   dénominateur ou numérateur 1, pas de fractions égales) ; `a/d + b/d` et `a/d − b/d` entre 0 et 1, complément à l'unité ;
   « 3/8 = 1/8 + … + … ».
4. **Sens de la multiplication** (CP → CE2), dans `calcul-mental` : un quadrillage de points, « Combien de points ? Écris-le avec × »
   (4 × 6 et 6 × 4 acceptés), « 7 + 7 + 7 = … × … » ; au CP, addition itérée sans le signe × (c2maths p. 13).
5. **Problèmes au CP**, dans `problemes` : ajout, retrait, parties-tout jusqu'à 100 ; deux étapes et multiplicatif ≤ 30
   (`problemesMax`) ; pas de comparaison (CE1) ni de × ou ÷ dans les corrigés.
6. **Mesures au CP**, dans `mesures` : mesurer à la règle (≤ 15 cm, sans mm), unité adaptée (cm, m), comparer « 1 m … 85 cm », ranger
   trois boîtes d'après deux pesées dessinées (balance Roberval, sans unité). **Périmètre** au CE2 (avec dm et tonne, voir le TODO).
7. **Vocabulaire au CP**, dans `vocabulaire` : ordre alphabétique par la première lettre, contraires, synonymes, familles (chant /
   chanter), préfixes dé-, re-, in- ; mots courts et déchiffrables, pas de définitions. **Accents** au CE2 (`accents-lettres`).
8. **Classes de mots au CP**, dans `grammaire-mots` : « Range les mots dans la boîte des noms ou des verbes » (corpus, sans nommer les
   natures comme objectif, BO n° 41 p. 92 ; décision D3).
9. **Le son des lettres** (CP, et GS au plan 14), dans `lettres` : un mot illustré, « Par quelle lettre commence… ? » ; sans les
   occlusives en GS ; contenu en français (décision D5). Avec la cursive et b/d, p/q (TODO, « Lettres »).
10. **Données** (CP → CE2), un exercice nouveau `donnees` (domaine `donnees`, le seul sans aucune ressource du CP au CM2) : compter des
    bâtons et remplir un tableau, lire un diagramme en barres (« le plus », « combien de plus que… »), compléter un diagramme, tableau à
    double entrée ; effectifs < 40 au CP, < 100 au CE1. Et une affiche « Lire un diagramme en barres ».
11. **Lecture : comprendre un texte, fluence, pseudo-mots** (CP → CE2), dans `lecture` (dont le mode « Lecture de textes » n'a aujourd'hui
    aucune question) : textes courts écrits à la main avec trois à six questions à choix (personnage, lieu, ordre, reprise « il = … »,
    inférence simple) ; fiche « Lire en une minute » (nombre cumulé de mots en marge, objectifs 30, 70, 90 mots, règle de comptage
    écrite et testée) ; pseudo-mots. Le plus long : les textes sont à faire relire (plan 07).
12. **La date en breton** (CP, CE1) : « Peseurt deiz eo hiziv ? », une affiche ou un exercice sur les jours et les mois déjà vérifiés.
13. **Questionner le monde** : à part, après la maternelle (plan 14, lots A et B : le moteur « Trier les images » servirait aussi
    vivant / non vivant, matériaux, tri des déchets au CP).

## 3. Décisions à prendre (avec recommandation)

- **D1** — `fiche-doubles-et-moities-cp` : la régénérer (même slug) avec les doubles et moitiés du programme ? *Oui.*
- **D3** — Classes de mots au CP : un tri noms / verbes ? *Oui*, sans nommer d'autres natures. Sinon `classes-mots` reste vide au CP.
- **D5** — Le son des lettres sur skoolik : contenu en français, consignes traduites ? *Oui.*
- **D6** — Données : un vrai exercice (CP → CE2) plutôt qu'une fiche seule ? *Oui.*
- **D7** — Textes de lecture écrits par l'agent, publiés avec la mention de relecture, relus ensuite (plan 07) ? *Oui.*
- **Tables au CE1** : garder 2, 3, 4, 5 et 10 par défaut, ajouter « 6 à 9 (fin d'année) » en option non cochée ? *Oui.*
- **Ordinaux en breton** : en chiffres seulement (`1añ, 2vet…`, à relire) tant que les mots n'ont pas de source ? *Oui.*

## 4. Points de `programme.ts` à revoir (CP, CE1)

- `problemes-additifs` : « comparaison » commence au CE1 (c2maths p. 17) ; au CP, parties-tout seulement. Une contrainte ou une
  `interpretation`. `problemesMax: 30` ne vaut que pour deux étapes et le multiplicatif : le nom de la clé peut tromper un test.
- `ordinaux` : bornes « jusqu'au vingtième » (CP) et « jusqu'à cent » (CE1) absentes de `CONTRAINTES`.
- Calcul mental : les stratégies du CP et du CE1 (50 − 6, 13 × 7 = 70 + 21, moitié de 46 par décomposition) et la fluence en calcul
  (8 égalités en une minute…) n'ont pas de compétence : `strategies-calcul` ? « Ajouter 9 » au CP, « retirer 9 » au CE1.
- `son-lettres` et `nom-lettres` au CP : sources de maternelle seulement ; garder le CP est une interprétation à écrire.
- `familles-mots` : l'extrait oublie que les affixes commencent au CP (bo41 p. 88).
- `phrase` : la forme exclamative manque au libellé (CP p. 92, CE1 p. 93).
- `classesMots: []` au CP : une clé distincte (`classesMotsCorpus`) séparerait « trier » de « nommer » (D3).
- Sans compétence, assumé : produire des écrits (CP p. 82, CE1 p. 83), l'oral au cycle 2, polysémie et niveaux de langue (p. 88-89),
  construire cubes et pavés à partir de leurs faces (CP p. 32).
- `solides` au CE1 : le cylindre est reconnu, pas nommé (nommé au CE2) ; le QCM de nom l'accepte en reconnaissance.
