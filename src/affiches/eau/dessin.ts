// Le dessin de l’eau : des cartes (image, mot dans chaque langue de la feuille), dessin commun de la maternelle : src/affiches/cartes.ts.
import type { Rendu } from '../types.ts'
import { CSS_CARTES, dessinerCartes, titreDeLaPage } from '../cartes.ts'
import type { Carte, Enchainement } from '../cartes.ts'
import type { NomEmoji } from '../../images/tables.ts'
import type { Reglages } from './definition.ts'

/** Une carte de la feuille : son identifiant (les textes `mot.<id>`) et son image. */
interface Element { id: string, emoji: NomEmoji }

const CARTES: Readonly<Record<string, { enchainement: Enchainement, numeroter?: boolean, elements: readonly Element[] }>> = {
  etats: { enchainement: 'aller-retour', elements: [
    { id: 'glace', emoji: 'glacon' },
    { id: 'eau', emoji: 'goutte' },
  ] },
}

export const dessin: Rendu<Reglages>['dessin'] = (r, zone, _T, ctx) => {
  const lot = CARTES[r.variante]
  const cartes: Carte[] = lot.elements.map(e => ({
    emoji: e.emoji,
    mot: langue => ctx.Tde(langue)(`mot.${e.id}`),
    precision: langue => ctx.Tde(langue)(`precision.${e.id}`),
  }))
  return [{ corps: dessinerCartes(cartes, zone, ctx, { langues: r.langues, enchainement: lot.enchainement }), titre: titreDeLaPage(r, ctx) }]
}

export const css = CSS_CARTES
