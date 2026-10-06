// @ts-check
// Grammaire — définition (format : src/exercices/README.md). Programme : src/data/programme.js
//   Au cycle 2, les compléments ne sont pas distingués entre eux (« l'étude des compléments circonstanciels est
//   réservée au cycle 3 », BO n° 41 p. 91) ; CM1 : nom noyau, complément d'objet / circonstanciel ; CM2 : CC de temps
//   et de lieu, phrase simple / complexe (programme de français du cycle 3, p. 17-19). Audit : plans/09, étape 2.
//   CE1 : pluriel en -s seulement, accord de l'adjectif en -e et -s ; le -x et les accords irréguliers arrivent au CE2.
// Chaque type d'exercice (id) porte les niveaux où il est proposé ; tout ce qu'un niveau propose est au programme.
// Par défaut, « Trouver le verbe » seul à chaque niveau : c'est le bilan publié (exercices-grammaire-<niveau>).
// Contenu toujours en français (exercice de français), même avec l'interface en breton.

const CE = ['ce1', 'ce2']
const CM = ['cm1', 'cm2']
const TOUS = [...CE, ...CM]

/**
 * Groupes de types d'exercice (titres : groupe_<id> du catalogue, libellés : type_<id>), avec l'icône du bouton et les
 * niveaux où le type est proposé. L'ordre est celui des boutons et des réglages (l'ordre des types change la fiche).
 */
export const GROUPES = [
  { id: 'phrase', types: [
    { id: 'ordre', icone: '🧩', niveaux: ['ce1'] },
    { id: 'phrase', icone: '🤔', niveaux: ['ce1'] },
    { id: 'majuscule', icone: '🔠', niveaux: ['ce1'] },
    { id: 'ponctuation', icone: '❓', niveaux: ['ce1'] },
    { id: 'negation', icone: '🚫', niveaux: TOUS },
    { id: 'negReconnaitre', icone: '🔍', niveaux: TOUS },
    { id: 'complexe', icone: '🔗', niveaux: ['cm2'] },
  ] },
  { id: 'nature', types: [
    { id: 'verbe', icone: '🏃', niveaux: TOUS },
    { id: 'nom', icone: '🏠', niveaux: TOUS },
    { id: 'det', icone: '👉', niveaux: TOUS },
    { id: 'adj', icone: '🎨', niveaux: TOUS },
    { id: 'nature', icone: '🏷️', niveaux: TOUS },
    { id: 'gnNoyau', icone: '🎯', niveaux: CM },
  ] },
  { id: 'fonctions', types: [
    { id: 'sujet', icone: '👤', niveaux: TOUS },
    { id: 'pronom', icone: '🔁', niveaux: TOUS },
    { id: 'cplt', icone: '📍', niveaux: CM },
    { id: 'cpltQ', icone: '⏰', niveaux: ['cm2'] },
    { id: 'cpltNature', icone: '⚖️', niveaux: CM },
  ] },
  { id: 'genreNombre', types: [
    { id: 'genre', icone: '♀️', niveaux: ['ce1'] },
    { id: 'nombre', icone: '🔢', niveaux: ['ce1'] },
    { id: 'pluriel', icone: '➕', niveaux: TOUS },
    { id: 'accordGN', icone: '🤝', niveaux: TOUS },
  ] },
  { id: 'accordSV', types: [
    { id: 'accordSV', icone: '🔗', niveaux: TOUS },
  ] },
]
/** Types d'un niveau, dans l'ordre des groupes. */
export const typesDuNiveau = niveau => GROUPES.flatMap(g => g.types).filter(t => t.niveaux.includes(niveau)).map(t => t.id)
/** Tous les types, dans l'ordre des groupes (ordre des sections d'une fiche : l'ancien ordre, où « complexe » suivait « ponctuation »). */
export const ORDRE_FICHE = ['ordre', 'phrase', 'majuscule', 'ponctuation', 'complexe', 'negation', 'negReconnaitre', 'verbe', 'nom', 'det', 'adj',
  'nature', 'gnNoyau', 'sujet', 'pronom', 'cplt', 'cpltQ', 'cpltNature', 'genre', 'nombre', 'pluriel', 'accordGN', 'accordSV']

const CE_COMPETENCES = ['phrase', 'classes-mots', 'sujet-verbe', 'accords-gn']
const niveau = (n, competences) => ({
  competences,
  options: { types: typesDuNiveau(n) },
  reglages: { types: ['verbe'] },
})

// Fiches par compétence : les types de la compétence qui existent au niveau (mêmes fiches que src/impression/exercices.js)
const FICHES = [
  { id: 'phrase', competence: 'phrase', types: ['ordre', 'phrase', 'majuscule', 'ponctuation', 'negation', 'negReconnaitre', 'complexe'], niveaux: TOUS },
  { id: 'nature', competence: 'classes-mots', types: ['nom', 'det', 'adj', 'nature', 'gnNoyau'], niveaux: TOUS },
  { id: 'sujet-verbe', competence: 'sujet-verbe', types: ['verbe', 'sujet', 'pronom', 'accordSV'], niveaux: TOUS },
  { id: 'accords', competence: 'accords-gn', types: ['genre', 'nombre', 'pluriel', 'accordGN'], niveaux: TOUS },
  { id: 'complements', competence: 'complements', types: ['cplt', 'cpltQ', 'cpltNature'], niveaux: CM },
]

/** @type {import('../ancien.js').DefinitionExercice} */
export default {
  id: 'grammaire',
  route: '/francais/grammaire',
  domaine: 'grammaire',
  contenu: 'fr',
  niveauDefaut: 'ce1',
  reglages: { nb: 10 },
  options: { nb: [5, 10, 15] },
  niveaux: {
    ce1: niveau('ce1', CE_COMPETENCES),
    ce2: niveau('ce2', CE_COMPETENCES),
    cm1: niveau('cm1', [...CE_COMPETENCES, 'complements']),
    cm2: niveau('cm2', [...CE_COMPETENCES, 'complements']),
  },
  fiches: FICHES.flatMap(f => f.niveaux.map(n => ({
    id: f.id, competence: f.competence, niveau: n, reglages: { types: typesDuNiveau(n).filter(t => f.types.includes(t)) },
  }))),
}
