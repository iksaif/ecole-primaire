// Le repérage (node, sans Chrome) : les programmes tirés restent dans les limites du BO (CP : dix instructions dont deux virages ; CE1 :
// quinze dont quatre, c2maths p. 33 et 35), le robot ne sort jamais du quadrillage, et le programme du corrigé (« coder ») mène bien à l'étoile.
import { questions, executer, verifier as juste } from '../src/exercices/reperage/generateur.ts'
import { creerRng } from '../src/utils/hasard.ts'
import { verifier, nbEchecs } from './outils.mjs'

const T = cle => cle
const LIMITES = { cp: { instructions: 10, virages: 2 }, ce1: { instructions: 15, virages: 4 } }
/** Le nombre d'instructions écrites : au CE1, les « avancer » de suite comptent pour une (« avancer de n »). */
function longueur(programme, avancerDe) {
  let n = 0
  programme.forEach((i, k) => { if (!(avancerDe && i === 'avancer' && programme[k - 1] === 'avancer')) n++ })
  return n
}

for (const niveau of ['cp', 'ce1']) {
  console.log(niveau.toUpperCase())
  const qs = questions({ niveau, reglages: { niveau, nbQ: 200, exercices: ['suivre', 'coder'] }, rng: creerRng(5), T, nb: 200 })
  const { instructions, virages } = LIMITES[niveau]
  const programmes = qs.map(q => (q.type === 'suivre' ? q.programme : q.solution))
  verifier(programmes.every((p, i) => longueur(p, qs[i].avancerDe) <= instructions), `au plus ${instructions} instructions`)
  verifier(programmes.every(p => p.filter(i => i !== 'avancer').length <= virages), `au plus ${virages} virages`)
  verifier(qs.every((q, i) => !executer(q.depart, programmes[i], q.colonnes, q.lignes).sorti), 'le robot reste dans le quadrillage')
  verifier(qs.filter(q => q.type === 'coder').every(q => juste(q, { programme: q.solution })), 'le programme du corrigé mène à l\'étoile')
  verifier(qs.filter(q => q.type === 'suivre').every(q => q.arrivee.x !== q.depart.x || q.arrivee.y !== q.depart.y), 'le robot ne revient pas à son départ')
  verifier(new Set(qs.map(q => q.type)).size === 2, 'les deux types sortent')
  const coder = qs.filter(q => q.type === 'coder')
  const minimum = niveau === 'cp' ? 2 : 4
  verifier(coder.every(q => longueur(q.solution, q.avancerDe) >= minimum), `« écrire » : au moins ${minimum} instructions (pas d'étoile juste devant le robot)`)
  const surRocher = (q, c) => q.obstacles.some(o => o.x === c.x && o.y === c.y)
  verifier(coder.every(q => !surRocher(q, q.depart) && !surRocher(q, q.cible)), 'pas de rocher sur le départ ni sur l\'étoile')
  verifier(coder.every(q => !executer(q.depart, q.solution, q.colonnes, q.lignes, q.obstacles).bloque), 'le corrigé contourne les rochers')
  if (niveau === 'ce1') {
    const avecRochers = coder.filter(q => q.obstacles.length)
    const virages = p => p.filter(i => i !== 'avancer').length
    const moyenne = avecRochers.reduce((s, q) => s + virages(q.solution), 0) / (avecRochers.length || 1)
    verifier(avecRochers.length > coder.length / 2, `au CE1, des rochers dans la plupart des « écrire » (${avecRochers.length}/${coder.length})`)
    verifier(moyenne >= 2.5, `au CE1, avec des rochers, des programmes à plusieurs virages (moyenne ${moyenne.toFixed(1)})`)
  } else verifier(coder.every(q => !q.obstacles.length), 'au CP, pas de rocher')
  if (niveau === 'cp') verifier(qs.every(q => q.depart.dir === 0), 'au CP, le robot part tourné vers le haut (la flèche ↑ se lit comme sur le quadrillage)')
  else verifier(new Set(qs.map(q => q.depart.dir)).size === 4, 'au CE1, le robot part dans les quatre directions')
}

process.exit(nbEchecs() ? 1 : 0)
