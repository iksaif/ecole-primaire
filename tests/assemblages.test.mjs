// Assemblages de formes : chaque modèle est réalisable avec les pièces (aucune pièce n'en recouvre une autre, toutes se touchent par un
// côté), a le bon nombre de pièces pour sa classe, et la fiche contient autant de pièces à découper que le plus grand modèle en demande.
//   node tests/assemblages.test.mjs
import { MODELES, jeuDePieces, sommets } from '../src/exercices/assemblages/formes.ts'
import { PIECES_MAX, questionsFiche } from '../src/exercices/assemblages/generateur.ts'
import { fiche } from '../src/exercices/assemblages/fiche.ts'
import DEFINITION from '../src/exercices/assemblages/definition.ts'
import { CONTENU } from '../src/exercices/assemblages/textes.ts'
import { traducteur } from '../src/langues/catalogue.ts'
import { reglagesDuNiveau } from '../src/noyau/reglages.ts'
import { creerRng } from '../src/utils/hasard.ts'
import { verifier, nbEchecs } from './outils.mjs'

const T = traducteur(CONTENU, 'fr')
const PAS = 0.05

/** Le point est-il à l'intérieur du polygone (lancer de rayon) ? */
function dedans(px, py, poly) {
  let in_ = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) in_ = !in_
  }
  return in_
}

/** Pour chaque point de l'échantillon (au centre des petits carrés) : la pièce qui le couvre. Plusieurs pièces = recouvrement. */
function couverture(pieces) {
  const polys = pieces.map(sommets)
  const xs = polys.flat().map(s => s[0])
  const ys = polys.flat().map(s => s[1])
  const carte = new Map()
  let recouvrements = 0
  for (let x = Math.min(...xs) + PAS / 2; x < Math.max(...xs); x += PAS) {
    for (let y = Math.min(...ys) + PAS / 2; y < Math.max(...ys); y += PAS) {
      const couvrantes = polys.map((p, i) => (dedans(x, y, p) ? i : -1)).filter(i => i >= 0)
      if (couvrantes.length > 1) recouvrements++
      if (couvrantes.length) carte.set(`${Math.round(x / PAS)},${Math.round(y / PAS)}`, couvrantes[0])
    }
  }
  return { carte, recouvrements }
}

/** Toutes les pièces se touchent-elles par un côté (des échantillons voisins de deux pièces différentes) ? */
function connexe(pieces) {
  const { carte } = couverture(pieces)
  const voisines = pieces.map(() => new Set())
  for (const [cle, i] of carte) {
    const [a, b] = cle.split(',').map(Number)
    for (const [da, db] of [[1, 0], [0, 1]]) {
      const j = carte.get(`${a + da},${b + db}`)
      if (j !== undefined && j !== i) { voisines[i].add(j); voisines[j].add(i) }
    }
  }
  const vues = new Set([0])
  const pile = [0]
  while (pile.length) for (const v of voisines[pile.pop()]) if (!vues.has(v)) { vues.add(v); pile.push(v) }
  return vues.size === pieces.length
}

for (const [classe, modeles] of Object.entries(MODELES)) {
  console.log(`\n${classe.toUpperCase()}`)
  const ids = modeles.map(m => m.id)
  verifier(new Set(ids).size === ids.length, `${classe} : identifiants uniques`)
  for (const m of modeles) {
    verifier(couverture(m.pieces).recouvrements === 0, `${classe} ${m.id} : aucune pièce n'en recouvre une autre`)
    verifier(connexe(m.pieces), `${classe} ${m.id} : toutes les pièces se touchent par un côté`)
    verifier(m.pieces.length >= 2 && m.pieces.length <= PIECES_MAX[classe], `${classe} ${m.id} : ${m.pieces.length} pièces (2 à ${PIECES_MAX[classe]})`)
  }
  // la fiche : le jeu de pièces couvre le plus grand modèle, le corrigé est là, même graine = même fiche
  const reglages = reglagesDuNiveau(DEFINITION, { niveau: classe })
  const tirage = questionsFiche({ niveau: classe, reglages, rng: creerRng(3) })
  const html = fiche({ questions: tirage, reglages, T, langue: 'fr', police: 'Arial', cssPolices: '' })
  const jeu = jeuDePieces(tirage.modeles)
  const decoupees = (html.split('<h2 class="partie">')[1] ?? '').split('<h2 class="partie">')[0]
  verifier((decoupees.match(/<svg/g) ?? []).length === jeu.carre + jeu.rectangle + jeu.triangle, `${classe} : la page des formes a toutes les pièces du jeu`)
  verifier(html.includes('section class="corrige"'), `${classe} : le corrigé est présent`)
  verifier(tirage.modeles.length === Math.min(reglages.nbFiche, modeles.length), `${classe} : ${tirage.modeles.length} modèle(s) sur la fiche`)
  const memes = questionsFiche({ niveau: classe, reglages, rng: creerRng(3) }).modeles.map(m => m.id).join() === tirage.modeles.map(m => m.id).join()
  verifier(memes, `${classe} : même graine, mêmes modèles`)
}

process.exit(nbEchecs() ? 1 : 0)
