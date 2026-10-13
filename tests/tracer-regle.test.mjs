// Tracer à la règle (node, sans Chrome) : la géométrie des tirages. Les points alignés le sont vraiment (et les autres non, d'un écart qui
// se voit au CP et qui demande la règle au CE1), toutes les directions sortent, rien ne sort du champ ; les figures à compléter sont des
// carrés et des rectangles ; un tracé reproduit est reconnu à une translation près, dans n'importe quel ordre de clics.
import { questions, CHAMP, verifier as juste, bonneReponse as bonne, mauvaiseReponse as mauvaise } from '../src/exercices/tracer-regle/generateur.ts'
import { memeFigure, referme } from '../src/exercices/tracer-regle/figures.ts'
import { constructionJuste } from '../src/exercices/tracer-regle/construire.ts'
import { creerRng } from '../src/utils/hasard.ts'
import { verifier, nbEchecs } from './outils.mjs'

const T = cle => cle
const tirer = (niveau, exercices, nb = 300) => questions({ niveau, reglages: { niveau, nbQ: nb, exercices }, rng: creerRng(11), T, nb })
/** La distance d'un point à la droite (AB), en millimètres. */
const distanceDroite = (p, a, b) => Math.abs((b.x - a.x) * (a.y - p.y) - (a.x - p.x) * (b.y - a.y)) / Math.hypot(b.x - a.x, b.y - a.y)

console.log('Points alignés')
for (const [niveau, ecartMin, nbDirections] of [['cp', 3, 4], ['ce1', 2.5, 10]]) {
  const qs = tirer(niveau, ['alignes'])
  const alignesOk = qs.every(q => q.candidats.every((c, i) => (i === q.bonne ? distanceDroite(c, q.a, q.b) < 0.2 : distanceDroite(c, q.a, q.b) >= ecartMin - 0.2)))
  verifier(alignesOk, `${niveau} : le bon point est sur (AB), les autres à ${ecartMin} mm au moins`)
  verifier(qs.some(q => q.bonne === 3) && qs.some(q => q.bonne < 3), `${niveau} : parfois aucun point n'est aligné`)
  const dansChamp = qs.every(q => [q.a, q.b, ...q.candidats].every(p => p.x >= CHAMP.marge && p.x <= CHAMP.largeur - CHAMP.marge && p.y >= CHAMP.marge && p.y <= CHAMP.hauteur - CHAMP.marge))
  verifier(dansChamp, `${niveau} : tous les points dans le champ`)
  const directions = new Map()
  for (const q of qs) {
    const d = Math.round(Math.atan2(q.a.y - q.b.y, q.b.x - q.a.x) * 180 / Math.PI)
    directions.set(d, (directions.get(d) ?? 0) + 1)
  }
  const moitie = qs.length / nbDirections / 2
  verifier(directions.size === nbDirections && [...directions.values()].every(n => n >= moitie), `${niveau} : ${nbDirections} directions, chacune au moins ${moitie} fois sur ${qs.length} (${JSON.stringify(Object.fromEntries(directions))})`)
}

console.log('Compléter')
const longueur2 = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2
const produit = (o, a, b) => (a.x - o.x) * (b.x - o.x) + (a.y - o.y) * (b.y - o.y)
for (const niveau of ['cp', 'ce1']) {
  const qs = tirer(niveau, ['completer'], 60)
  const formes = qs.every(q => q.solutions.every(s => {
    if (q.figure === 'triangleRectangle') {
      // l'angle droit en A (le second point connu), ses deux côtés de même longueur, dans la grille
      const [b, a, c] = [...q.connus, ...s]
      const dedans = [a, b, c].every(p => p.x >= 0 && p.y >= 0 && p.x < q.colonnes && p.y < q.lignes)
      return produit(a, b, c) === 0 && longueur2(a, b) === longueur2(a, c) && a === q.sommetAngleDroit && dedans
    }
    const [p0, p1, p2, p3] = [...q.connus, ...s]
    const angles = produit(p1, p0, p2) === 0 && produit(p2, p1, p3) === 0 && produit(p3, p2, p0) === 0
    const cotesOpposes = longueur2(p0, p1) === longueur2(p2, p3) && longueur2(p1, p2) === longueur2(p3, p0)
    const carre = q.figure !== 'carre' || longueur2(p0, p1) === longueur2(p1, p2)
    const dansGrille = [p0, p1, p2, p3].every(p => p.x >= 0 && p.y >= 0 && p.x < q.colonnes && p.y < q.lignes)
    return angles && cotesOpposes && carre && dansGrille
  }))
  verifier(formes, `${niveau} : chaque solution est la figure demandée, dans la grille`)
  const attendues = niveau === 'cp' ? 2 : 3
  verifier(new Set(qs.map(q => q.figure)).size === attendues, `${niveau} : des carrés, des rectangles${niveau === 'cp' ? '' : ' et des triangles rectangles (p. 34)'}`)
  const obliques = qs.some(q => q.connus[0].x !== q.connus[1].x && q.connus[0].y !== q.connus[1].y)
  verifier(niveau === 'cp' ? !obliques : obliques, `${niveau} : côtés obliques ${niveau === 'cp' ? 'jamais (c2maths p. 32)' : 'possibles (p. 34)'}`)
}

console.log('Reproduire')
const carre = [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 2 }, { x: 0, y: 2 }]
verifier(memeFigure(referme(carre), carre), 'le modèle refermé est reconnu')
verifier(memeFigure([{ x: 3, y: 1 }, { x: 3, y: 3 }, { x: 5, y: 3 }, { x: 5, y: 1 }, { x: 3, y: 1 }], carre), 'ailleurs sur la grille, dans l\'autre sens')
verifier(memeFigure([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 2 }, { x: 0, y: 2 }, { x: 0, y: 0 }], carre), 'un côté tracé en deux fois')
verifier(!memeFigure(carre, carre), 'une figure non refermée est refusée')
verifier(!memeFigure([...referme(carre), { x: 2, y: 2 }], carre), 'un trait en trop (la diagonale) est refusé')

console.log('Construire (CE2)')
const r = (pts) => pts.map(([x, y]) => ({ x, y }))
verifier(constructionJuste('rectangle', { a: 4, b: 2 }, r([[1, 1], [5, 1], [5, 3], [1, 3], [1, 1]])), 'un rectangle de 4 sur 2')
verifier(constructionJuste('rectangle', { a: 4, b: 2 }, r([[1, 1], [1, 5], [3, 5], [3, 1], [1, 1]])), 'le même, debout, tracé dans l\'autre sens')
verifier(constructionJuste('rectangle', { a: 4, b: 2 }, r([[1, 1], [3, 1], [5, 1], [5, 3], [1, 3], [1, 1]])), 'un côté tracé en deux fois')
verifier(!constructionJuste('rectangle', { a: 4, b: 2 }, r([[1, 1], [4, 1], [4, 3], [1, 3], [1, 1]])), 'un rectangle de 3 sur 2 est refusé')
verifier(!constructionJuste('rectangle', { a: 4, b: 2 }, r([[1, 1], [5, 1], [6, 3], [2, 3], [1, 1]])), 'un parallélogramme (sans angle droit) est refusé')
verifier(!constructionJuste('rectangle', { a: 4, b: 2 }, r([[1, 1], [5, 1], [5, 3], [1, 3]])), 'une figure non refermée est refusée')
verifier(constructionJuste('carre', { a: 3, b: 3 }, r([[0, 0], [3, 0], [3, 3], [0, 3], [0, 0]])), 'un carré de 3')
verifier(constructionJuste('triangleRectangle', { a: 4, b: 2 }, r([[0, 0], [0, 2], [4, 2], [0, 0]])), 'un triangle rectangle de 4 et 2, l\'angle droit en bas')
verifier(!constructionJuste('triangleRectangle', { a: 4, b: 2 }, r([[0, 0], [0, 4], [4, 2], [0, 0]])), 'un triangle sans angle droit est refusé')
const ce2 = tirer('ce2', ['construire'], 30)
verifier(ce2.every(q => juste(q, bonne(q)) && !juste(q, mauvaise(q))), 'CE2 : le tracé juste est accepté, le faux refusé')
verifier(ce2.every(q => q.mesures.a < q.colonnes && q.mesures.b < q.lignes), 'CE2 : la figure tient dans le quadrillage')

process.exit(nbEchecs() ? 1 : 0)
