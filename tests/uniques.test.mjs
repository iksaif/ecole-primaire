// Jamais deux fois la même question (src/noyau/uniques.ts) : le helper de tirage, puis le balayage de tous les exercices du noyau
// (jeu et fiche, chaque niveau et chaque jeu de réglages) dans tests/exercices.test.mjs.
//   node tests/uniques.test.mjs
import { tirerUniques, doublons } from '../src/noyau/uniques.ts'
import { creerRng } from '../src/utils/hasard.ts'
import { verifier, nbEchecs } from './outils.mjs'

console.log('tirerUniques')
const rng = creerRng(7)
const des = tirerUniques(10, () => ({ a: rng.entier(1, 20) }))
verifier(des.length === 10 && !doublons(des).length, 'dix questions toutes différentes parmi vingt possibles')
const peu = tirerUniques(10, () => ({ a: rng.entier(1, 3) }))
verifier(peu.length === 3 && !doublons(peu).length, 'trois possibles, dix demandées : trois questions, jamais de doublon')
const rangs = []
tirerUniques(3, i => { rangs.push(i); return { n: i } })
verifier(rangs.join() === '0,1,2', 'tirer(i) reçoit le rang de la question à tirer')
const depuis = graine => { const r = creerRng(graine); return tirerUniques(8, () => ({ a: r.entier(1, 12) })) }
verifier(JSON.stringify(depuis(3)) === JSON.stringify(depuis(3)), 'même graine, mêmes questions')
const ordre = tirerUniques(4, () => ({ q: 'x', propositions: [rng.entier(1, 2), rng.entier(3, 4)] }), { cle: q => q.q })
verifier(ordre.length === 1, 'une clé précisée ignore les détails sans importance')
verifier(doublons([{ a: 1 }, { a: 2 }, { a: 1 }]).length === 1 && !doublons([]).length, 'doublons() trouve les répétitions')

process.exit(nbEchecs() ? 1 : 0)
