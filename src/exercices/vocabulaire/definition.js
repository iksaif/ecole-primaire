// @ts-check
// Vocabulaire — définition (format : src/exercices/README.md). Programme : src/data/programme.js
//   ordre alphabétique et dictionnaire, synonymes et contraires, familles de mots, préfixes et suffixes
//   (compétences ordre-alphabetique, synonymes-antonymes, familles-mots : du CP au CM2) ; audit : plans/09, étape 2.
//   CE1 : mots-étiquettes (catégories), lettre avant / après, préfixes ; CE2 : mots-repères du dictionnaire, sens dans la
//   phrase, sens propre / figuré, suffixes.
//   « Mots qui se disent pareil » (homonymes) : le mot est du cycle 3 (programme du cycle 3 p. 16, exemples de réussite du
//   CM1 p. 11), le CE2 travaille la polysémie : proposé en bonus, jamais par défaut.
// Par défaut, « Contraires » seul à chaque niveau (le bilan publié exercices-vocabulaire-<niveau>).
// Contenu toujours en français (exercice de français), même avec l'interface en breton.

const CE1 = ['ce1']
const CE2 = ['ce2']
const TOUS = ['ce1', 'ce2']

/**
 * Groupes de types d'exercice (titres : g_<id> du catalogue, libellés : type_<id>), avec l'icône du bouton et les niveaux
 * où le type est proposé. L'ordre est celui des boutons et des réglages (l'ordre des types change la fiche).
 */
export const GROUPES = [
  { id: 'dico', types: [
    { id: 'alpha', icone: '🔤', niveaux: TOUS },
    { id: 'lettre', icone: '🅰️', niveaux: CE1 },
    { id: 'dictionnaire', icone: '📕', niveaux: CE2 },
    { id: 'definitions', icone: '📖', niveaux: TOUS },
    { id: 'contexte', icone: '🔎', niveaux: CE2 },
  ] },
  { id: 'sens', types: [
    { id: 'contraires', icone: '↔️', niveaux: TOUS },
    { id: 'synonymes', icone: '🟰', niveaux: TOUS },
    { id: 'homonymes', icone: '👂', niveaux: CE2 },
    { id: 'sensFigure', icone: '🎭', niveaux: CE2 },
  ] },
  { id: 'construction', types: [
    { id: 'familles', icone: '👨‍👩‍👧', niveaux: TOUS },
    { id: 'prefixes', icone: '🧩', niveaux: TOUS },
    { id: 'suffixes', icone: '🔚', niveaux: CE2 },
    { id: 'categorie', icone: '🏷️', niveaux: CE1 },
    { id: 'intrus', icone: '🕵️', niveaux: CE1 },
  ] },
]
/** Types d'un niveau, dans l'ordre des groupes. */
export const typesDuNiveau = niveau => GROUPES.flatMap(g => g.types).filter(t => t.niveaux.includes(niveau)).map(t => t.id)
/** Types proposés en bonus (hors programme du niveau), jamais cochés par défaut. */
const BONUS = { ce2: ['homonymes'] }

const COMPETENCES = ['ordre-alphabetique', 'synonymes-antonymes', 'familles-mots']
const niveau = n => ({
  competences: COMPETENCES,
  options: { types: typesDuNiveau(n) },
  ...(BONUS[n] ? { bonus: { types: BONUS[n] } } : {}),
  reglages: { types: ['contraires'] },
})

// Fiches par compétence : les types de la compétence qui existent au niveau (mêmes fiches que src/impression/exercices.js)
const FICHES = [
  { id: 'ordre-alphabetique', competence: 'ordre-alphabetique', types: ['alpha', 'lettre', 'dictionnaire', 'definitions', 'contexte'], niveaux: TOUS },
  { id: 'sens', competence: 'synonymes-antonymes', types: ['contraires', 'synonymes', 'sensFigure'], niveaux: TOUS },
  { id: 'familles', competence: 'familles-mots', types: ['familles', 'prefixes', 'suffixes'], niveaux: TOUS },
  { id: 'categories', competence: 'familles-mots', types: ['categorie', 'intrus'], niveaux: CE1 },
]

/** @type {import('../index.js').DefinitionExercice} */
export default {
  id: 'vocabulaire',
  route: '/francais/vocabulaire',
  domaine: 'vocabulaire',
  contenu: 'fr',
  niveauDefaut: 'ce1',
  reglages: { nb: 10 },
  options: { nb: [5, 10, 15] },
  niveaux: { ce1: niveau('ce1'), ce2: niveau('ce2') },
  fiches: FICHES.flatMap(f => f.niveaux.map(n => ({
    id: f.id, competence: f.competence, niveau: n, reglages: { types: typesDuNiveau(n).filter(t => f.types.includes(t)) },
  }))),
}
