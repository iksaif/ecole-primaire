# Plan 14 — Ce qui reste de l'ancien monde (2026-10-07)

État après la session du 2026-10-07 : tous les exercices de `ancien.js` sont dans la base, le
registre `ancien.js` est supprimé, l'affiche de conjugaison est reportée. Ce plan décrit ce qui reste et comment le reporter.

## Fait dans cette session

| Élément | Où | Instantané | Remarques |
|---|---|---|---|
| Dictée | `src/exercices/dictee/`, `src/views/francais/DicteeView.vue` | 90/90 identiques | clé Mistral saisie dans les réglages (mode « phrases »), `mistral.ts` seul module réseau ; `tests/vie-privee.test.mjs` vérifie sur l'exercice : sans clé rien ne sort, avec une clé seulement api.mistral.ai (réponse simulée) |
| Grammaire | `src/exercices/grammaire/`, `src/views/francais/GrammaireView.vue` | 102/102 identiques | quatre modes de réponse (choix, clic sur les mots, ordre, saisie) dans la vue ; textes d'interface = textes de la fiche en français (`textes.ts` reprend `langues/fr/textes/grammaire.ts`) |
| Nettoyage | `ancien.js`, `PastilleMigration.vue`, `QuestionFrancais.vue`, `EtiquettesOrdre.vue`, `mesures/definition.js` supprimés | — | build des fiches (`--avec-anciens` retiré), tests `exercices` et `instantanes`, `capturer-fiches` (lit le registre de la base), compteur `exercicesMigres`, `/dev/couverture` (plus d'état « à reporter ») |
| Affiche de conjugaison | `src/affiches/conjugaison/` | 104 cas nouveaux (`affiches.json`) | une variante par fiche publiée (26, slugs de `main`) ; ancien code supprimé (`impression/affiches/conjugaison.js`, `affichesProgramme.js`, `api-build.js`, `views/imprimer/AffichesView.vue`) |

Le formulaire de l'affiche de conjugaison choisit le verbe, puis la série de temps : les variantes déclarent leurs `axes` (nouveau dans
le modèle d'affiche, `src/affiches/definir.ts`), et le formulaire montre une rangée de boutons par axe.

## Reste à reporter

### 1. Fiches d'écriture (Seyès) — `src/impression/ecriture.js`, `views/imprimer/EcritureView.vue`, `impression/catalogue.js`

Exercice « fiche seule » (`jeu: false`, décision du 2026-10-06). **Aujourd'hui, la base ne publie plus aucune des ~59 fiches d'écriture**
(26 lettres, 4 alphabets, chiffres, jours, mois, nombres ; en breton : alphabet, 3 listes, 25 lettres) : le build ne lit que les
registres. Trois manques du modèle d'exercice à régler d'abord :

1. **Une fiche publiée pour plusieurs classes** (« GS · CP · CE1 ») : une fiche de `definition.fiches` n'a qu'un `niveau`. Proposition :
   `classes?: readonly Classe[]` sur une fiche (métadonnées du catalogue), le niveau restant celui des réglages.
2. **Des fiches d'une seule langue de contenu** (les 29 fiches bretonnes n'existent pas en français ; les fiches françaises de mots n'ont
   pas de version bretonne) : `langues?: readonly Langue[]` sur une fiche, que le build respecte au lieu de décliner chaque langue.
3. **La mesure de texte dans la fiche** (taille de police par la hauteur d'x ou de majuscule, coupure des lignes) : passer à `fiche()` la
   mesure des affiches (`src/affiches/mesure.ts` : `mesureNavigateur` dans l'app, `mesureEstimee` au build), comme `ContexteDessin.mesure`.

Ensuite : `src/exercices/ecriture/` (définition : styles, contenu lettres / mots / texte, interligne, sauter, repasser, copie, couleur ;
`fiches` = les entrées de `catalogue.js` avec leurs slugs), vue « fiche seule » (`CadreExercice fiche-seule`), textes typés fr/br (les
`style_*`, titre, prénom, date). Capturer les fiches « avant » avec `scripts/dev/capturer-fiches.ts` (route `/imprimer/ecriture`,
fichier `--reglages`) pour que le report retrouve les mêmes PDF.

### 2. Affiches « Ce que je sais faire » — `impression/affiches/resume.js`, `impression/affiches/catalogue.js`

Cachées (`RESUMES_VISIBLES = false`, en attente de l'avis d'enseignants). À reporter seulement quand elles seront publiées : le modèle
d'affiche publie toutes ses variantes (il faudrait sinon une affiche « non publiée »). Phrases : `src/data/savoirs.js`.

### 3. Lecture et Quiz (hors compteur)

`views/LectureView.vue` (syllabes, reconstitution de mots, textes ; contenu dans `src/i18n/*/contenu/`) et `views/AutresView.vue`
(quiz de culture générale, « Le Monde »). Ni l'un ni l'autre n'a de définition ; la Lecture n'a pas de questions de compréhension
(TODO). Reporter comme les autres exercices (`npm run nouveau`), en écrivant d'abord les instantanés avec `capturer-fiches`.

### 4. Ensuite seulement

- `src/exercices/traducteur.ts` : sert encore aux textes d'affiches dans le build (`texteMulti`, `scripts/build/fiches/registres.ts`) ;
  à retirer quand ces textes seront lus par `traducteurAffiche`.
- L'ancien monde déconnecté (`src/views/`, `src/components/`, `src/composables/`, `src/i18n/`, `data/activites.js`,
  `impression/catalogue.js`, `impression/couverture.js`, `impression/exercices.js`, `router/ancien-routes.js`) : il ne sert plus qu'au
  rapport `npm run couverture`, au compteur `couverture` de `npm run qualite` et aux vues Lecture, Quiz, Écriture pas encore reportées.
  Une fois celles-ci reportées : réécrire le compteur sur `src/ressources/` (comme `/dev/couverture`), puis supprimer.
