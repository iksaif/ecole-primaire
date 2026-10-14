// « Nombres jusqu'à » libre (numération) : pour des bornes quelconques (pas seulement 100, 1 000, 10 000), chaque type de question
// se tire sans erreur, aucun nombre ne dépasse la borne, et les plages d'avant tirent toujours les mêmes questions (instantanés).
//   node tests/numeration-plage.test.mjs
import { questions, questionsFiche } from '../src/exercices/numeration/generateur.ts'
import { borneDemandee, depasse, echelleDe, PLAGE_MIN } from '../src/exercices/numeration/generateur.ts'
import DEFINITION from '../src/exercices/numeration/definition.ts'
import { CONTENU } from '../src/exercices/numeration/textes.ts'
import { traducteur } from '../src/langues/catalogue.ts'
import { reglagesDuNiveau } from '../src/noyau/reglages.ts'
import { creerRng } from '../src/utils/hasard.ts'
import { verifier, nbEchecs } from './outils.mjs'

const T = traducteur(CONTENU, 'fr')
const BORNES = { cp: [20, 37, 50, 69, 99, 100], ce1: [20, 69, 100, 101, 250, 500, 999, 1000], ce2: [20, 100, 250, 1000, 1050, 4321, 9999, 10000] }

console.log('Échelle et borne')
verifier([20, 100, 101, 1000, 1001, 10000].map(echelleDe).join() === '100,100,1000,1000,10000,10000', 'l’échelle est la puissance de dix qui contient la borne')
verifier(borneDemandee(250, 1000) === 250 && borneDemandee(5, 1000) === 1000 && borneDemandee(10000, 100) === 100 && borneDemandee('x', 100) === 100 && borneDemandee(PLAGE_MIN, 100) === PLAGE_MIN,
  'une borne invalide ou trop grande retombe sur le plafond du niveau')

console.log('Des bornes quelconques')
const problemes = []
let nb = 0
for (const [niveau, bornes] of Object.entries(BORNES)) {
  const types = DEFINITION.niveaux[niveau].options.types
  for (const plage of bornes) for (const type of types) for (let graine = 1; graine <= 30; graine++) {
    const reglages = { ...reglagesDuNiveau(DEFINITION, { niveau }), plage, types: [type], nbQ: 6 }
    let qs
    try { qs = questions({ niveau, reglages, rng: creerRng(graine), T, nb: 6 }) } catch (e) { problemes.push(`${niveau} ≤ ${plage} ${type} : ${e.message}`); continue }
    nb++
    if (!qs.length) problemes.push(`${niveau} ≤ ${plage} ${type} graine ${graine} : aucune question`)
    for (const q of qs) if (depasse(q, plage)) problemes.push(`${niveau} ≤ ${plage} ${type} : ${q.texte || q.cle} dépasse (${q.valeurs.join(', ')})`)
  }
}
const uniques = [...new Set(problemes)]
verifier(!uniques.length, `${nb} tirages, aucun nombre au-delà de la borne${uniques.length ? ` — ${uniques.slice(0, 3).join(' ; ')} (+${uniques.length - 3})` : ''}`)

console.log('La fiche suit la borne')
const fiche = questionsFiche({ niveau: 'ce1', reglages: { ...reglagesDuNiveau(DEFINITION, { niveau: 'ce1' }), plage: 250 }, rng: creerRng(3), T })
verifier(fiche.length > 0 && fiche.every(q => !depasse(q, 250)), `une fiche au CE1 jusqu'à 250 : ${fiche.length} questions, aucune au-delà`)
process.exit(nbEchecs() ? 1 : 0)
