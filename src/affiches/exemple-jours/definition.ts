// Deuxième exemple : les jours de la semaine. Il montre ce que l'autre exemple (bande numérique) ne montre pas :
//   - UNE langue par feuille (`bilingue` absent) : le catalogue publie une entrée par langue, comme l'alphabet ;
//   - la police PAR TYPE : les mots en script et leur tracé en attaché, chacun avec son défaut (le titre reste en Andika) ;
//   - aucun réglage à choix, aucun hasard : un formulaire réduit à la feuille.
import { definirAffiche } from '../definir.ts'
import { D, K } from '../../noyau/ids.ts'
import { CODES } from '../../langues/registre.ts'
import type { ReglagesDeAffiche } from '../types.ts'

const definition = definirAffiche({
  id: 'exemple-jours',
  domaine: D.exemple,
  route: '/dev/affiches',
  langues: CODES,
  // la police du mot (script) et celle du tracé (attaché) se choisissent séparément ; les défauts sont ceux du site
  police: { mode: 'parType', types: ['script', 'attache'], defauts: { script: 'Andika', attache: 'Playwrite FR Trad' } },
  competences: [K.exempleLire, K.exempleCompter],
  variantes: { semaine: { niveaux: ['cp'] } },
})

export default definition
export type Reglages = ReglagesDeAffiche<typeof definition>
