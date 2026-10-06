// L'affiche de la droite numérique (reportée de `main`, src/impression/affiches/droite.js) : une droite graduée de 0 à 20, 100 ou 1 000,
// avec le nom de chaque nombre en lettres (français, breton : une page par langue de la feuille). CP : jusqu'à 100 ; CE1 : jusqu'à 1 000.
// Les adresses publiées sont celles de `main` (`affiche-droite-numerique-de-0-a-20`…).
import { definirAffiche } from '../definir.ts'
import { D, K } from '../../noyau/ids.ts'
import { CODES } from '../../langues/registre.ts'
import type { ReglagesDeAffiche } from '../types.ts'

const definition = definirAffiche({
  id: 'droite',
  domaine: D.nombresCalcul,
  emoji: '📏',
  orientations: ['landscape', 'portrait'],
  langues: CODES,
  bilingue: true,
  competences: [K.droiteGraduee, K.nombresEnLettres],
  // `max` : le dernier nombre (valeur de la variante que lit le dessin)
  variantes: {
    'de-0-a-20': { classes: ['cp'], slug: 'affiche-droite-numerique-de-0-a-20', reglages: { max: 20 } },
    'de-0-a-100': { classes: ['cp'], slug: 'affiche-droite-numerique-de-0-a-100', reglages: { max: 100 } },
    'de-0-a-1000': { classes: ['ce1'], slug: 'affiche-droite-numerique-de-0-a-1000', reglages: { max: 1000 } },
  },
})

export default definition
export type Reglages = ReglagesDeAffiche<typeof definition>
