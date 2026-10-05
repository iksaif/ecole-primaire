// @ts-check
// Orthographe — définition (format : src/exercices/README.md). Programme : src/data/programme.js (CONTRAINTES : pluriels,
// feminins ; HORS_PROGRAMME : homophones-grammaticaux) ; décisions : plans/09, « Décisions français », 1 et 2.
//   Accords : CP-CE1, féminin en -e et pluriel en -s (BO n° 41 p. 92-93) ; CE2, pluriels en -x et -al/-aux, féminins qui
//   s'entendent (blanche, grosse) (p. 94). Chaque question porte `niv`, l'année où elle entre au programme (src/data/orthographe.js) :
//   un niveau propose les questions de son année et des années précédentes.
//   Lettres manquantes : CP, correspondances graphèmes-phonèmes ; CE1, mots irréguliers fréquents (p. 90).
//   Homophones grammaticaux (a/à, et/est…) : dans aucun texte du programme en vigueur ; « pour aller plus loin » du CE2
//   au CM2 (horsProgramme), jamais choisis par défaut. Le CM1 et le CM2 proposent les mêmes questions que le CE2.
//   « CP → CM2 » (réglage `tous`, bonus) : toutes les questions des trois thèmes, homophones d'abord. C'est la fiche publiée
//   exercices-orthographe-cp-cm2 (avant les niveaux) ; ce n'est pas une classe, d'où un réglage et non un niveau.
// Défaut : CE1, thème Accords (le bilan d'une classe est la fiche « Accords »).
// Contenu toujours en français (exercice de français), même avec l'interface en breton.

/** Thèmes, dans l'ordre des boutons : id, icône, niveau d'entrée par défaut de leurs questions. */
export const THEMES = [
  { id: 'accords', icone: '🤝', niv: 'cp' },
  { id: 'lettres', icone: '🔡', niv: 'cp' },
  { id: 'homophones', icone: '👂', niv: 'ce2' },
]
export const ORDRE_NIVEAUX = ['cp', 'ce1', 'ce2', 'cm1', 'cm2', 'tous']
/** Rang d'un niveau (« tous » : après tous les autres). */
export const rang = n => ORDRE_NIVEAUX.indexOf(n)

const RAISON_HOMOPHONES = 'Les homophones grammaticaux ne figurent dans aucun texte du programme en vigueur : pour aller plus loin'
// cycle 2 : orthographe lexicale et accords ; cours moyen : les accords (la couverture annoncée jusqu'ici)
const COMPETENCES = { cycle2: ['orthographe-lexicale', 'accords-gn'], cm: ['accords-gn'] }
const niveau = (themes, competences) => ({
  competences,
  options: { theme: themes, tous: [false, true] },
  reglages: { theme: 'accords', tous: false },
  bonus: { tous: [true] },
  ...(themes.includes('homophones') ? { horsProgramme: [{ reglage: 'theme', option: 'homophones', raison: RAISON_HOMOPHONES }] } : {}),
})
const SANS = ['accords', 'lettres']
const AVEC = ['accords', 'lettres', 'homophones']

/** @type {import('../index.js').DefinitionExercice} */
export default {
  id: 'orthographe',
  route: '/francais/orthographe',
  domaine: 'vocabulaire',
  contenu: 'fr',
  niveauDefaut: 'ce1',
  reglages: { nb: 10 },
  options: { nb: [5, 10, 15] },
  niveaux: {
    cp: niveau(SANS, COMPETENCES.cycle2), ce1: niveau(SANS, COMPETENCES.cycle2), ce2: niveau(AVEC, COMPETENCES.cycle2),
    cm1: niveau(AVEC, COMPETENCES.cm), cm2: niveau(AVEC, COMPETENCES.cm),
  },
  // fiches par compétence ; la fiche « Accords » est le bilan de chaque classe (réglages par défaut)
  fiches: [
    ...['cp', 'ce1', 'ce2'].map(n => ({ id: 'lettres-manquantes', competence: 'orthographe-lexicale', niveau: n, reglages: { theme: 'lettres' } })),
    { id: 'homophones', competence: 'orthographe-lexicale', niveau: 'ce2', reglages: { theme: 'homophones' } },
  ],
}
