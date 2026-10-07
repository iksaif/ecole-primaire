// Le dessin des mois de l'année : une ligne par mois, dans chaque langue de la feuille, puis les quatre saisons en cases (dessin commun :
// listeMots.ts).
import type { Rendu } from '../types.ts'
import { CSS_LISTE, dessinerListe } from '../listeMots.ts'
import type { Reglages } from './definition.ts'

const MOIS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
// les saisons dans l'ordre des repères de l'académie de Rennes (« nevez-amzer, hañv, diskar-amzer, goañv »), chacune avec son image
const SAISONS = [{ id: 'printemps', emoji: '🌱' }, { id: 'ete', emoji: '☀️' }, { id: 'automne', emoji: '🍂' }, { id: 'hiver', emoji: '❄️' }]

export const dessin: Rendu<Reglages>['dessin'] = (r, zone, _T, ctx) => {
  const elements = MOIS.map(i => ({ mot: (l: string) => ctx.Tde(l)(`mois.${i}`) }))
  const bandeau = r.saisons ? SAISONS.map(s => ({ emoji: s.emoji, mot: (l: string) => ctx.Tde(l)(`saison.${s.id}`) })) : undefined
  return [dessinerListe(elements, zone, ctx, { langues: r.langues, attache: r.attache, bandeau })]
}

export const css = CSS_LISTE
