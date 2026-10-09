// Les emojis OpenMoji intégrés (src/images/, node sans Chrome) : chaque emoji de la table a son dessin, le dessin est autonome (ni identifiant ni
// renvoi, donc plusieurs copies dans une page ne se gênent pas), les deux rendus (SVG et HTML) sont corrects, et un nom inconnu échoue clairement.
import { EMOJIS, SCENES } from '../src/images/tables.ts'
import { OPENMOJI } from '../src/images/openmoji-donnees.ts'
import { emojiHtml, emojiSvg } from '../src/images/openmoji.ts'
import { readdirSync, readFileSync } from 'node:fs'
import { verifier, nbEchecs } from './outils.mjs'

const noms = Object.keys(EMOJIS)
const codes = Object.values(EMOJIS)

console.log('Table et données')
verifier(codes.every(c => !!OPENMOJI[c]), `chaque emoji de la table a son dessin (${noms.length})`)
verifier(new Set(codes).size === codes.length, 'deux noms ne désignent pas le même emoji')
verifier(Object.keys(OPENMOJI).every(c => codes.includes(c)), 'aucun dessin inutile dans les données (relancer scripts/generer/images.ts)')
verifier(SCENES.every(n => n in EMOJIS), 'les scènes sont des emojis de la table')
verifier(Object.values(OPENMOJI).every(d => !/\sid="|url\(#|<script|href=/.test(d)), 'dessins autonomes : sans identifiant, renvoi ni script')

console.log('Dessins maison (src/images/maison/)')
const fichiers = readdirSync(new URL('../src/images/maison/', import.meta.url)).filter(f => f.endsWith('.svg'))
const maison = codes.filter(c => c.startsWith('maison:')).map(c => `${c.slice('maison:'.length)}.svg`)
verifier(fichiers.length > 0 && fichiers.every(f => maison.includes(f)), `chaque dessin maison est dans la table (${fichiers.join(', ')})`)
verifier(fichiers.every(f => readFileSync(new URL(`../src/images/maison/${f}`, import.meta.url), 'utf8').includes('viewBox="0 0 72 72"')), 'cadre 72 × 72, comme OpenMoji')
verifier(emojiHtml('tronc', '8mm').includes('data-image="maison"') && emojiHtml('pomme', '8mm').includes('data-image="openmoji"'), 'la balise dit la source : maison ou openmoji')

console.log('Rendus')
const html = emojiHtml('pomme', '8mm')
verifier(html.startsWith('<svg') && html.includes('width="8mm"') && html.includes('viewBox="0 0 72 72"') && html.includes('data-image="openmoji"'), 'HTML : un svg de la taille demandée, marqué openmoji')
verifier(html.includes('aria-hidden="true"') && !html.includes('role="img"'), 'HTML sans alt : image décorative')
verifier(emojiHtml('pomme', '8mm', 'une "pomme"').includes('aria-label="une &quot;pomme&quot;"'), 'HTML avec alt : lu par les lecteurs d’écran, guillemets échappés')
verifier(emojiHtml('couchant', '8mm').includes('border-radius'), 'une scène en carré plein a les coins arrondis')
const svg = emojiSvg('pomme', 1.234, 5, 10)
verifier(svg.includes('x="1.23"') && svg.includes('y="5"') && svg.includes('width="10"'), 'SVG : position et côté')
let message = ''
try { emojiHtml('nexistepas' , '8mm') } catch (e) { message = String(e.message) }
verifier(message.includes('nexistepas'), 'un nom inconnu échoue en disant lequel')

process.exit(nbEchecs() ? 1 : 0)
