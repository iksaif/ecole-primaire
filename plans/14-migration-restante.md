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

## Fait ensuite (2026-10-07, suite)

| Élément | Où | Instantané / vérification | Remarques |
|---|---|---|---|
| Écriture (Seyès) | `src/exercices/ecriture/`, `src/views/francais/EcritureView.vue` | 63/63 fiches publiées, mêmes slugs ; dans Chrome (polices chargées), HTML identique à l'ancien code (seul le balisage de l'en-tête change : `.bandeau` + `.entete`) | « fiche seule », sans hasard. Le build (node, `mesureEstimee`) pose 1 ou 2 copies de plus ou de moins sur 4 fiches (jours, mois, mois et nombres bretons) ; aucun texte ne sort du lignage (au pire à 0,5 mm du bord, mesuré dans Chrome) |
| Lecture | `src/exercices/lecture/`, `src/views/francais/LectureView.vue` | `tests/instantanes/lecture.json` (nouveau : l'ancienne fiche tirait avec Math.random) | syllabes, mots à reconstituer (OrdonnerClics), lecture à voix haute ; 5 découpages corrigés (é-co-le, nu-a-ge, i-ma-ge, ca-mion, pi-ra-nha) ; CE2 : décodage hors programme (raison donnée) ; textes Mistral facultatifs (test de vie privée) |
| Quiz | `src/exercices/quiz/`, `src/views/monde/QuizView.vue` | `tests/instantanes/quiz.json` (nouveau) | thèmes par classe d'après le programme (`definition.ts`) ; banques `questions/fr.ts`, `br.ts` ; rangé dans « Plusieurs domaines » sur la page du Monde |

Évolutions du modèle d'exercice faites pour ces reports (`src/noyau/types.ts`, `definir.ts`) :
- fiche publiée pour plusieurs classes (`fiches[].classes`) et dans une seule langue (`fiches[].langues`, slug tel quel) ; compétences
  d'une telle fiche : `competencesDeFiche` ;
- réglages libres (texte) dans une fiche publiée, vérifiés par le type de leur défaut ;
- `aleatoire: false` (un exemplaire, pas de graine), `bilanParClasse: false`, `corrige` (booléen ou fonction des réglages) ;
- `ParamsFiche.mesure` (la mesure des affiches) et `ParamsFiche.polices` (script et attaché) ; `ParamsGenerateur.langue` (banque du quiz) ;
- « Personnaliser » d'une fiche publiée : `?fiche=<id>&niveau=<classe>` ouvre l'exercice réglé comme elle (useReglages) ;
- langue du contenu au choix (`src/noyau/langueContenu.ts`, `ChoixLangueContenu` dans le cadre ; `?contenu=br`) ;
- Mistral mis en commun (`src/noyau/mistral.ts`, `CleMistral.vue`) pour la Dictée et la Lecture.

## Reste

### 1. Affiches « Ce que je sais faire » — `impression/affiches/resume.js`, `impression/affiches/catalogue.js`

Cachées (`RESUMES_VISIBLES = false`, en attente de l'avis d'enseignants). À reporter seulement quand elles seront publiées : le modèle
d'affiche publie toutes ses variantes (il faudrait sinon une affiche « non publiée »). Phrases : `src/data/savoirs.js`.

### 2. Retirer l'ancien monde

Plus aucun exercice ni affiche publiée n'en dépend. Ce qui le retient encore :
- `src/components/ApercuImpression.vue` et `SignalerErreur.vue` (lus par `CadreExercice` et `FormulaireAffiche`) : à déplacer dans le noyau ;
- un import de `src/i18n/index.js` et `src/exercices/traducteur.ts` (textes d'affiches du build, `texteMulti`) : à lire par `traducteurAffiche` ;
- le rapport `npm run couverture` et les compteurs `couverture`, `ancienMondeNonReporte`, `importeursAncienSocle` de `npm run qualite` :
  à réécrire sur `src/ressources/` (comme `/dev/couverture`) ;
- `src/data/languesRegionales.js` (ancienne vue de la langue régionale) et `src/data/activites.js`.
Ensuite : supprimer `src/views/` (ancien), `src/components/`, `src/composables/`, `src/i18n/`, `impression/catalogue.js`, `couverture.js`,
`exercices.js`, `router/ancien-routes.js`.
