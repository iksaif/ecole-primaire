// Grammaire — le moteur commun des cinq exercices (grammaire-phrase, grammaire-mots, grammaire-sujet-verbe, grammaire-accords,
// grammaire-complements : un par compétence du programme, src/exercices/<id>/). Ici : les types de questions, leur ordre, leurs niveaux ;
// le générateur (generateur.ts) et la fiche (fiche.ts) sont partagés. Ce dossier n'est pas un exercice : il n'est pas dans le registre.
// Programme (src/data/programme.ts) : au cycle 2, les compléments ne sont pas distingués entre eux (« l'étude des compléments
// circonstanciels est réservée au cycle 3 », BO n° 41 p. 91) ; CM1 : nom noyau, complément d'objet / circonstanciel ; CM2 : CC de temps
// et de lieu, phrase simple / complexe (programme de français du cycle 3, p. 17-19). Audit : plans/09, étape 2.
// CE1 : pluriel en -s seulement, accord de l'adjectif en -e et -s ; le -x et les accords irréguliers arrivent au CE2.
// Chaque type de question porte les niveaux où il est proposé ; tout ce qu'un niveau propose est au programme.
// Les valeurs des types et la clé `nb` sont aussi celles des réglages mémorisés des visiteurs : elles ne changent pas.
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
 * Tous les types de questions, rangés en groupes (libellés : `grammaire.type_<id>`), avec l'icône du bouton et les niveaux où le type est
 * proposé. L'ordre est celui des boutons et du tirage (l'ordre des types change la fiche). Les exercices les répartissent : `TYPES_DE`.
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
 * Les types de questions de chaque exercice : un exercice par compétence du programme. L'ordre des types d'un niveau est celui de
 * `typesDuNiveau` (il fixe le tirage au hasard : ne pas le changer sans regarder les instantanés).
 */
export const TYPES_DE = {
  phrase: ['ordre', 'phrase', 'majuscule', 'ponctuation', 'typePhrase', 'negation', 'negReconnaitre', 'complexe'],
  mots: ['nom', 'det', 'adj', 'nature', 'gnNoyau', 'pronom', 'pronomPersonne'],
  sujetVerbe: ['verbe', 'sujet', 'accordSV'],
  accords: ['genre', 'nombre', 'pluriel', 'accordGN'],
  complements: ['cplt', 'cpltQ', 'cpltNature'],
} as const satisfies Readonly<Record<string, readonly TypeGrammaire[]>>

/** Un des cinq exercices de grammaire. */
export type ExerciceGrammaire = keyof typeof TYPES_DE

/** Les types d'un exercice à un niveau, dans l'ordre du moteur (vide : l'exercice n'existe pas à ce niveau). */
export const typesDe = (exercice: ExerciceGrammaire, niveau: Classe): TypeGrammaire[] =>
  typesDuNiveau(niveau).filter(t => (TYPES_DE[exercice] as readonly TypeGrammaire[]).includes(t))
