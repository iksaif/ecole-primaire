// Le dessin de l’hygiène : des cartes (image, mot dans chaque langue de la feuille), dessin commun de la maternelle : src/affiches/cartes.ts.
import type { Rendu } from '../types.ts'
import { CSS_CARTES, dessinerCartes, titreDeLaPage } from '../cartes.ts'
import type { Carte, Enchainement } from '../cartes.ts'
import type { NomEmoji } from '../../images/tables.ts'
import type { Reglages } from './definition.ts'

/** Une carte de la feuille : son identifiant (les textes `mot.<id>`) et son image. */
interface Element { id: string, emoji: NomEmoji }

const CARTES: Readonly<Record<string, { enchainement: Enchainement, numeroter?: boolean, elements: readonly Element[] }>> = {
  mains: { enchainement: 'suite', numeroter: true, elements: [
    { id: 'mouiller', emoji: 'goutte' },
    { id: 'savonner', emoji: 'savon' },
    { id: 'frotter', emoji: 'bulles' },
    { id: 'rincer', emoji: 'eclaboussures' },
    { id: 'essuyer', emoji: 'papier' },
  ] },
  gestes: { enchainement: 'grille', elements: [
    { id: 'dents', emoji: 'brosseADents' },
    { id: 'dormir', emoji: 'lit' },
    { id: 'bouger', emoji: 'coureur' },
    { id: 'manger', emoji: 'salade' },
    { id: 'moucher', emoji: 'eternuement' },
  ] },
}

export const dessin: Rendu<Reglages>['dessin'] = (r, zone, _T, ctx) => {
  const lot = CARTES[r.variante]
  const cartes: Carte[] = lot.elements.map((e, i) => ({
    emoji: e.emoji,
    mot: langue => ctx.Tde(langue)(`mot.${e.id}`),
    numero: lot.numeroter ? i + 1 : undefined,
  }))
  return [{ corps: dessinerCartes(cartes, zone, ctx, { langues: r.langues, enchainement: lot.enchainement }), titre: titreDeLaPage(r, ctx) }]
}

export const css = CSS_CARTES
