// Grammaire — définition : QUI peut faire quoi (modèle : ../exemple-corpus/definition.ts, exercice de français à corpus).
// Programme (src/data/programme.ts) : au cycle 2, les compléments ne sont pas distingués entre eux (« l'étude des compléments
// circonstanciels est réservée au cycle 3 », BO n° 41 p. 91) ; CM1 : nom noyau, complément d'objet / circonstanciel ; CM2 : CC de temps
// et de lieu, phrase simple / complexe (programme de français du cycle 3, p. 17-19). Audit : plans/09, étape 2.
// CE1 : pluriel en -s seulement, accord de l'adjectif en -e et -s ; le -x et les accords irréguliers arrivent au CE2.
// Chaque type d'exercice porte les niveaux où il est proposé ; tout ce qu'un niveau propose est au programme.
// Par défaut, « Trouver le verbe » seul à chaque niveau : c'est le bilan publié (exercices-grammaire-<niveau>).
// Contenu toujours en français (exercice de français), même avec l'interface en breton.
// Les valeurs de `types` et la clé `nb` sont aussi celles des réglages mémorisés des visiteurs : elles ne changent pas.
import { definir, cases, choix, NB_LIBRE } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'
import type { Classe } from '../../data/classes.ts'

export type TypeGrammaire = 'ordre' | 'phrase' | 'majuscule' | 'ponctuation' | 'typePhrase' | 'negation' | 'negReconnaitre' | 'complexe'
  | 'verbe' | 'nom' | 'det' | 'adj' | 'nature' | 'gnNoyau'
  | 'sujet' | 'pronom' | 'pronomPersonne' | 'cplt' | 'cpltQ' | 'cpltNature'
  | 'genre' | 'nombre' | 'pluriel' | 'accordGN' | 'accordSV'
interface TypeExercice { readonly id: TypeGrammaire, readonly icone: string, readonly niveaux: readonly Classe[] }

const CE: readonly Classe[] = ['ce1', 'ce2']
const CM: readonly Classe[] = ['cm1', 'cm2']
const TOUS: readonly Classe[] = [...CE, ...CM]

/**
 * Groupes de types d'exercice (titres : `grammaire.groupe_<id>`, libellés : `grammaire.type_<id>`), avec l'icône du bouton et les niveaux
 * où le type est proposé. L'ordre est celui des boutons et du tirage (l'ordre des types change la fiche).
 */
export const GROUPES: readonly { readonly id: string, readonly types: readonly TypeExercice[] }[] = [
  { id: 'phrase', types: [
    { id: 'ordre', icone: '🧩', niveaux: ['ce1'] },
    { id: 'phrase', icone: '🤔', niveaux: ['ce1'] },
    { id: 'majuscule', icone: '🔠', niveaux: ['ce1'] },
    { id: 'ponctuation', icone: '❓', niveaux: ['ce1'] },
    // CE1 : nommer le type de phrase (déclarative, interrogative, impérative), BO n° 41 p. 93
    { id: 'typePhrase', icone: '🗣️', niveaux: ['ce1'] },
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
    // CE1 : tous les pronoms personnels sujets (je, tu, il, elle, nous, vous, ils, elles), BO n° 41 p. 93
    { id: 'pronomPersonne', icone: '👥', niveaux: ['ce1'] },
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
export const typesDuNiveau = (niveau: Classe): TypeGrammaire[] => GROUPES.flatMap(g => g.types).filter(t => t.niveaux.includes(niveau)).map(t => t.id)

/** Ordre des sections d'une fiche (l'ancien ordre, où « complexe » suit « ponctuation »). */
export const ORDRE_FICHE: readonly TypeGrammaire[] = ['ordre', 'phrase', 'majuscule', 'ponctuation', 'typePhrase', 'complexe', 'negation', 'negReconnaitre', 'verbe', 'nom',
  'det', 'adj', 'nature', 'gnNoyau', 'sujet', 'pronom', 'pronomPersonne', 'cplt', 'cpltQ', 'cpltNature', 'genre', 'nombre', 'pluriel', 'accordGN', 'accordSV']

/**
 * Les pages d'une fiche faite à la demande : une page par compétence (titre : `pageFiche_<id>`), quand les types cochés en touchent
 * plusieurs. Chaque fiche publiée est d'une seule compétence : elle reste sur une page.
 */
export const PAGES_FICHE: readonly { readonly id: string, readonly types: readonly TypeGrammaire[] }[] = [
  { id: 'phrase', types: ['ordre', 'phrase', 'majuscule', 'ponctuation', 'typePhrase', 'negation', 'negReconnaitre', 'complexe'] },
  { id: 'nature', types: ['nom', 'det', 'adj', 'nature', 'gnNoyau'] },
  { id: 'sujetVerbe', types: ['verbe', 'sujet', 'pronom', 'pronomPersonne', 'accordSV'] },
  { id: 'accords', types: ['genre', 'nombre', 'pluriel', 'accordGN'] },
  { id: 'complements', types: ['cplt', 'cpltQ', 'cpltNature'] },
]

// Fiches par compétence : les types de la compétence qui existent au niveau. Les fiches déjà publiées gardent leurs types (elles ne changent
// pas) ; les types du CE1 ajoutés depuis ont leurs propres fiches : les types de phrases, les pronoms personnels sujets.
const FICHES = [
  { id: 'types-phrases', competence: K.phrase, types: ['ponctuation', 'typePhrase'], niveaux: ['ce1'] },
  { id: 'pronoms', competence: K.classesMots, types: ['pronom', 'pronomPersonne'], niveaux: ['ce1'] },
  { id: 'phrase', competence: K.phrase, types: ['ordre', 'phrase', 'majuscule', 'ponctuation', 'negation', 'negReconnaitre', 'complexe'], niveaux: TOUS },
  { id: 'nature', competence: K.classesMots, types: ['nom', 'det', 'adj', 'nature', 'gnNoyau'], niveaux: TOUS },
  { id: 'sujet-verbe', competence: K.sujetVerbe, types: ['verbe', 'sujet', 'pronom', 'accordSV'], niveaux: TOUS },
  { id: 'accords', competence: K.accordsGn, types: ['genre', 'nombre', 'pluriel', 'accordGN'], niveaux: TOUS },
  { id: 'complements', competence: K.complements, types: ['cplt', 'cpltQ', 'cpltNature'], niveaux: CM },
] as const

const niveau = (n: Classe) => ({ reglages: { types: cases(typesDuNiveau(n), { defaut: ['verbe'] }) } })

export default definir({
  id: 'grammaire',
  route: '/francais/grammaire',
  domaine: D.grammaire,
  contenu: 'fr',
  emoji: '🧱',
  niveauDefaut: 'ce1',
  competences: [K.phrase, K.classesMots, K.sujetVerbe, K.accordsGn, K.complements],

  reglages: { nb: choix([5, 10, 15], { defaut: 10, libre: NB_LIBRE }) },

  niveaux: { ce1: niveau('ce1'), ce2: niveau('ce2'), cm1: niveau('cm1'), cm2: niveau('cm2') },

  fiches: FICHES.flatMap(f => f.niveaux.map(n => ({
    id: f.id, competence: f.competence, niveau: n, reglages: { types: typesDuNiveau(n).filter(t => (f.types as readonly string[]).includes(t)) },
  }))),
})
