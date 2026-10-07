# Plan 10 — Ajouter la PS (petite section) et couvrir son programme

**But** : la PS (enfants de 3 ans, « avant 4 ans » dans les textes) devient une classe du site, au même titre que
la MS et la GS. Elle a ses compétences dans `src/data/programme.ts`, ses contraintes, son filtre « Classe », ses
exercices et ses fiches. Les exercices sont adaptés à des enfants qui ne lisent pas : consignes dites à voix
haute, images, très gros boutons, peu d'éléments à l'écran.

**Couvre le point du TODO** « Couverture complète PS, MS, GS, CP, CE1 » (volet PS) ; touche aussi la synthèse vocale (pas de voix bretonne).

**Avancement (2026-10-04)** : étapes 1 à 5 livrées et déployées. Décisions prises en cours de route :
- Formes : PS « la même forme » seulement ; MS « même forme » + « trouver » ; GS nommer, compter les côtés. Le
  rectangle n'apparaît qu'en GS. Slug `exercices-formes-ms-gs` gardé (niveau MS), `-ps` et `-gs` ajoutés.
- Motifs (`src/utils/motifs.js`, fonctions pures testées) : PS AB ; MS AB, ABB, AAB, ABC ; GS + AABB, ABCD,
  évolutif. Modes « Et après ? » et « Il en manque un ». Le mode « reproduire » du plan MS n'est pas fait.
- Longueurs (« Plus long, plus court ») : crayons alignés sur le même bord ; comparer (2 crayons) ou ranger
  (PS 3, MS 4, GS 5). La comparaison indirecte (bande témoin, GS) n'est pas faite.
- `ConsigneParlee` relit la consigne à chaque question (`:key="idx"`), en français seulement.

## Reste à couvrir en PS (relevé du 2026-10-07, `npm run couverture`)

11 compétences du programme de PS n'ont aucune ressource (exercice, fiche ou affiche) :

- `composer-decomposer` (nombres-calcul) : Composer et décomposer les petits nombres (« trois, c’est deux et un »)
- `problemes-maternelle` (nombres-calcul) : Résoudre de petits problèmes : réunir, ajouter, retirer, partager
- `assemblages-maternelle` (espace-geometrie) : Reproduire un assemblage (puzzle, pavage, tour de cubes)
- `moments-journee` (temps-espace) : Les moments de la journée : matin, soir, jour, nuit ; avant, après, maintenant
- `chronologie-maternelle` (temps-espace) : Remettre dans l’ordre des moments vécus, puis les étapes d’une histoire
- `reperes-espace` (temps-espace) : Dans, sur, sous, devant, derrière, à côté : situer un objet
- `categories-mots` (oral) : Ranger des mots-images par catégorie, trouver l’intrus
- `syllabes-orales` (lecture) : Scander, compter et manipuler les syllabes d’un mot à l’oral
- `nom-lettres` (lecture) : Connaître le nom des lettres et associer capitale, script et cursive
- `geste-ecriture-maternelle` (ecriture) : Tracer des formes de base (PS), les lettres capitales (MS), puis écrire en cursive (GS)
- `environnement-proche` (temps-espace) : Reconnaître l’école, le quartier ou le village et ses lieux (mairie, commerces, jardin)

Les sections ci-dessous ne gardent que les propositions qui répondent à ces manques ; les autres sont faites (historique : `git log -- plans/10-couverture-ps.md`). Les noms de fichiers cités (vues `.vue`, `activites.js`, `exercices.js`, `programme.ts`…) sont ceux de l'ancien monde, supprimé : le code d'un nouvel exercice est un module `src/exercices/<id>/` (`npm run nouveau`, voir `src/exercices/README.md`), le programme est `src/data/programme.ts`.

**Lettres, mode PS « Mon prénom »** (étape 8) : l'adulte tape le prénom (gardé dans le navigateur seulement, `chargerReglages`) ; l'enfant retrouve les lettres de son prénom (nom des lettres : `nom-lettres`). Les niveaux de l'exercice Lettres sont `gs` et `cp` alors que la compétence commence en PS : à ouvrir.

---

## 3. Couvrir la PS

### 3.0 Règles d'interface pour la PS (toutes les vues PS)

- **Consigne dite** à chaque nouvelle question (`useTTS().lire`), avec un gros bouton 🔊 pour la réécouter. Le
  texte reste affiché pour l'adulte, en petit.
- **2 à 4 choix au plus**, boutons d'au moins 96 px, images (emoji ou SVG) plutôt que du texte. Pas de chiffre
  comme seule réponse : constellations ou doigts d'abord, chiffre en option.
- **5 questions** par défaut. Pas de « Question 3 / 10 » écrit, juste des points de progression. Retour visuel et
  sonore immédiat, sans compte de fautes 💔 ni chronomètre.
- Une classe CSS commune (par exemple `.mode-ps` sur `.container`, dans `src/style.css`) plutôt que du CSS par
  vue.
- Un composant `ConsigneParlee.vue` (texte, bouton 🔊, lecture automatique désactivable, rien en breton tant
  qu'il n'y a pas de voix) : environ 0,5 jour, partagé par toutes les vues PS.

### 3.2 Nouveaux exercices (classés par intérêt ; chacun sert aussi la MS et la GS, où le rapport est rouge aujourd'hui)

Motifs et longueurs sont faits (PS, MS, GS). Les exercices ci-dessous ont trois niveaux dès le départ : chacun sert aussi la MS et la GS, où `npm run couverture` donne « rien » pour les mêmes compétences.

3. **La valise** `/maternelle/probleme` (`problemes-maternelle`, avec `composer-decomposer`). Courte animation :
   2 peluches dans la valise, on en ajoute 1, la valise se ferme, « Combien maintenant ? » (exemple exact de la
   p. 66). PS : total ≤ 3, ajout d'un seul objet. MS : ajout et retrait jusqu'à 6. GS : jusqu'à 10, partage. En
   papier, ce n'est pas un bon support : pas de fiche, mais des cartes à découper pour rejouer en classe.
   Effort : 1 à 1,5 jour.
4. **Range les images** `/maternelle/categories` (domaine `oral`, `categories-mots`). PS : deux boîtes (animaux /
   fruits) et 6 images, on touche une image puis sa boîte ; la voix nomme chaque image au toucher (vocabulaire,
   p. 47). MS : l'intrus parmi 4. GS : trouver le mot qui regroupe. Les emoji suffisent. Le contenu va dans
   `src/i18n/{fr,br}/contenu/categories.js` (breton à relire). Effort : environ 1 jour.
5. **Le jour, la nuit** `/maternelle/journee` (`moments-journee`, `chronologie-maternelle`). PS : « C'est le jour
   ou la nuit ? » (scènes 🌞 / 🌙), puis « Remets dans l'ordre » 3 images de la journée (se lever, manger,
   dormir), p. 24-25. MS : énoncer le moment, ordre d'une histoire en 3 ou 4 images. GS : 4 ou 5 étapes. Fiche :
   3 images à découper et à coller dans l'ordre. Effort : environ 1 jour (images SVG simples à dessiner).
6. **Où est le chat ?** `/maternelle/espace` (`reperes-espace`). PS : « Montre le chat **dans** la boîte » (sur,
   sous, devant, derrière), 3 images au choix (p. 26-27). Il faut des SVG composés (boîte, table, chat), car les
   emoji ne se superposent pas proprement. Effort : 1,5 jour, surtout pour les dessins.
7. **Frappe les syllabes** (`syllabes-orales`, dans `/maternelle/lettres` ou à part). PS : une image, la voix dit le
   mot, l'enfant touche un tambour autant de fois qu'il y a de syllabes (1 à 3) ; prénom en premier (p. 51).
   Réserve : la synthèse vocale découpe mal les syllabes. On s'appuie sur une liste de mots avec leur découpage
   écrit (« ba-teau »), affichée en ronds. Pas de version bretonne au début (le découpage breton est à faire
   valider). Effort : environ 1 jour.

Plus tard, avec du son enregistré : loto sonore (`sons-familiers`, p. 51), imagier de paires cour/tour (p. 49),
« le petit et l'adulte » des animaux (BO n° 19 p. 30, domaine absent de `programme.ts`).

### 3.3 Fiches à imprimer et affiches

Rappel BO n° 19 p. 9 : on limite les fiches. On privilégie donc le **matériel à manipuler**, et les fiches
restent courtes : une consigne, de 4 à 6 items, en grand.

- **Graphisme PS** (nouveau générateur `/imprimer/graphisme`, domaine `ecriture`, `geste-ecriture-maternelle`) :
  - une page par tracé de base (traits verticaux : la pluie ; horizontaux : les chemins ; points : les
    confettis ; ronds : les bulles ; boucles : la fumée), d'après la p. 56 et BO n° 19 p. 17 ;
  - gros pointillés à repasser puis espace libre, A4 paysage ;
  - MS : ponts, vagues, croix ; GS : enchaînements avant la cursive ;
  - fiches toutes prêtes dans `catalogue.js` (niveaux « PS · MS ») ;
  - le pointillé SVG simple de `src/impression/ecriture.js` ne convient pas (lignage Seyès) : il faut un
    dessin à part ;
  - effort : environ 1,5 jour.
- **Matériel à découper** (nouveau, `genre: 'fiche'` dans les domaines concernés) :
  - cartes constellations et doigts de 1 à 3, puis 1 à 6 (`denombrer-3`, `composer-decomposer`) ;
  - cartes formes de toutes tailles, couleurs et orientations, pour trier (p. 68) ;
  - cartes images par catégorie (p. 47) ;
  - 3 images de la journée à remettre dans l'ordre ;
  - étiquettes prénom en capitales.
  - Un générateur commun « planche de cartes » (grille 3 × 4, traits de coupe) ; effort : environ 1 jour.
- **Coloriage, gommettes** : variantes « colorie » ou « colle une gommette » des fiches Motifs, Formes PS et
  Longueurs. Les cases sont de la taille d'une gommette (environ 15 mm) et ne demandent aucune lecture.
- **Affiches** :
  - « Les nombres de 1 à 3 / 1 à 6 / 1 à 10 » (quantité, doigts, constellation, chiffre), une variante par
    classe, dans `AFFICHES_PROGRAMME`. Il faut une branche dans `respecte()` de `tests/logique.test.mjs`
    (`v <= c.nombreMax`).
  - « Les moments de la journée » (matin, midi, après-midi, soir, nuit ; p. 24).
  - L'affiche de l'alphabet reste en MS et après. Le texte PS ne parle que des lettres du prénom.
  - La fiche « Ce que je sais faire » PS sort toute seule quand les affiches résumé seront visibles.

### 3.4 Breton

- Pas de voix bretonne (TODO l. 75). En interface `br` : pas de lecture automatique. On affiche la consigne en
  breton en gros, pour que l'adulte la lise. Le bouton 🔊 est caché, ou réservé aux fichiers audio enregistrés
  quand il y en aura.
- Les nombres 1 à 6 sont vérifiés (`src/utils/nombres.js` l. 79, formes masculines). Les formes féminines
  (*div*, *teir*, *peder*) et les mutations après le nombre passent par `regles()`. À relire pour chaque nouvelle
  consigne avec un nom.

---

## 4. Ordre conseillé, effort, décisions

### 4.1 Étapes livrables

| # | Étape | Fichiers | Effort | Livrable | État |
|---|---|---|---|---|---|
| 6 | Graphisme PS + matériel à découper | 2 générateurs, catalogue | 2,5 j | premières fiches et affiches PS | à faire |
| 7 | Catégories, Journée, La valise | 3 vues | 3 à 3,5 j | domaine `oral` couvert pour la première fois | à faire |
| 8 | Lettres « Mon prénom », Espace, Syllabes | 2 ou 3 vues | 3 j | — | à faire |

Étapes 1 à 5 : faites. Reste : environ 8,5 jours (étapes 6 à 8).

### 4.2 Décisions à prendre (avec recommandation)

1. **« voire quatre »** : `nombreMax` 3 ou 4 ? *Recommandation* : 3 par défaut, avec une option « jusqu'à 4 »
   marquée « pour aller plus loin ». C'est la même lecture que le « voire au-delà » de la GS.
2. **Chiffres en PS** : les montrer ? *Recommandation* : en option, désactivée par défaut. Par défaut, on
   montre des constellations et des doigts, et on ne fait jamais tracer de chiffre.
3. **Étendre ou créer des compétences** : `formes-maternelle` et `geste-ecriture-maternelle` reçoivent la PS
   (libellé changé), ou on crée `formes-ps` et `graphisme-ps` ? *Recommandation* : étendre. C'est le même titre
   d'objectif dans le BO, et le tableau reste compact.
4. **Breton sans voix** : PS en breton avec la consigne lue par l'adulte, ou attendre des enregistrements ?
   *Recommandation* : publier avec la consigne écrite et lue par l'adulte, et prévoir les enregistrements dans
   le TODO.
5. **Renommer le domaine `temps-espace`** en « Se repérer dans le temps et l'espace » ? *Recommandation* : oui
   (l'`id` ne change pas, aucun slug ne change).
6. **Fiches PS** : combien ? *Recommandation* : peu, à cause du BO n° 19 p. 9. Graphisme et matériel à
   découper d'abord, une seule fiche par exercice PS, et 2 variantes prégénérées au lieu de 4.
