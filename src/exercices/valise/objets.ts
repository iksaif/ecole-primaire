// La valise — les noms des objets et la scène d'une question. Pur (lisible par node). Les noms (« pommes ») sont ceux de l'exercice « compter »
// (src/exercices/compter/textes.ts), pour ne pas les écrire deux fois ; la scène est la même sur l'écran et sur la fiche.
import { traducteur } from '../../langues/catalogue.ts'
import type { Langue } from '../../langues/registre.ts'
import { CONTENU as COMPTER } from '../compter/textes.ts'
import { htmlCollection, htmlConstellation } from '../../dessins/collections.ts'
import type { ObjetCollection } from '../../dessins/collections.ts'
import type { RenduImages } from '../../images/rendu.ts'
import type { Question } from './generateur.ts'

/** Le nom, au pluriel, d'un objet dans la langue du contenu (« pommes »). */
export function nomObjet(objet: ObjetCollection, langue: string): string {
  const T = traducteur(COMPTER, langue as Langue)
  return T(`objet.${objet}` as Parameters<typeof T>[0])
}

/**
 * La scène en images. PS : tout est visible (« ajoute » : a objets, +, b objets). MS-GS : une valise dessinée ; « ajoute » : la valise porte le nombre
 * de ce qu'elle contient (des points), puis + et les objets qu'on met ; « retire » : les objets, ceux qu'on enlève portent une croix ; « complete » : la
 * valise avec ce qu'elle contient, puis le nombre qu'il en faut (des points). Les classes sont celles du CSS de l'écran et de la fiche
 * (`.objet`, `.signe`, `.enleve`, `.dans-valise`, `.points`).
 */
export function htmlScene(q: Question, images: RenduImages): string {
  const groupe = (n: number, classe: string): string => htmlCollection(n, q.emoji, images, classe)
  const signe = (s: string): string => `<span class="signe">${s}</span>`
  const points = (n: number): string => htmlConstellation(n, 'points')
  const valise = (contenu: string): string => `<span class="valise"><span class="valise-image">${images.html('valise')}</span>${contenu}</span>`
  if (q.type === 'ajoute') {
    if (!q.cache) return `${groupe(q.a, 'objet')}${signe('+')}${groupe(q.b, 'objet')}`
    return `${valise(`<span class="dans-valise">${points(q.a)}</span>`)}${signe('+')}${groupe(q.b, 'objet')}`
  }
  if (q.type === 'retire') return `${valise('')}${groupe(q.total - q.b, 'objet')}${groupe(q.b, 'objet enleve')}`
  return `${valise(`<span class="dans-valise">${groupe(q.a, 'objet')}</span>`)}${signe('→')}<span class="il-en-faut">${points(q.total)}</span>`
}
