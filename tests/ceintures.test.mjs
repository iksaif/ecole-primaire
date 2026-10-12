// Ceintures de compétences (node) : palettes, dessin (couleur et noir et blanc), réglages communs lus avec méfiance, seuil d'un brevet.
import { PALETTES, IDS_PALETTES, couleursDe } from '../src/ceintures/palettes.ts'
import { ceintureSvg } from '../src/ceintures/dessin.ts'
import { DEFAUT_CEINTURES, BORNES, STYLES_CEINTURE, assainirCeintures, brevetReussi } from '../src/ceintures/reglages.ts'
import { demandeCeintures, ceinturesActives, ceinturesActivesPour } from '../src/contexte/ceintures.ts'
import { SITES } from '../src/sites.ts'
import { LANGUES } from '../src/langues/registre.ts'
import { verifier, nbEchecs } from './outils.mjs'

console.log('Palettes')
verifier(IDS_PALETTES.length === 4, 'quatre palettes')
for (const id of IDS_PALETTES) {
  const { couleurs } = PALETTES[id]
  verifier(couleurs.length >= BORNES.nbCeintures.min && couleurs.length <= BORNES.nbCeintures.max, `${id} : ${couleurs.length} couleurs, dans les bornes`)
  verifier(new Set(couleurs.map(c => c.id)).size === couleurs.length, `${id} : des identifiants distincts`)
  verifier(couleurs.every(c => /^#[0-9a-f]{6}$/.test(c.hex)), `${id} : des teintes valides`)
}
// une ceinture se reconnaît sans couleur : dans une même palette, jamais deux ceintures au même motif
for (const id of IDS_PALETTES) {
  const motifs = PALETTES[id].couleurs.map(c => c.motif)
  verifier(new Set(motifs).size === motifs.length, `${id} : deux ceintures ne partagent jamais leur motif (${motifs.join(', ')})`)
}
verifier(couleursDe('judo', 4).map(c => c.id).join() === 'blanche,jaune,orange,verte', 'couleursDe : les premières de la palette')
verifier(couleursDe('paliers', 8).length === 5 && couleursDe('judo', 0).length === 1, 'couleursDe : borné par la palette, au moins une')

console.log('Noms des couleurs (fr et br)')
const toutes = new Set(IDS_PALETTES.flatMap(id => PALETTES[id].couleurs.map(c => c.id)))
for (const code of ['fr', 'br']) {
  const noms = LANGUES[code].textes.ceintures.couleur
  const manquants = [...toutes].filter(id => !noms[id])
  verifier(!manquants.length, `${code} : un nom pour chaque couleur ${manquants.join(', ')}`)
  const palettes = LANGUES[code].textes.ceintures.palette
  verifier(IDS_PALETTES.every(id => palettes[id]), `${code} : un nom pour chaque palette`)
  verifier(STYLES_CEINTURE.every(s => LANGUES[code].textes.ceintures.style[s]), `${code} : un nom pour chaque style`)
}

console.log('Dessin')
const jaune = PALETTES.judo.couleurs[1]
for (const style of STYLES_CEINTURE) {
  const svg = ceintureSvg({ couleur: jaune, style, noirEtBlanc: false, largeur: '30mm' })
  verifier(svg.startsWith('<svg') && svg.endsWith('</svg>') && svg.includes(jaune.hex) && !svg.includes('<pattern'), `${style} : couleur, sans motif`)
  const nb = ceintureSvg({ couleur: jaune, style, noirEtBlanc: true, largeur: '30mm' })
  verifier(nb.includes(`url(#ceint-${jaune.motif})`) && nb.includes('<pattern') && !nb.includes(jaune.hex), `${style} : noir et blanc, le motif remplace la teinte`)
}
verifier(ceintureSvg({ couleur: jaune, style: 'ruban', noirEtBlanc: false, largeur: '30mm' }) === ceintureSvg({ couleur: jaune, style: 'ruban', noirEtBlanc: false, largeur: '30mm' }), 'déterministe')

console.log('Réglages communs')
verifier(JSON.stringify(assainirCeintures(undefined)) === JSON.stringify(DEFAUT_CEINTURES), 'rien de mémorisé : le défaut')
for (const abime of [null, 42, 'x', [], [[1]], {}, { palette: 3, style: {}, noirEtBlanc: 'oui', nbCeintures: 'beaucoup', seuil: NaN, questions: Infinity, chronometre: 7 }]) {
  verifier(JSON.stringify(assainirCeintures(abime)) === JSON.stringify(DEFAUT_CEINTURES), `valeur abîmée ${JSON.stringify(abime)} : le défaut`)
}
const hors = assainirCeintures({ nbCeintures: 99, seuil: 10, questions: -4 })
verifier(hors.nbCeintures === 7 && hors.seuil === 50 && hors.questions === 5, `hors bornes : ramené aux bornes (${JSON.stringify(hors)})`)
verifier(assainirCeintures({ palette: 'paliers', nbCeintures: 8 }).nbCeintures === 5, 'le nombre de ceintures ne dépasse pas la palette')
const bon = assainirCeintures({ palette: 'rose-violet', style: 'rond', noirEtBlanc: true, nbCeintures: 4, seuil: 80, questions: 20, chronometre: 'doux' })
verifier(bon.palette === 'rose-violet' && bon.style === 'rond' && bon.noirEtBlanc && bon.nbCeintures === 4 && bon.seuil === 80 && bon.questions === 20 && bon.chronometre === 'doux', 'des valeurs valides sont gardées')

console.log('Brevet')
verifier(brevetReussi(9, 10, 90) && !brevetReussi(8, 10, 90) && brevetReussi(10, 10, 100) && !brevetReussi(9, 10, 100), 'seuil 90 et 100 %')
verifier(brevetReussi(18, 20, 90) && !brevetReussi(17, 20, 90), 'le seuil suit le nombre de questions')
verifier(!brevetReussi(0, 0, 50), 'aucune question : jamais réussi')

console.log('Option (cachée par défaut)')
verifier(demandeCeintures({ ceintures: 'oui' }) === true && demandeCeintures({ ceintures: 'non' }) === false && demandeCeintures({ ceintures: '1' }) === null && demandeCeintures({}) === null, 'demandeCeintures : oui, non, ou rien')
verifier(demandeCeintures({ ceintures: ['oui', 'non'] }) === true, 'demandeCeintures : le premier de plusieurs paramètres')
verifier(Object.values(SITES).every(s => s.ceinturesVisibles === false), 'aucun site ne propose les ceintures d’office')
verifier(ceinturesActives.value === false && Object.values(SITES).every(s => !ceinturesActivesPour(s)), 'sans réglage d’appareil : les ceintures sont cachées')

process.exit(nbEchecs() ? 1 : 0)
