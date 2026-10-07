// L'affiche de l'horloge (reportée de `main`, src/impression/affiches/horloge.js) : une grande horloge à aiguilles avec sa légende, et
// quatre petites horloges d'exemple dont l'heure est dite en lettres. Le cadran est celui de l'exercice « Lire l'heure »
// (src/exercices/heure/horloge.ts) : un seul dessin d'horloge.
// Programme (src/data/programme.ts) : CP, heures entières ; CE1, demies et quarts, heures de l'après-midi ; CE2, minutes.
// Les slugs publiés sont ceux de `main` (`affiche-horloge-heures-entieres`…) ; le breton ajoute `-br`.
import { definirAffiche } from '../definir.ts'
import { D, K } from '../../noyau/ids.ts'
import { CODES } from '../../langues/registre.ts'
import type { ReglagesDeAffiche } from '../types.ts'

const definition = definirAffiche({
  id: 'horloge',
  domaine: D.grandeursMesures,
  emoji: '🕐',   // celui de l'ancienne entrée « L'horloge » (src/data/activites.js)
  orientations: ['landscape'],
  langues: CODES,
  competences: [K.heureEntiere, K.heureDemiQuart, K.heureMinutes],
  variantes: {
    heures: { classes: ['cp'], slug: 'affiche-horloge-heures-entieres', sauf: [K.heureDemiQuart, K.heureMinutes] },
    quarts: { classes: ['ce1'], slug: 'affiche-horloge-quarts-demies', sauf: [K.heureEntiere, K.heureMinutes] },
    minutes: { classes: ['ce2'], slug: 'affiche-horloge-heures-minutes', sauf: [K.heureEntiere, K.heureDemiQuart] },
  },
})

export default definition
export type Reglages = ReglagesDeAffiche<typeof definition>
