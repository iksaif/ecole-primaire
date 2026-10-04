// Génération de l'affiche de l'alphabet — partagée par l'app et le build des PDF.
import { metriquesPolice, largeurTexte, dimensionsPage, documentImpression, echapper } from '../utils/impression'
import { langueRegionale } from '../data/languesRegionales'
import textesFr from '../i18n/fr/contenu/alphabet.js'
import textesBr from '../i18n/br/contenu/alphabet.js'

// Textes des affiches (contenu) par langue : src/i18n/<langue>/contenu/alphabet.js, choisis par config.langue
const TEXTES = { fr: textesFr, br: textesBr }
const textePour = (langue, cle) => (TEXTES[langue] ?? textesFr)[cle] ?? textesFr[cle]
// Libellé d'un style dans une langue
export const libelleStyle = (id, langue) => textePour(langue, `style_${id}`)

// label (français) et br : libellés tirés des catalogues, gardés pour les vues ; préférer libelleStyle(id, langue)
export const STYLES = ['script-maj', 'script-min', 'attache-maj', 'attache-min']
  .map(id => ({ id, label: libelleStyle(id, 'fr'), br: libelleStyle(id, 'br') }))

// Un mot simple et imageable par lettre ; la lettre est mise en couleur dans le mot
export const MOTS = {
  a: ['abeille', '🐝'], b: ['ballon', '🎈'], c: ['canard', '🦆'], d: ['dauphin', '🐬'],
  e: ['escargot', '🐌'], f: ['fraise', '🍓'], g: ['gorille', '🦍'], h: ['hibou', '🦉'],
  i: ['image', '🖼️'], j: ['jus', '🧃'], k: ['koala', '🐨'], l: ['lion', '🦁'],
  m: ['maison', '🏠'], n: ['nuage', '☁️'], o: ['orange', '🍊'], p: ['pomme', '🍎'],
  q: ['quille', '🎳'], r: ['renard', '🦊'], s: ['soleil', '☀️'], t: ['tortue', '🐢'],
  u: ['usine', '🏭'], v: ['vache', '🐄'], w: ['wagon', '🚃'], x: ['taxi', '🚕'],
  y: ['stylo', '🖊️'], z: ['zèbre', '🦓'],
}
export const LETTRES_FR = Object.keys(MOTS)
const VOYELLES = new Set(['a', 'e', 'i', 'o', 'u', 'y'])

export const DEFAUTS = {
  format: 'A4', orientation: 'landscape', disposition: 'grille',
  styles: STYLES.map(s => s.id), mot: true, voyelles: true, lignes: false,
  alphabet: 'fr', // ou le code d'une langue régionale (ex. 'br' : alphabet breton avec ch et c'h)
}

// Petit lignage Seyès derrière l'attaché : hauteur d'x = 1 interligne
function cellAttache(texte, haut, largeur, avecLignes, polices) {
  const m = metriquesPolice(polices.attache)
  // la zone fait 5 interlignes : ~3 au-dessus de la ligne d'écriture (hampes, majuscules), ~2 en dessous ;
  // on réduit si le texte (ex. « C'H c'h ») est trop large pour la carte
  const brut = texte.replace(/&#8199;/g, '  ')
  const i = Math.min(haut / 5, largeur * 0.88 * m.x / largeurTexte(brut, polices.attache))
  const taille = i / m.x
  const base = Math.min(3.25, 0.25 + m.hampe / m.x) * i
  let lignes = ''
  if (avecLignes) {
    for (let k = -3; k <= 2; k++) {
      const y = base + k * i
      lignes += `<line x1="0" x2="100%" y1="${y}mm" y2="${y}mm" stroke="${k === 0 ? '#8e9ad8' : '#d3daf5'}" stroke-width="${k === 0 ? 0.3 : 0.15}mm"/>`
    }
  }
  return `<svg class="att" style="height:${haut}mm">${lignes}
<text x="50%" y="${base}mm" text-anchor="middle" font-family="'${polices.attache}'" font-size="${taille}mm">${echapper(texte).replace(/&amp;#8199;/g, '&#8199;')}</text></svg>`
}

function carte(l, w, h, config, polices) {
  const styles = config.styles
  const couleur = config.voyelles ? (VOYELLES.has(l) ? '#d62828' : '#1d4e9e') : '#1a1a1a'
  // digrammes (ch, c'h) : seule la première lettre en majuscule → Ch, C'h
  const maj = x => x[0].toLocaleUpperCase('fr-FR') + x.slice(1)
  const aScript = styles.some(s => s.startsWith('script'))
  const aAttache = styles.some(s => s.startsWith('attache'))
  const hMot = config.mot && (config.mots ?? MOTS)[l] ? h * 0.2 : 0
  const nbZones = (aScript ? 1 : 0) + (aAttache ? 1 : 0)
  const hZone = (h - hMot - h * 0.06) / Math.max(1, nbZones)
  const metS = metriquesPolice(polices.script)
  // taille script : la majuscule occupe ~62 % de la zone, limitée par la largeur
  const txtScript = [styles.includes('script-maj') ? maj(l) : '', styles.includes('script-min') ? l : ''].filter(Boolean).join(' ')
  const tailleScript = Math.min(hZone * 0.62 / metS.majuscule, w * 0.85 / largeurTexte(txtScript, polices.script))

  let s = ''
  if (aScript) {
    const txt = echapper(txtScript).replace(' ', '&#8239;')
    s += `<div class="zone script" style="height:${hZone}mm;font-size:${tailleScript}mm;color:${couleur}">${txt}</div>`
  }
  if (aAttache) {
    const txt = [styles.includes('attache-maj') ? maj(l) : '', styles.includes('attache-min') ? l : '']
      .filter(Boolean).join('&#8199;')
    s += `<div class="zone" style="color:${couleur}">${cellAttache(txt, hZone, w, config.lignes, polices)}</div>`
  }
  const mots = config.mots ?? MOTS
  if (config.mot && mots[l]) {
    const [mot, emoji] = mots[l]
    const tMot = Math.min(hMot * 0.42, w / (mot.length * 0.62 + 3))
    const k = mot.indexOf(l)
    const motHtml = k < 0 ? mot : `${mot.slice(0, k)}<b style="color:${couleur}">${l}</b>${mot.slice(k + l.length)}`
    s += `<div class="mot" style="height:${hMot}mm;font-size:${tMot}mm"><span class="emoji">${emoji}</span><span>${motHtml}</span></div>`
  }
  return `<div class="carte" style="width:${w}mm;height:${h}mm">${s}</div>`
}

// polices = { attache, script } : noms des familles à utiliser (déjà chargées)
export function genererAlphabet(config, polices) {
  const { format, orientation, disposition } = config
  // alphabet d'une langue régionale : ses propres mots illustrés (s'il y en a)
  const reg = config.alphabet && config.alphabet !== 'fr' ? langueRegionale(config.alphabet) : null
  const LETTRES = reg ? reg.alphabet : LETTRES_FR
  if (reg) config = { ...config, mots: reg.mots ?? {}, mot: config.mot && !!reg.mots }
  const titreAffiche = reg?.titreAlphabet ?? textePour(config.langue, 'titreAlphabet')
  const { w, h } = dimensionsPage(format, orientation)
  const marge = 8, ecart = format === 'A3' ? 3 : 2
  let pages
  if (disposition === 'carte') {
    pages = LETTRES.map(l => `<div class="contenu">${carte(l, w - 2 * marge, h - 2 * marge, config, polices)}</div>`)
  } else {
    const titreH = format === 'A3' ? 16 : 11
    const cols = orientation === 'landscape' ? 7 : 5
    const rows = Math.ceil(LETTRES.length / cols)
    const cw = (w - 2 * marge - (cols - 1) * ecart) / cols
    const ch = (h - 2 * marge - titreH - (rows - 1) * ecart) / rows
    pages = [`<div class="contenu"><h1 style="height:${titreH}mm;font-size:${titreH * 0.62}mm">${titreAffiche}</h1>
<div class="grille" style="grid-template-columns:repeat(${cols}, ${cw}mm);gap:${ecart}mm">${LETTRES.map(l => carte(l, cw, ch, config, polices)).join('')}</div></div>`]
  }
  const html = documentImpression({
    titre: config.titre || "Affiche de l'alphabet", format, orientation, pages,
    css: `.contenu { position: absolute; inset: ${marge}mm; }
h1 { text-align: center; font-weight: 700; color: #333; line-height: 1; }
.grille { display: grid; justify-content: center; }
.carte { border: 0.5mm solid #c8ccd4; border-radius: 3mm; display: flex; flex-direction: column;
  justify-content: center; overflow: hidden; background: white; }
.zone { display: flex; align-items: center; justify-content: center; }
.zone.script { font-family: '${polices.script}'; line-height: 1; }
.att { width: 100%; display: block; overflow: visible; }
.att text { fill: currentColor; }
.mot { display: flex; align-items: center; justify-content: center; gap: .25em; color: #444;
  border-top: 0.3mm dashed #d0d4dc; font-family: '${polices.script}'; }
.emoji { font-size: 1.3em; line-height: 1; }`,
  })
  return { html, nbPages: pages.length, format, orientation }
}
