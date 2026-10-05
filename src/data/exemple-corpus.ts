// Corpus de l'exemple « exemple-corpus » : des mots et leur synonyme, par thème et par classe. Données pures (lisibles par
// node), en français seulement et jamais traduites : le contenu d'un exercice de français est toujours en français.
// Un corpus qui sert à plusieurs exercices ou à une affiche vit ici, dans src/data/ (comme conjugaison.js), pas dans l'exercice.
import type { Classe } from './classes.ts'

export type Theme = 'sentiments' | 'actions'

export interface Entree {
  theme: Theme
  /** première classe où le mot est proposé (il l'est aussi dans les suivantes) */
  niveau: Classe
  mot: string
  synonyme: string
}

const e = (theme: Theme, niveau: Classe, mot: string, synonyme: string): Entree => ({ theme, niveau, mot, synonyme })

export const CORPUS: readonly Entree[] = [
  e('sentiments', 'ce1', 'joyeux', 'gai'), e('sentiments', 'ce1', 'content', 'heureux'),
  e('sentiments', 'ce1', 'triste', 'malheureux'), e('sentiments', 'ce1', 'fâché', 'en colère'),
  e('sentiments', 'ce2', 'effrayé', 'apeuré'), e('sentiments', 'ce2', 'étonné', 'surpris'),
  e('sentiments', 'ce2', 'ravi', 'enchanté'), e('sentiments', 'ce2', 'épuisé', 'exténué'),
  e('sentiments', 'cm1', 'anxieux', 'inquiet'), e('sentiments', 'cm1', 'irrité', 'agacé'),
  e('sentiments', 'cm1', 'désolé', 'navré'), e('sentiments', 'cm1', 'stupéfait', 'ahuri'),
  e('actions', 'ce1', 'sauter', 'bondir'), e('actions', 'ce1', 'regarder', 'observer'),
  e('actions', 'ce1', 'courir', 'filer'), e('actions', 'ce1', 'ranger', 'ordonner'),
  e('actions', 'ce2', 'tomber', 'chuter'), e('actions', 'ce2', 'avancer', 'progresser'),
  e('actions', 'ce2', 'finir', 'terminer'), e('actions', 'ce2', 'cacher', 'dissimuler'),
  e('actions', 'cm1', 'se hâter', 'se dépêcher'), e('actions', 'cm1', 'réclamer', 'exiger'),
  e('actions', 'cm1', 'errer', 'vagabonder'), e('actions', 'cm1', 'discuter', 'converser'),
]
