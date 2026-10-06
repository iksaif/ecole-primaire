// Les collections d'objets à compter, comparer et ranger (maternelle) — LE dessin (HTML, pur : lisible par node). Partagé par les
// exercices « compter » et « comparer » (jeu et fiche : src/exercices/compter/, src/exercices/comparer/) : un objet, un emoji,
// partout le même.
//   EMOJI_OBJETS                      l'emoji de chaque objet, par identifiant (le nom de l'objet est dans le catalogue de l'exercice)
//   htmlCollection(n, emoji, classe)  n fois le même objet (un <span> par objet)
//   htmlConstellation(n, classe)      la quantité en points « ●●● » (PS : on reconnaît la quantité sans chiffre)

/** Les objets que les exercices de maternelle font compter ou comparer. */
export const EMOJI_OBJETS = {
  pomme: '🍎',
  etoile: '⭐',
  chat: '🐱',
  fleur: '🌸',
  voiture: '🚗',
  papillon: '🦋',
  grenouille: '🐸',
  fraise: '🍓',
  poisson: '🐠',
  lune: '🌙',
  biscuit: '🍪',
  ballon: '🎈',
} as const

export type ObjetCollection = keyof typeof EMOJI_OBJETS

/** `n` objets identiques : un <span> par objet, avec la classe donnée (aucune : un <span> nu). */
export function htmlCollection(n: number, emoji: string, classe = ''): string {
  return `<span${classe ? ` class="${classe}"` : ''}>${emoji}</span>`.repeat(n)
}

/** La quantité `n` en points, dans un <span> de la classe donnée. */
export const htmlConstellation = (n: number, classe = 'pts'): string => `<span class="${classe}">${'●'.repeat(n)}</span>`
