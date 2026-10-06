// La mesure de texte du navigateur : le canvas (src/utils/impression.js), exacte, mais qui n'existe pas sous node.
// Le formulaire l'injecte dans genererAffiche ; node et le build utilisent mesureEstimee (mesure.ts).
import { largeurTexte, metriquesPolice } from '../utils/impression.js'
import type { Mesure } from './types.ts'

export const mesureNavigateur: Mesure = { largeur: largeurTexte, metriques: metriquesPolice }
