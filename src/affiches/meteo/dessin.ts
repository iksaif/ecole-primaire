// Le dessin de la météo : la question en haut, puis une ligne par temps, son image et son nom dans chaque langue de la feuille (dessin
// commun : listeMots.ts ; police unique, en script).
import type { Rendu } from '../types.ts'
import { CSS_LISTE, dessinerListe } from '../listeMots.ts'
import type { Reglages } from './definition.ts'

const TEMPS = [{ id: 'soleil', emoji: '☀️' }, { id: 'pluie', emoji: '🌧️' }, { id: 'vent', emoji: '💨' }, { id: 'neige', emoji: '❄️' }, { id: 'nuages', emoji: '☁️' }]

export const dessin: Rendu<Reglages>['dessin'] = (r, zone, _T, ctx) => {
  const elements = TEMPS.map(t => ({ emoji: t.emoji, mot: (l: string) => ctx.Tde(l)(`temps.${t.id}`) }))
  return [dessinerListe(elements, zone, ctx, { langues: r.langues, attache: false, entete: l => ctx.Tde(l)('question') })]
}

export const css = CSS_LISTE
