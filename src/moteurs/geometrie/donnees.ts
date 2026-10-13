// La géométrie (moteur commun) — données par niveau et catalogues (figures, solides, propriétés). Pures. La liste des types de questions d'un
// niveau est dans la définition de chaque exercice (src/exercices/figures/, solides/, symetrie/…) ; ici, ce que chaque type en fait (taille des
// quadrillages, figures et solides proposés).
import type { Classe } from '../../noyau/types.ts'
import type { SolideId } from '../../dessins/solides.ts'

export type FormeFigure = 'disque' | 'carre' | 'rectangle' | 'triangle' | 'triangle_rectangle' | 'cercle' | 'losange'
/** Les quadrilatères libres de « quels angles sont droits ? » (et leurs variantes sans angle droit). */
export type FormeLibre = 'trapeze_rectangle' | 'un_angle' | 'sans_angle'
export type FormeAngles = FormeFigure | FormeLibre
export type SolideGeo = Exclude<SolideId, 'prisme'>
/** Les types d'exercices (valeurs du réglage `exercices` de la définition). */
export type TypeExercice = 'symetrie' | 'aigus' | 'justifier' | 'figures' | 'solides' | 'angles' | 'proprietes' | 'cercle' | 'patrons'

interface Quadrillage { cols: number, rows: number, nbCases: readonly [number, number], toucheAxe?: number }
export interface DonneesNiveau {
  symetrie?: Quadrillage
  figures: readonly FormeFigure[]
  /** « cette figure a-t-elle un angle droit ? » (l'angle droit arrive au CE1) */
  angleDroit: boolean
  /** CP : le carré et le rectangle sont deux figures à distinguer (pas encore « un carré est un rectangle ») */
  sansInclusion?: boolean
  /** CP : des fiches guidées (chaque figure deux fois, des mots à recopier, un tableau ; des rectangles presque carrés) */
  ficheGuidee?: boolean
  /** les propriétés proposées (ids de PROPRIETES) ; toutes si absent */
  proprietes?: readonly string[]
  solides: readonly SolideGeo[]
  /** les solides dont on demande le nom (CP : « nommer un cube, un pavé et une boule », les autres sont reconnus) ; tous si absent */
  solidesNommes?: readonly SolideGeo[]
  /** faces / sommets demandés pour ces solides */
  solidesComptage: readonly SolideGeo[]
  /** ce qu'on demande d'un cube, d'un pavé (et au CE1 d'une pyramide) : la nature des faces (CP : « nombre et nature des faces », p. 32),
   *  puis leur nombre, les sommets et les arêtes (CE1) */
  comptes: readonly ('faces' | 'sommets' | 'aretes' | 'nature')[]
  anglesFormes?: readonly FormeAngles[]
  /** en cm, pour « rayon ↔ diamètre » */
  rayons?: readonly [number, number]
}

export const NIVEAUX: Readonly<Record<'cp' | 'ce1' | 'ce2', DonneesNiveau>> = {
  // programme du CP (c2maths p. 31-32) : disque, carré, rectangle, triangle ; « sommet » et « côté » ; cube, boule, cône, cylindre, pavé à
  // reconnaître, cube, pavé, boule à nommer, et les faces du cube et du pavé
  cp: {
    figures: ['disque', 'carre', 'rectangle', 'triangle'],
    angleDroit: false,
    sansInclusion: true,
    ficheGuidee: true,
    solides: ['cube', 'pave', 'boule', 'cylindre', 'cone'],
    solidesNommes: ['cube', 'pave', 'boule'],
    solidesComptage: ['cube', 'pave'],
    // au CP : « nombre de faces et nature des faces (carré ou rectangle) » (p. 32)
    comptes: ['faces', 'nature'],
  },
  // programme du CE1 (p. 33-34) : pas de symétrie ni de losange (CE2) ; les propriétés des carrés et des rectangles et l'angle droit y sont ;
  // faces, sommets et arêtes du cube, du pavé et de la pyramide
  ce1: {
    // le disque et le cercle, côte à côte : la surface et la ligne (« disque, cercle, centre », p. 34) ; pas encore « un carré est un
    // rectangle » (une inclusion que le programme du CE1 ne demande pas)
    figures: ['disque', 'carre', 'rectangle', 'triangle', 'triangle_rectangle', 'cercle'],
    angleDroit: true,
    proprietes: ['v-carre-ad', 'v-carre-cotes', 'v-rect-cotes', 'v-rect-opp', 'v-rect-ad', 'v-trirect-3', 'v-trirect-1', 'v-tri-cotes'],
    solides: ['cube', 'pave', 'pyramide', 'cylindre', 'boule', 'cone'],
    solidesComptage: ['cube', 'pave', 'pyramide'],
    comptes: ['faces', 'sommets', 'aretes', 'nature'],
    anglesFormes: ['carre', 'rectangle', 'triangle_rectangle', 'triangle', 'trapeze_rectangle', 'un_angle', 'sans_angle'],
  },
  ce2: {
    symetrie: { cols: 12, rows: 10, nbCases: [8, 14], toucheAxe: 0.4 },
    figures: ['disque', 'carre', 'rectangle', 'triangle', 'triangle_rectangle', 'cercle', 'losange'],
    angleDroit: true,
    solides: ['cube', 'pave', 'pyramide', 'cylindre', 'boule', 'cone'],
    solidesComptage: ['cube', 'pave', 'pyramide'],
    comptes: ['faces', 'sommets', 'aretes', 'nature'],
    anglesFormes: ['carre', 'rectangle', 'triangle_rectangle', 'triangle', 'trapeze_rectangle', 'un_angle', 'sans_angle'],
    rayons: [2, 9],
  },
}

type NiveauGeo = keyof typeof NIVEAUX
/** Niveau connu (sinon le CE1). */
export const niveauConnu = (niveau: Classe): NiveauGeo => (niveau in NIVEAUX ? niveau as NiveauGeo : 'ce1')
/** Les fiches guidées du CP (mots à recopier, figures en double, tableau). */
export const ficheGuidee = (niveau: Classe): boolean => NIVEAUX[niveauConnu(niveau)].ficheGuidee ?? false
/** L'angle droit est-il au programme du niveau (à partir du CE1) ? Sinon, on ne le code pas sur les figures. */
export const angleDroitAu = (niveau: Classe): boolean => NIVEAUX[niveauConnu(niveau)].angleDroit
/** Données du niveau, avec la liste des types de questions que l'exercice y propose (sa définition). */
export const donneesDe = (niveau: Classe, exercices: readonly TypeExercice[]): DonneesNiveau & { exercices: readonly TypeExercice[] } =>
  ({ ...NIVEAUX[niveauConnu(niveau)], exercices })

/** Propriétés des figures qui servent au programme (`programme` : id de FIGURES_C* dans src/data/programme.ts). */
export const FIGURES: Readonly<Record<FormeFigure, { cotes: number, angleDroit: boolean, programme: string }>> = {
  disque: { cotes: 0, angleDroit: false, programme: 'disque' },
  carre: { cotes: 4, angleDroit: true, programme: 'carre' },
  rectangle: { cotes: 4, angleDroit: true, programme: 'rectangle' },
  triangle: { cotes: 3, angleDroit: false, programme: 'triangle' },
  triangle_rectangle: { cotes: 3, angleDroit: true, programme: 'triangle-rectangle' },
  cercle: { cotes: 0, angleDroit: false, programme: 'cercle' },
  losange: { cotes: 4, angleDroit: false, programme: 'losange' },
}
// Noms à ne pas proposer comme « mauvaise » réponse car aussi justes (le carré est un losange et un rectangle…)
export const NOMS_CONCURRENTS: Readonly<Partial<Record<FormeFigure, readonly FormeFigure[]>>> = {
  carre: ['losange', 'rectangle'],
  triangle_rectangle: ['triangle'],
}
type Triangle = readonly [readonly [number, number], readonly [number, number], readonly [number, number]]
type Quadrilatere = readonly (readonly [number, number])[]
// Triangles quelconques (aucun angle proche de l'angle droit — vérifié par test)
export const TRIANGLES: readonly Triangle[] = [
  [[-70, 40], [70, 40], [-20, -60]],
  [[-85, 35], [85, 35], [-110, -40]],
  [[-60, 50], [80, 30], [0, -60]],
  [[-75, 45], [85, 45], [-15, -55]],
]
export const ROTATIONS: readonly number[] = [0, 15, 30, 45, 60, 90, 120, 135, 160, 200, 250, 300, 330]
// Carré : pas de rotation proche de 45° (il ressemblerait à un losange « posé sur la pointe »)
export const ROTATIONS_CARRE: readonly number[] = ROTATIONS.filter(r => r % 90 <= 20 || r % 90 >= 70)
// Quadrilatères pour « quels angles sont droits ? » (angles non droits à plus de 20° de 90° — vérifié par test)
export const FORMES_LIBRES: Readonly<Record<FormeLibre, readonly Quadrilatere[]>> = {
  trapeze_rectangle: [[[-70, -50], [40, -50], [80, 50], [-70, 50]], [[-60, -50], [60, -50], [60, 50], [-20, 50]]],
  un_angle: [[[-60, -60], [60, -60], [20, 20], [-60, 60]], [[-60, -60], [60, -60], [0, 60], [-60, -20]]],
  sans_angle: [[[-70, -40], [50, -40], [80, 40], [-40, 40]], [[-40, -45], [40, -45], [80, 45], [-80, 45]]],
}

// Solides : nombre de faces et de sommets (pour ceux qu'on compte), et s'ils roulent
// (la pyramide : à base carrée, celle du programme du CE1)
/** La nature des faces d'un polyèdre (les réponses de « De quelle forme sont ses faces ? »). */
export type NatureFaces = 'carres' | 'rectangles' | 'triangles' | 'trianglesCarre'
export const NATURES: readonly NatureFaces[] = ['carres', 'rectangles', 'triangles', 'trianglesCarre']
export const SOLIDES: Readonly<Record<SolideGeo, { faces?: number, sommets?: number, aretes?: number, nature?: NatureFaces, roule: boolean }>> = {
  cube: { faces: 6, sommets: 8, aretes: 12, nature: 'carres', roule: false },
  pave: { faces: 6, sommets: 8, aretes: 12, nature: 'rectangles', roule: false },
  pyramide: { faces: 5, sommets: 5, aretes: 8, nature: 'trianglesCarre', roule: false },
  cylindre: { roule: true },
  boule: { roule: true },
  cone: { roule: true },
}

/** Une propriété : `figure` : indice (dans `choixFigures`) de la bonne réponse d'une question à choix ; sinon une affirmation « Vrai ou faux ? ». */
export interface Propriete { id: string, figure?: number, vrai?: boolean }
// Propriétés des figures (CE2). Textes dans le catalogue de contenu (`propriete.<id>`)
export const PROPRIETES: readonly Propriete[] = [
  { id: 'q-carre', figure: 0 }, { id: 'q-rect', figure: 1 }, { id: 'q-trirect', figure: 3 }, { id: 'q-losange', figure: 2 },
  { id: 'v-carre-ad', vrai: true }, { id: 'v-carre-cotes', vrai: true }, { id: 'v-rect-cotes', vrai: false },
  { id: 'v-rect-opp', vrai: true }, { id: 'v-rect-ad', vrai: true }, { id: 'v-trirect-3', vrai: false },
  { id: 'v-trirect-1', vrai: true }, { id: 'v-carre-rect', vrai: true }, { id: 'v-losange-ad', vrai: false },
  { id: 'v-tri-cotes', vrai: false },
]
export const aChoix = (p: Propriete): boolean => p.figure !== undefined
