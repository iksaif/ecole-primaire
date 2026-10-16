// Le plus lourd : chaque balance est juste (le plateau du plus lourd descend), aucune paire ambiguë (plume/ballon, pomme/pierre) n'est pesée, et
// pour trois objets la réponse se déduit des deux pesées : le plus lourd est le seul qui ne perd jamais, le plus léger le seul qui ne gagne jamais.
//   node tests/lourd.test.mjs
import { OBJETS, questions } from '../src/exercices/lourd/generateur.ts'
import DEFINITION from '../src/exercices/lourd/definition.ts'
import { CONTENU } from '../src/exercices/lourd/textes.ts'
import { traducteur } from '../src/langues/catalogue.ts'
import { reglagesDuNiveau } from '../src/noyau/reglages.ts'
import { creerRng } from '../src/utils/hasard.ts'
import { verifier, nbEchecs } from './outils.mjs'

const T = traducteur(CONTENU, 'fr')
const rang = e => OBJETS.indexOf(e)
const AMBIGUES = [['plume', 'ballonDeBaudruche'], ['pomme', 'pierre']]
const ambigue = (a, b) => AMBIGUES.some(([x, y]) => (x === a && y === b) || (x === b && y === a))

const problemes = []
let nb = 0
for (const niveau of ['ms', 'gs']) {
  for (let graine = 1; graine <= 40; graine++) {
    const reglages = { ...reglagesDuNiveau(DEFINITION, { niveau }), nbQ: 15 }
    for (const q of questions({ niveau, reglages, rng: creerRng(graine), T })) {
      nb++
      const ou = `${niveau} g${graine} ${q.cle}`
      if (niveau === 'ms' && q.type !== 'deux') problemes.push(`${ou} : trois objets en MS`)
      const perdants = new Set(), gagnants = new Set()
      for (const p of q.pesees) {
        const lourd = p.tilt === 1 ? p.gauche : p.droite
        const leger = p.tilt === 1 ? p.droite : p.gauche
        if (rang(lourd) <= rang(leger)) problemes.push(`${ou} : le plateau qui descend porte le plus léger`)
        if (ambigue(lourd, leger)) problemes.push(`${ou} : paire ambiguë ${lourd}/${leger}`)
        gagnants.add(lourd); perdants.add(leger)
      }
      const attendu = q.options[q.bonne]
      const candidats = q.options.filter(o => (q.mot === 'lourd' ? !perdants.has(o) : !gagnants.has(o)))
      if (candidats.length !== 1 || candidats[0] !== attendu) problemes.push(`${ou} : la réponse ne se déduit pas des pesées (${candidats.join(',')} / ${attendu})`)
    }
  }
}
verifier(problemes.length === 0, `${nb} questions : balances justes, réponse déductible (${problemes.slice(0, 3).join(' ; ') || 'ok'})`)
process.exit(nbEchecs() ? 1 : 0)
