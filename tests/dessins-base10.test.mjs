// Le matériel de base 10 de l'affiche des nombres (src/dessins/base10.ts, `representation`) : les traits restent proportionnels au
// dessin (l'affiche dessine en millimètres : des traits prévus pour des pixels noyaient une barre de 12 mm), les plaques ont la
// même taille quel que soit le nombre, et le dessin de l'exercice (pixels) garde ses traits d'origine.
//   node tests/dessins-base10.test.mjs
import { representation, svgBase10 } from '../src/dessins/base10.ts'
import { verifier, nbEchecs } from './outils.mjs'

const H = 12, LARGEUR = 100   // la hauteur d'une ligne de l'affiche (mm) et la largeur dont dispose le dessin
const nombres = (svg, balise, attr) => [...svg.matchAll(new RegExp(`<${balise}[^>]*?\\s${attr}="([\\d.]+)"`, 'g'))].map(m => +m[1])

console.log('Traits proportionnels')
for (const [type, n] of [['unites', 7], ['dizaines', 30], ['dizaines', 100], ['centaines', 300], ['centaines', 1000]]) {
  const svg = representation(type, n, H, LARGEUR)
  const traits = nombres(svg, '(?:rect|line)', 'stroke-width')
  verifier(traits.length > 0 && Math.max(...traits) <= H * 0.06, `${type} ${n} : bordures et quadrillage fins (${Math.max(...traits).toFixed(2)} mm au plus pour ${H} mm de haut)`)
}

console.log('Plaques de taille constante')
const cote = n => nombres(representation('centaines', n, H, LARGEUR), 'rect', 'width')[0]
const cotes = [100, 200, 300, 400, 500, 600, 1000].map(cote)
verifier(new Set(cotes.map(c => c.toFixed(3))).size === 1, `une plaque a le même côté de 100 à 1 000 (${cotes.map(c => c.toFixed(2)).join(', ')} mm)`)
verifier(cotes[0] <= H / 2, 'deux rangées de plaques tiennent dans la hauteur de la ligne')

console.log('Zéro et exercice')
verifier(representation('dizaines', 0, H, LARGEUR) === '' && representation('centaines', 0, H, LARGEUR) === '', 'zéro : rien à dessiner')
verifier(/stroke-width="1\.5"/.test(svgBase10(0, 1, 1, 1)), 'le dessin de l’exercice garde ses traits d’origine (1,5 px)')

process.exit(nbEchecs() ? 1 : 0)
