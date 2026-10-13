// Géométrie, « justifier » (node, sans Chrome) : sur la figure dessinée, une seule des propositions est vraie (« Oui », « un de ses angles
// n'est pas droit », « ses quatre côtés n'ont pas la même longueur », « il n'a pas quatre côtés »), et c'est la réponse attendue.
import { questions } from '../src/exercices/figures/generateur.ts'
import { creerRng } from '../src/utils/hasard.ts'
import { CONTENU } from '../src/moteurs/geometrie/textes.ts'
import { traducteur } from '../src/langues/catalogue.ts'
import { verifier, nbEchecs } from './outils.mjs'

const T = traducteur(CONTENU, () => 'fr')
const raisonDe = Object.fromEntries(['oui', 'angle', 'cotes', 'nbCotes'].map(r => [T(`raison.${r}`), r]))
const longueur = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])
const droit = (a, s, b) => Math.abs((a[0] - s[0]) * (b[0] - s[0]) + (a[1] - s[1]) * (b[1] - s[1])) / (longueur(a, s) * longueur(b, s)) < 0.02

/** Ce qui est vrai de la figure dessinée. */
function verites(q) {
  const p = q.points, n = p.length
  const tousDroits = p.every((s, i) => droit(p[(i + n - 1) % n], s, p[(i + 1) % n]))
  const cotes = p.map((s, i) => longueur(s, p[(i + 1) % n]))
  const egaux = cotes.every(c => Math.abs(c - cotes[0]) < 0.5)
  const estLaFigure = n === 4 && tousDroits && (q.question === 'rectangle' || egaux)
  return { oui: estLaFigure, angle: !tousDroits, cotes: n === 4 && !egaux, nbCotes: n !== 4 }
}

for (const niveau of ['ce1', 'ce2']) {
  const qs = questions({ niveau, reglages: { niveau, nbQ: 60, exercices: ['justifier'] }, rng: creerRng(3), T, nb: 60 })
  const ok = qs.every(q => {
    const v = verites(q)
    const vraies = q.choix.filter(c => v[raisonDe[c]])
    return vraies.length === 1 && vraies[0] === q.reponse
  })
  verifier(qs.length > 3 && ok, `${niveau} : une seule proposition vraie, la réponse attendue (${qs.length} questions)`)
  verifier(niveau === 'ce1' ? !qs.some(q => q.forme === 'losange') : qs.some(q => q.forme === 'losange'), `${niveau} : le losange ${niveau === 'ce1' ? 'absent' : 'présent'}`)
}

process.exit(nbEchecs() ? 1 : 0)
