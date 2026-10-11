// Le dessin de la météo : la question en haut, puis une ligne par temps, son image et son nom dans chaque langue de la feuille (dessin
// commun : listeMots.ts ; police unique, en script).
import type { Rendu } from '../types.ts'
import { CSS_LISTE, dessinerListe } from '../listeMots.ts'
import type { Reglages } from './definition.ts'
import type { NomEmoji } from '../../images/tables.ts'

const TEMPS: readonly { id: string, emoji: NomEmoji }[] = [
  { id: 'soleil', emoji: 'soleil' }, { id: 'pluie', emoji: 'pluie' }, { id: 'vent', emoji: 'vent' }, { id: 'neige', emoji: 'flocon' }, { id: 'nuages', emoji: 'nuage' },
]

export const dessin: Rendu<Reglages>['dessin'] = (r, zone, _T, ctx) => {
  const elements = TEMPS.map(t => ({ emoji: t.emoji, mot: (l: string) => ctx.Tde(l)(`temps.${t.id}`) }))
  return [dessinerListe(elements, zone, ctx, { langues: r.langues, attache: false, entete: l => ctx.Tde(l)('question') })]
}

export const css = CSS_LISTE
