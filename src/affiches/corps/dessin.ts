// Le dessin du corps : des cartes (image, mot dans chaque langue de la feuille), dessin commun de la maternelle : src/affiches/cartes.ts.
import type { Rendu } from '../types.ts'
import { CSS_CARTES, dessinerCartes, titreDeLaPage } from '../cartes.ts'
import type { Carte, Enchainement } from '../cartes.ts'
import type { NomEmoji } from '../../images/tables.ts'
import type { Reglages } from './definition.ts'

/** Une carte de la feuille : son identifiant (les textes `mot.<id>`, `precision.<id>`) et son image. */
interface Element { id: string, emoji: NomEmoji }

const CARTES: Readonly<Record<string, { enchainement: Enchainement, numeroter?: boolean, elements: readonly Element[] }>> = {
  parties: { enchainement: 'grille', elements: [
    { id: 'tete', emoji: 'visage' },
    { id: 'yeux', emoji: 'deuxYeux' },
    { id: 'oreille', emoji: 'oreille' },
    { id: 'nez', emoji: 'nez' },
    { id: 'bouche', emoji: 'bouche' },
    { id: 'dents', emoji: 'sourire' },
    { id: 'bras', emoji: 'bras' },
    { id: 'main', emoji: 'mainOuverte' },
    { id: 'jambe', emoji: 'jambe' },
    { id: 'pied', emoji: 'pied' },
  ] },
  sens: { enchainement: 'grille', elements: [
    { id: 'vue', emoji: 'oeil' },
    { id: 'ouie', emoji: 'oreille' },
    { id: 'odorat', emoji: 'nez' },
    { id: 'gout', emoji: 'langue' },
    { id: 'toucher', emoji: 'main' },
  ] },
}

export const dessin: Rendu<Reglages>['dessin'] = (r, zone, _T, ctx) => {
  const lot = CARTES[r.variante]
  const cartes: Carte[] = lot.elements.map(e => ({
    emoji: e.emoji,
    mot: langue => ctx.Tde(langue)(`mot.${e.id}`),
    // seuls les sens ont une précision (l'organe sous le sens)
    precision: r.variante === 'sens' ? langue => ctx.Tde(langue)(`precision.${e.id}`) : undefined,
  }))
  return [{ corps: dessinerCartes(cartes, zone, ctx, { langues: r.langues, enchainement: lot.enchainement }), titre: titreDeLaPage(r, ctx) }]
}

export const css = CSS_CARTES
