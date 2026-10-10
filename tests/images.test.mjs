// Les emojis du socle src/images/ (node sans Chrome) : chaque emoji de la table a son dessin dans les deux styles, les dessins sont
// autonomes (ni identifiant ni renvoi, donc plusieurs copies dans une page ne se gênent pas), les rendus des deux familles et des deux
// styles sont corrects, la préférence se lit avec méfiance, les données restent sous leur budget de poids, et un nom inconnu échoue clairement.
import { gzipSync } from 'node:zlib'
import { readdirSync, readFileSync } from 'node:fs'
import { EMOJIS, SCENES } from '../src/images/tables.ts'
import { COULEUR } from '../src/images/donnees/couleur.ts'
import { CONTOUR } from '../src/images/donnees/contour.ts'
import { creerRenduImages } from '../src/images/rendu.ts'
import { assainirImages, DEFAUT_IMAGES } from '../src/images/preference.ts'
import { caractereDe } from '../src/images/systeme.ts'
import { verifier, nbEchecs } from './outils.mjs'

const noms = Object.keys(EMOJIS)
const codes = Object.values(EMOJIS)

console.log('Table et données')
for (const [style, donnees] of [['couleur', COULEUR], ['contour', CONTOUR]]) {
  verifier(codes.every(c => !!donnees[c]), `${style} : chaque emoji de la table a son dessin (${noms.length})`)
  verifier(Object.keys(donnees).every(c => codes.includes(c)), `${style} : aucun dessin inutile (relancer scripts/generer/images.ts)`)
  verifier(Object.values(donnees).every(d => !/\sid="|url\(#|<script|href=/.test(d)), `${style} : dessins autonomes, sans identifiant, renvoi ni script`)
}
verifier(new Set(codes).size === codes.length, 'deux noms ne désignent pas le même emoji')
verifier(SCENES.every(n => n in EMOJIS), 'les scènes sont des emojis de la table')
verifier(codes.every(c => COULEUR[c] !== CONTOUR[c]), 'le contour diffère de la couleur pour chaque emoji')

// Budget : les données sont dans le paquet des fiches et des affiches, chargé à la demande. Au-delà, découper (contour à la demande,
// lots par domaine) : src/images/README.md, « Poids ». Ne pas relever le budget sans l'écrire là.
const BUDGET_KO_GZIP = 150
for (const style of ['couleur', 'contour']) {
  const ko = gzipSync(readFileSync(new URL(`../src/images/donnees/${style}.ts`, import.meta.url))).length / 1024
  verifier(ko <= BUDGET_KO_GZIP, `${style} : ${ko.toFixed(0)} Ko gzip, sous le budget de ${BUDGET_KO_GZIP} Ko`)
}

console.log('Dessins maison (src/images/maison/)')
const fichiers = readdirSync(new URL('../src/images/maison/', import.meta.url)).filter(f => f.endsWith('.svg') && !f.endsWith('.contour.svg'))
const maison = codes.filter(c => c.startsWith('maison:')).map(c => `${c.slice('maison:'.length)}.svg`)
verifier(fichiers.length > 0 && fichiers.every(f => maison.includes(f)), `chaque dessin maison est dans la table (${fichiers.join(', ')})`)
verifier(fichiers.every(f => readFileSync(new URL(`../src/images/maison/${f}`, import.meta.url), 'utf8').includes('viewBox="0 0 72 72"')), 'cadre 72 × 72, comme OpenMoji')
const contoursMaison = codes.filter(c => c.startsWith('maison:')).map(c => CONTOUR[c])
verifier(contoursMaison.every(d => !/fill="#(?!fff"|000"|000000"|ffffff")[0-9a-f]{3,6}"/i.test(d)), 'contour maison : plus aucun aplat de couleur')

console.log('Rendu par défaut (OpenMoji couleur)')
const defaut = creerRenduImages()
verifier(!defaut.employe, 'un rendu neuf n’a encore rien rendu')
const html = defaut.html('pomme', '8mm')
verifier(defaut.employe, 'il sait qu’il a rendu un emoji (choix des images dans le formulaire)')
verifier(html.startsWith('<svg') && html.includes('width="8mm"') && html.includes('viewBox="0 0 72 72"') && html.includes('data-image="openmoji"'), 'HTML : un svg de la taille demandée, marqué openmoji')
verifier(html.includes(COULEUR[EMOJIS.pomme]), 'HTML : le dessin en couleur')
verifier(html.includes('aria-hidden="true"') && !html.includes('role="img"'), 'HTML sans alt : image décorative')
verifier(defaut.html('pomme').includes('width="1em"'), 'HTML sans taille : il suit le texte (1em)')
verifier(defaut.html('pomme', '8mm', 'une "pomme"').includes('aria-label="une &quot;pomme&quot;"'), 'HTML avec alt : lu par les lecteurs d’écran, guillemets échappés')
verifier(defaut.html('tronc', '8mm').includes('data-image="maison"'), 'la balise dit la source : maison ou openmoji')
verifier(SCENES.every(n => defaut.html(n, '8mm').includes('border-radius')), 'une scène en carré plein a les coins arrondis')
const svg = defaut.svg('pomme', 1.234, 5, 10)
verifier(svg.includes('x="1.23"') && svg.includes('y="5"') && svg.includes('width="10"'), 'SVG : position et côté')
let message = ''
try { defaut.html('nexistepas', '8mm') } catch (e) { message = String(e.message) }
verifier(message.includes('nexistepas'), 'un nom inconnu échoue en disant lequel')

console.log('Contour')
const contour = creerRenduImages({ famille: 'openmoji', style: 'contour' })
verifier(contour.html('pomme', '8mm').includes(CONTOUR[EMOJIS.pomme]), 'OpenMoji en contour : le dessin noir')
verifier(contour.svg('tronc', 0, 0, 10).includes(CONTOUR[EMOJIS.tronc]), 'dessin maison en contour')

console.log('Famille « système »')
const systeme = creerRenduImages({ famille: 'systeme', style: 'couleur' })
verifier(systeme.html('pomme') === '🍎', 'HTML sans taille ni alt : le caractère seul (les instantanés d’une fiche migrée ne bougent pas)')
verifier(systeme.html('soleil') === '☀️', 'un caractère « texte » reçoit le sélecteur emoji (FE0F)')
const carre = systeme.html('pomme', '8mm', 'pomme')
verifier(carre.startsWith('<span role="img" aria-label="pomme"') && carre.includes('width:8mm') && carre.includes('🍎') && !carre.includes('data-image'), 'HTML avec taille : un carré de la taille demandée, sans data-image')
const texte = systeme.svg('pomme', 0, 0, 10)
verifier(texte.startsWith('<text x="5" y="5"') && texte.includes('text-anchor="middle"') && texte.includes('🍎'), 'SVG : le caractère centré dans le carré')
verifier(systeme.html('tronc', '8mm').includes('data-image="maison"') && systeme.svg('pyramide', 0, 0, 10).includes('data-image="openmoji"'), 'sans caractère du système (maison, extras) : le dessin OpenMoji')
verifier(creerRenduImages({ famille: 'systeme', style: 'contour' }).html('pomme') === '🍎', 'système + contour : le caractère du système (pas de contour)')
verifier(creerRenduImages({ famille: 'systeme', style: 'contour' }).html('tronc', '8mm').includes(COULEUR[EMOJIS.tronc]), 'système + contour : un dessin de repli en couleur, comme ses voisins')
verifier(caractereDe('1F408-200D-2B1B') === '🐈‍⬛' && caractereDe('1F3C3-200D-2642') === '🏃‍♂️', 'séquences : FE0F seulement là où il le faut')
verifier(noms.every(n => caractereDe(EMOJIS[n]) !== '' ), 'chaque emoji a un caractère ou null, jamais une chaîne vide')

console.log('Préférence')
verifier(JSON.stringify(assainirImages(undefined)) === JSON.stringify(DEFAUT_IMAGES), 'rien de mémorisé : le défaut')
verifier(JSON.stringify(assainirImages({ famille: 'systeme', style: 'bleu' })) === '{"famille":"systeme","style":"couleur"}', 'un champ inconnu reprend son défaut, l’autre est gardé')
verifier(JSON.stringify(assainirImages('contour')) === JSON.stringify(DEFAUT_IMAGES), 'une valeur corrompue : le défaut')

process.exit(nbEchecs() ? 1 : 0)
