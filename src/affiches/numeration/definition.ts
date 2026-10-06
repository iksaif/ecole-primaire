// L'affiche du tableau de numération (reportée de `main`, src/impression/affiches/numeration.js) : les rangs (unités, dizaines,
// centaines…) groupés en classes, avec la valeur de chaque rang, deux exemples lus à voix haute (en lettres) et, au cours moyen, la partie
// décimale. Une page par langue de la feuille (français, breton, ou les deux).
// Programme (src/data/programme.ts) : CE1 jusqu'à 1 000 ; CM1 six chiffres et centièmes ; CM2 neuf chiffres et millièmes.
// Les adresses publiées sont celles de `main` (`affiche-tableau-numeration-jusqu-a-1000`, `-cm1`, `-cm2`).
import { definirAffiche } from '../definir.ts'
import { D, K } from '../../noyau/ids.ts'
import { CODES } from '../../langues/registre.ts'
import type { ReglagesDeAffiche } from '../types.ts'

const definition = definirAffiche({
  id: 'numeration',
  domaine: D.nombresCalcul,
  emoji: '🔟',
  orientations: ['landscape', 'portrait'],
  langues: CODES,
  bilingue: true,
  competences: [K.numeration1000, K.numeration6Chiffres, K.numeration9Chiffres, K.decimaux],
  // `nbClasses` : nombre de classes de trois rangs (0 : seulement mille) ; `decimales` : colonnes après la virgule ; `exemples` : à lire
  variantes: {
    ce1: { classes: ['ce1'], slug: 'affiche-tableau-numeration-jusqu-a-1000', reglages: { nbClasses: 0, decimales: 0 } },
    cm1: { classes: ['cm1'], slug: 'affiche-tableau-numeration-cm1', reglages: { nbClasses: 2, decimales: 2 } },
    cm2: { classes: ['cm2'], slug: 'affiche-tableau-numeration-cm2', reglages: { nbClasses: 3, decimales: 3 } },
  },
})

export default definition
export type Reglages = ReglagesDeAffiche<typeof definition>
