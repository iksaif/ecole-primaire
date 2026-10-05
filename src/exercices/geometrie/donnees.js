// La géométrie — données par niveau et catalogues (figures, solides, propriétés). Pures. La liste des exercices d'un
// niveau est dans definition.js ; ici, ce que chaque exercice en fait (taille des quadrillages, figures et solides
// proposés). Ajouter « ce2: {...} » ici ET dans la définition suffit pour un nouveau niveau.
import DEFINITION from './definition.js'

export const NIVEAUX = {
  // programme du CE1 : pas de symétrie ni de losange (CE2)
  ce1: {
    reproduction: { cols: 6, rows: 6, nbCases: [5, 9] },
    reperage:     { cols: 6, rows: 6 },
    figures: ['carre', 'rectangle', 'triangle', 'triangle_rectangle', 'cercle'],
    solides: ['cube', 'pave', 'pyramide', 'cylindre', 'boule', 'cone'],
    solidesComptage: ['cube', 'pave'],   // faces / sommets demandés pour ces solides
  },
  ce2: {
    symetrie:     { cols: 12, rows: 10, nbCases: [8, 14], toucheAxe: 0.4 },
    reproduction: { cols: 8, rows: 8, nbCases: [8, 13] },
    reperage:     { cols: 8, rows: 8 },
    figures: ['carre', 'rectangle', 'triangle', 'triangle_rectangle', 'cercle', 'losange'],
    solides: ['cube', 'pave', 'pyramide', 'cylindre', 'boule', 'cone'],
    solidesComptage: ['cube', 'pave', 'pyramide'],
    anglesFormes: ['carre', 'rectangle', 'triangle_rectangle', 'triangle', 'trapeze_rectangle', 'un_angle', 'sans_angle'],
    rayons: [2, 9],   // en cm, pour « rayon ↔ diamètre »
  },
}

/** Niveau connu (sinon celui par défaut) */
export const niveauConnu = niveau => (DEFINITION.niveaux[niveau] ? niveau : DEFINITION.niveauDefaut)
/** Données du niveau, avec la liste de ses exercices (définition) */
export const donneesDe = niveau => ({ ...NIVEAUX[niveauConnu(niveau)], exercices: DEFINITION.niveaux[niveauConnu(niveau)].options.exercices })

// Propriétés des figures qui servent au programme (id de src/data/programme.js : FIGURES_C*)
export const FIGURES = {
  carre:              { cotes: 4, angleDroit: true,  programme: 'carre' },
  rectangle:          { cotes: 4, angleDroit: true,  programme: 'rectangle' },
  triangle:           { cotes: 3, angleDroit: false, programme: 'triangle' },
  triangle_rectangle: { cotes: 3, angleDroit: true,  programme: 'triangle-rectangle' },
  cercle:             { cotes: 0, angleDroit: false, programme: 'cercle' },
  losange:            { cotes: 4, angleDroit: false, programme: 'losange' },
}
// Noms à ne pas proposer comme « mauvaise » réponse car aussi justes (le carré est un losange et un rectangle…)
export const NOMS_CONCURRENTS = {
  carre: ['losange', 'rectangle'],
  triangle_rectangle: ['triangle'],
}
// Triangles quelconques (aucun angle proche de l'angle droit — vérifié par test)
export const TRIANGLES = [
  [[-70, 40], [70, 40], [-20, -60]],
  [[-85, 35], [85, 35], [-110, -40]],
  [[-60, 50], [80, 30], [0, -60]],
  [[-75, 45], [85, 45], [-15, -55]],
]
export const ROTATIONS = [0, 15, 30, 45, 60, 90, 120, 135, 160, 200, 250, 300, 330]
// Carré : pas de rotation proche de 45° (il ressemblerait à un losange « posé sur la pointe »)
export const ROTATIONS_CARRE = ROTATIONS.filter(r => r % 90 <= 20 || r % 90 >= 70)
// Quadrilatères pour « quels angles sont droits ? » (angles non droits à plus de 20° de 90° — vérifié par test)
export const FORMES_LIBRES = {
  trapeze_rectangle: [[[-70, -50], [40, -50], [80, 50], [-70, 50]], [[-60, -50], [60, -50], [60, 50], [-20, 50]]],
  un_angle: [[[-60, -60], [60, -60], [20, 20], [-60, 60]], [[-60, -60], [60, -60], [0, 60], [-60, -20]]],
  sans_angle: [[[-70, -40], [50, -40], [80, 40], [-40, 40]], [[-40, -45], [40, -45], [80, 45], [-80, 45]]],
}

// Solides : nombre de faces et de sommets (pour ceux qu'on compte), et s'ils roulent
export const SOLIDES = {
  cube:     { faces: 6, sommets: 8, roule: false },
  pave:     { faces: 6, sommets: 8, roule: false },
  pyramide: { faces: 5, sommets: 5, roule: false },
  cylindre: { roule: true },
  boule:    { roule: true },
  cone:     { roule: true },
}

// Propriétés des figures (CE2). Textes dans le catalogue de contenu (`proprietes[id]`) ; figure : index de la bonne
// réponse dans `choixFigures` (question à choix), sinon affirmation « Vrai ou faux ? » (vrai : bonne réponse)
export const PROPRIETES = [
  { id: 'q-carre', figure: 0 }, { id: 'q-rect', figure: 1 }, { id: 'q-trirect', figure: 3 }, { id: 'q-losange', figure: 2 },
  { id: 'v-carre-ad', vrai: true }, { id: 'v-carre-cotes', vrai: true }, { id: 'v-rect-cotes', vrai: false },
  { id: 'v-rect-opp', vrai: true }, { id: 'v-rect-ad', vrai: true }, { id: 'v-trirect-3', vrai: false },
  { id: 'v-trirect-1', vrai: true }, { id: 'v-carre-rect', vrai: true }, { id: 'v-losange-ad', vrai: false },
  { id: 'v-tri-cotes', vrai: false },
]
export const aChoix = p => p.figure !== undefined

/**
 * Question à choix : `choix` (libellés), `reponse` (le bon libellé), `options` et `bonne` (indice) pour <ChoixReponses>.
 * @param {object} q
 * @param {string[]} choix
 * @param {string} reponse
 */
export function avecChoix(q, choix, reponse) {
  return { ...q, choix, reponse, options: choix.map(label => ({ label })), bonne: choix.indexOf(reponse) }
}
