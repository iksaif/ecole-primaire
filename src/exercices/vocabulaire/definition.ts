// Vocabulaire — définition : QUI peut faire quoi (modèle : ../exemple-corpus/definition.ts, exercice de français à corpus).
// Programme (src/data/programme.ts) : ordre alphabétique et dictionnaire, synonymes et contraires, familles de mots, préfixes et suffixes
// (compétences ordre-alphabetique, synonymes-antonymes, familles-mots) ; audit : plans/09, étape 2.
//   CE1 : mots-étiquettes (catégories), lettre avant / après, préfixes ; CE2 : mots-repères du dictionnaire, sens dans la phrase, sens
//   propre / figuré, suffixes.
//   « Mots qui se disent pareil » (homonymes) : le mot est du cycle 3 (programme du cycle 3 p. 16, exemples de réussite du CM1 p. 11),
//   le CE2 travaille la polysémie : proposé en bonus, jamais par défaut.
// Par défaut, « Contraires » seul à chaque niveau (le bilan publié exercices-vocabulaire-<niveau>).
// Contenu toujours en français (exercice de français), même avec l'interface en breton.
// Les valeurs de `types` et la clé `nb` sont aussi celles des réglages mémorisés des visiteurs : elles ne changent pas.
import { definir, cases, choix } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'
import type { Classe } from '../../data/classes.ts'

/**
 * Groupes de types d'exercice (titres : `vocabulaire.g_<id>`, libellés : `vocabulaire.type_<id>`), avec l'icône du bouton et les niveaux
 * où le type est proposé. L'ordre est celui des boutons et du tirage (l'ordre des types change la fiche).
 */
export type TypeVocabulaire = 'alpha' | 'lettre' | 'dictionnaire' | 'definitions' | 'contexte' | 'contraires' | 'synonymes' | 'homonymes'
  | 'sensFigure' | 'familles' | 'prefixes' | 'suffixes' | 'categorie' | 'intrus'
interface TypeExercice { readonly id: TypeVocabulaire, readonly icone: string, readonly niveaux: readonly Classe[] }

export const GROUPES: readonly { readonly id: string, readonly types: readonly TypeExercice[] }[] = [
  { id: 'dico', types: [
    { id: 'alpha', icone: '🔤', niveaux: ['ce1', 'ce2'] },
    { id: 'lettre', icone: '🅰️', niveaux: ['ce1'] },
    { id: 'dictionnaire', icone: '📕', niveaux: ['ce2'] },
    { id: 'definitions', icone: '📖', niveaux: ['ce1', 'ce2'] },
    { id: 'contexte', icone: '🔎', niveaux: ['ce2'] },
  ] },
  { id: 'sens', types: [
    { id: 'contraires', icone: '↔️', niveaux: ['ce1', 'ce2'] },
    { id: 'synonymes', icone: '🟰', niveaux: ['ce1', 'ce2'] },
    { id: 'homonymes', icone: '👂', niveaux: ['ce2'] },
    { id: 'sensFigure', icone: '🎭', niveaux: ['ce2'] },
  ] },
  { id: 'construction', types: [
    { id: 'familles', icone: '👨‍👩‍👧', niveaux: ['ce1', 'ce2'] },
    { id: 'prefixes', icone: '🧩', niveaux: ['ce1', 'ce2'] },
    { id: 'suffixes', icone: '🔚', niveaux: ['ce2'] },
    { id: 'categorie', icone: '🏷️', niveaux: ['ce1'] },
    { id: 'intrus', icone: '🕵️', niveaux: ['ce1'] },
  ] },
]

/** Types d'un niveau, dans l'ordre des groupes (bonus compris). */
export const typesDuNiveau = (niveau: Classe): TypeVocabulaire[] =>
  GROUPES.flatMap(g => g.types).filter(t => t.niveaux.includes(niveau)).map(t => t.id)

// Fiches par compétence : les types de la compétence qui existent au niveau
const FICHES = [
  { id: 'ordre-alphabetique', competence: K.ordreAlphabetique, types: ['alpha', 'lettre', 'dictionnaire', 'definitions', 'contexte'], niveaux: ['ce1', 'ce2'] },
  { id: 'sens', competence: K.synonymesAntonymes, types: ['contraires', 'synonymes', 'sensFigure'], niveaux: ['ce1', 'ce2'] },
  { id: 'familles', competence: K.famillesMots, types: ['familles', 'prefixes', 'suffixes'], niveaux: ['ce1', 'ce2'] },
  { id: 'categories', competence: K.famillesMots, types: ['categorie', 'intrus'], niveaux: ['ce1'] },
] as const

export default definir({
  id: 'vocabulaire',
  route: '/francais/vocabulaire',
  domaine: D.vocabulaire,
  contenu: 'fr',
  emoji: '📚',
  niveauDefaut: 'ce1',
  competences: [K.ordreAlphabetique, K.synonymesAntonymes, K.famillesMots],

  reglages: { nb: choix([5, 10, 15], { defaut: 10 }) },

  niveaux: {
    ce1: { reglages: { types: cases(typesDuNiveau('ce1'), { defaut: ['contraires'] }) } },
    ce2: { reglages: { types: cases(typesDuNiveau('ce2').filter(t => t !== 'homonymes'), { defaut: ['contraires'], bonus: ['homonymes'] }) } },
  },

  fiches: FICHES.flatMap(f => f.niveaux.map(niveau => ({
    id: f.id, competence: f.competence, niveau, reglages: { types: typesDuNiveau(niveau).filter(t => (f.types as readonly string[]).includes(t)) },
  }))),
})
