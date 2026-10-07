// Écriture — les données de l'exercice : les quatre écritures, les lettres proposées, les familles de lettres de la progression en
// cursive, les listes de mots françaises, les tailles de lignage. Les listes des langues régionales sont dans
// src/langues/<langue>/donnees.ts.

/** Les quatre écritures, dans l'ordre où la fiche les donne. */
export const TOUS_STYLES = ['script-maj', 'script-min', 'attache-maj', 'attache-min'] as const
export type Style = (typeof TOUS_STYLES)[number]
/** l'écriture attachée (cursive) ou script : la police de son type */
export const estAttache = (style: Style): boolean => style.startsWith('attache')
export const estMajuscule = (style: Style): boolean => style.endsWith('maj')

/**
 * Les polices livrées avec le site (OFL), celles des PDF publiés : la fiche les prend quand on ne lui en donne pas. Les mêmes noms que
 * POLICE_SCRIPT et POLICE_ATTACHE de src/utils/impression.js, que node ne peut pas lire (il importe les fichiers de police).
 */
export const POLICES_LIVREES = { script: 'Andika', attache: 'Playwrite FR Trad' } as const

export const CONTENUS = ['lettres', 'mots', 'texte'] as const
export type Contenu = (typeof CONTENUS)[number]

export const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('')
export const ACCENTS = ['é', 'è', 'ê', 'ë', 'à', 'â', 'î', 'ï', 'ô', 'ù', 'û', 'ç', 'œ']
export const CHIFFRES = '0123456789'.split('')
/** lettres propres aux langues régionales (ch, c'h, ñ en breton) : proposées seulement quand la langue est choisie */
export const LETTRES_REGIONALES = ['ch', "c'h", 'ñ']
/** toutes les lettres proposées, dans l'ordre de la grille (la fiche garde l'ordre choisi) */
export const TOUTES_LETTRES = [...ALPHABET, ...ACCENTS, ...LETTRES_REGIONALES, ...CHIFFRES]

/** tailles du lignage Seyès : l'interligne en mm (un carreau = 4 interlignes) */
export const INTERLIGNES = [2, 2.5, 3, 4] as const
export const NB_LIGNES = [0, 1, 2, 3] as const

/** Familles de lettres de la progression en écriture cursive (texte : `famille.<id>`). */
export const FAMILLES: readonly { id: string, lettres: readonly string[] }[] = [
  { id: 'alphabet', lettres: ALPHABET },
  { id: 'voyelles', lettres: ['a', 'e', 'i', 'o', 'u', 'y'] },
  { id: 'rondes', lettres: ['c', 'o', 'a', 'd', 'g', 'q'] },
  { id: 'boucles', lettres: ['e', 'l', 'b', 'h', 'k', 'f'] },
  { id: 'coupes', lettres: ['i', 'u', 't'] },
  { id: 'ponts', lettres: ['m', 'n', 'v', 'w', 'x', 'y'] },
  { id: 'jambages', lettres: ['j', 'p', 'g', 'q', 'y', 'f', 'z'] },
  { id: 'particulieres', lettres: ['r', 's', 'z', 'x'] },
  { id: 'accents', lettres: ACCENTS },
  { id: 'chiffres', lettres: CHIFFRES },
]

/** Listes de mots françaises toutes prêtes (texte : `liste.<id>`) ; titre imprimé : `titreListe.<id>`. */
export const LISTES_MOTS: readonly { id: string, mots: readonly string[] }[] = [
  { id: 'jours', mots: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'] },
  { id: 'mois', mots: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'] },
  { id: 'nombres', mots: ['un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix'] },
  { id: 'couleurs', mots: ['rouge', 'bleu', 'jaune', 'vert', 'orange', 'violet', 'rose', 'marron', 'noir', 'blanc', 'gris'] },
  { id: 'famille', mots: ['papa', 'maman', 'frère', 'sœur', 'papi', 'mamie', 'bébé'] },
]

/** Les réglages d'une fiche d'écriture (ceux que déclare definition.ts). */
export interface ReglagesEcriture {
  styles: Style[]
  contenu: Contenu
  lettres: string[]
  /** en attaché minuscule, une lettre écrite trois fois liée (aaa) */
  lier: boolean
  /** un mot par ligne */
  mots: string
  /** un paragraphe par ligne */
  texte: string
  /** titre imprimé ; vide : « Écriture — » et les écritures choisies */
  titre: string
  interligne: (typeof INTERLIGNES)[number]
  /** une ligne d'écriture sur deux */
  sauter: boolean
  /** lignes grises à repasser, puis lignes à copier seul */
  repasser: (typeof NB_LIGNES)[number]
  copie: (typeof NB_LIGNES)[number]
  /** lignage en couleur, ou gris (imprimante noir et blanc) */
  couleur: boolean
}
