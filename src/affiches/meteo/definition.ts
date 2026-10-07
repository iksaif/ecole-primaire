// La météo : « Quel temps fait-il ? » et cinq temps (soleil, pluie, vent, neige, nuages), en français, en breton, ou les deux sur la
// même feuille : le rituel du matin. Programme (src/data/programme.ts) : demander et dire le temps qu'il fait dans la langue régionale
// (meteo-langue-regionale : « Penaos eo an amzer ? — Glav a ra. », évaluation d'entrée en CP bilingue). En français, la météo n'est
// pas une compétence du programme de la GS au CE1 (seulement « s'habiller selon la météo », au CP, en technologie) : l'affiche existe
// aussi en français pour les classes bilingues.
import { definirAffiche } from '../definir.ts'
import { D, K } from '../../noyau/ids.ts'
import { CODES } from '../../langues/registre.ts'
import type { ReglagesDeAffiche } from '../types.ts'

const definition = definirAffiche({
  id: 'meteo',
  domaine: D.regionaleOral,
  emoji: '🌦️',
  langues: CODES,
  bilingue: true,
  orientations: ['portrait', 'landscape'],
  formats: ['A4', 'A3'],
  police: { mode: 'unique' },
  competences: [K.meteoLangueRegionale],
  variantes: {
    rituel: { classes: ['gs', 'cp', 'ce1'], slug: 'affiche-meteo' },
  },
})

export default definition
export type Reglages = ReglagesDeAffiche<typeof definition>
