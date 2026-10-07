// Le dessin des jours de la semaine : une ligne par jour, dans chaque langue de la feuille (dessin commun : listeMots.ts).
import type { Rendu } from '../types.ts'
import { CSS_LISTE, dessinerListe } from '../listeMots.ts'
import type { Reglages } from './definition.ts'

const JOURS = [0, 1, 2, 3, 4, 5, 6]

export const dessin: Rendu<Reglages>['dessin'] = (r, zone, _T, ctx) => {
  const elements = JOURS.map(i => ({ mot: (l: string) => ctx.Tde(l)(`jour.${i}`) }))
  return [dessinerListe(elements, zone, ctx, { langues: r.langues, attache: r.attache })]
}

export const css = CSS_LISTE
