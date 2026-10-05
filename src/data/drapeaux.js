// Drapeaux des langues (SVG), partagés par l'app (Drapeau.vue) et les pages statiques (scripts/telechargements.mjs).
// Les dessins sont dans src/langues/<code>/drapeau.ts.
import { LANGUES, CODES } from '../langues/registre.ts'

const majuscule = s => s.charAt(0).toUpperCase() + s.slice(1)
export const DRAPEAUX = Object.fromEntries(CODES.map(c => [c, { nom: majuscule(LANGUES[c].nomLocal), svg: LANGUES[c].drapeau }]))
