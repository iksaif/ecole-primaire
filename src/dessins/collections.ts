// Les collections d'objets à compter, comparer et ranger (maternelle) — LE dessin (HTML, pur : lisible par node). Partagé par les
// exercices « compter » et « comparer » (jeu et fiche : src/exercices/compter/, src/exercices/comparer/) : un objet, un emoji,
// partout le même, dessiné par le rendu des images (src/images/ : OpenMoji, ou l'emoji de l'appareil).
//   EMOJI_OBJETS                              l'emoji de chaque objet (nom de src/images/tables.ts), par identifiant (le nom de
//                                             l'objet est dans le catalogue de l'exercice)
//   htmlCollection(n, emoji, images, classe)  n fois le même objet (un <span> par objet), à la taille du texte
//   htmlConstellation(n, classe)      la quantité en points « ●●● » (PS : on reconnaît la quantité sans chiffre)

import type { NomEmoji } from '../images/tables.ts'
import type { RenduImages } from '../images/rendu.ts'

/** Les objets que les exercices de maternelle font compter ou comparer. */
export const EMOJI_OBJETS = {
  pomme: 'pomme',
  etoile: 'etoile',
  chat: 'chat',
  fleur: 'fleur',
  voiture: 'voiture',
  papillon: 'papillon',
  grenouille: 'grenouille',
  fraise: 'fraise',
  poisson: 'poissonTropical',
  lune: 'lune',
  biscuit: 'gouter',
  ballon: 'ballonDeBaudruche',
} as const satisfies Readonly<Record<string, NomEmoji>>

export type ObjetCollection = keyof typeof EMOJI_OBJETS

/**
 * `n` objets identiques : un <span> par objet, avec la classe donnée (aucune : un <span> nu), l'emoji à la taille du texte. `images` : le
 * rendu reçu (imagesDe(params) sur une fiche, useRenduEcran() à l'écran).
 */
export function htmlCollection(n: number, emoji: NomEmoji, images: RenduImages, classe = ''): string {
  return `<span${classe ? ` class="${classe}"` : ''}>${images.html(emoji)}</span>`.repeat(n)
}

/** La quantité `n` en points, dans un <span> de la classe donnée. */
export const htmlConstellation = (n: number, classe = 'pts'): string => `<span class="${classe}">${'●'.repeat(n)}</span>`
