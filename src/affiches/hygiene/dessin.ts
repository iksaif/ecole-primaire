// Le dessin de l’hygiène : des cartes (image, mot dans chaque langue de la feuille), dessin commun de la maternelle : src/affiches/cartes.ts.
// Le lavage des mains montre les mains à chaque étape, avec ce qui agit dessus (l'eau, le savon, la mousse, le rinçage, le papier) : on voit
// le geste, pas seulement l'objet.
import type { ContexteDessin, Rendu } from '../types.ts'
import { CSS_CARTES, dessinerCartes, titreDeLaPage } from '../cartes.ts'
import type { Carte, Enchainement } from '../cartes.ts'
import type { NomEmoji } from '../../images/tables.ts'
import type { Reglages } from './definition.ts'

/**
 * Une carte de la feuille : son identifiant (les textes `mot.<id>`) et son image. `surLesMains` : l'image est posée sur les mains ouvertes,
 * au-dessus (`'dessus'` : l'eau qui coule, le savon qu'on prend…) ou devant (`'devant'` : la mousse qu'on frotte).
 */
interface Element { id: string, emoji: NomEmoji, surLesMains?: 'dessus' | 'devant' }

const CARTES: Readonly<Record<string, { enchainement: Enchainement, numeroter?: boolean, elements: readonly Element[] }>> = {
  mains: { enchainement: 'suite', numeroter: true, elements: [
    { id: 'mouiller', emoji: 'goutte', surLesMains: 'dessus' },
    { id: 'savonner', emoji: 'savon', surLesMains: 'dessus' },
    { id: 'frotter', emoji: 'bulles', surLesMains: 'devant' },
    { id: 'rincer', emoji: 'eclaboussures', surLesMains: 'dessus' },
    { id: 'essuyer', emoji: 'papier', surLesMains: 'dessus' },
  ] },
  gestes: { enchainement: 'grille', elements: [
    { id: 'dents', emoji: 'brosseADents' },
    { id: 'dormir', emoji: 'lit' },
    { id: 'bouger', emoji: 'coureur' },
    { id: 'manger', emoji: 'salade' },
    { id: 'moucher', emoji: 'eternuement' },
  ] },
}

/** Les mains ouvertes (en bas) et l'objet qui agit dessus (au-dessus, ou devant elles), dans un carré de `cote` mm. */
function surLesMains(e: Element, cote: number, images: ContexteDessin['images']): string {
  // les mains restent petites, en bas ; l'objet est grand : c'est lui qui dit l'étape
  const objet = e.surLesMains === 'devant' ? images.svg(e.emoji, 14, 22, 44) : images.svg(e.emoji, 13, 0, 46)
  return `<svg width="${cote}mm" height="${cote}mm" viewBox="0 0 72 72" aria-hidden="true">${images.svg('mainsOuvertes', 18, 36, 36)}${objet}</svg>`
}

export const dessin: Rendu<Reglages>['dessin'] = (r, zone, _T, ctx) => {
  const lot = CARTES[r.variante]
  const cartes: Carte[] = lot.elements.map((e, i) => ({
    emoji: e.emoji,
    dessin: e.surLesMains ? cote => surLesMains(e, cote, ctx.images) : undefined,
    mot: langue => ctx.Tde(langue)(`mot.${e.id}`),
    numero: lot.numeroter ? i + 1 : undefined,
  }))
  return [{ corps: dessinerCartes(cartes, zone, ctx, { langues: r.langues, enchainement: lot.enchainement }), titre: titreDeLaPage(r, ctx) }]
}

export const css = CSS_CARTES
