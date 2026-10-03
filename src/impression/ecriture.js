// Génération des fiches d'écriture (lignage Seyès) — partagée par l'app et le build des PDF.
import { largeurTexte, metriquesPolice, documentImpression, echapper } from '../utils/impression'

export const STYLES = [
  { id: 'script-maj',  label: 'Script majuscule',   br: 'Skript, pennlizherennoù',     exemple: 'A', attache: false },
  { id: 'script-min',  label: 'Script minuscule',   br: 'Skript, lizherennoù bihan',   exemple: 'a', attache: false },
  { id: 'attache-maj', label: 'Attaché majuscule',  br: 'A-stag, pennlizherennoù',     exemple: 'A', attache: true },
  { id: 'attache-min', label: 'Attaché minuscule',  br: 'A-stag, lizherennoù bihan',   exemple: 'a', attache: true },
]
export const CONTENUS = [
  { id: 'lettres', label: '🔤 Lettres et chiffres' },
  { id: 'mots',    label: '📝 Mots' },
  { id: 'texte',   label: '📄 Phrases' },
]
export const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('')
export const ACCENTS = ['é', 'è', 'ê', 'ë', 'à', 'â', 'î', 'ï', 'ô', 'ù', 'û', 'ç', 'œ']
export const CHIFFRES = '0123456789'.split('')
// Lettres propres aux langues régionales (ch, c'h, ñ en breton) : affichées seulement si la langue est activée
export const LETTRES_REGIONALES = ['ch', "c'h", 'ñ']
export const TOUTES_LETTRES = [...ALPHABET, ...ACCENTS, ...LETTRES_REGIONALES, ...CHIFFRES]

// Listes de mots toutes prêtes (français) ; celles des langues régionales sont dans src/data/languesRegionales.js
export const LISTES_MOTS = [
  { id: 'jours', label: 'Jours de la semaine', titre: 'Les jours de la semaine', mots: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'] },
  { id: 'mois', label: "Mois de l'année", titre: "Les mois de l'année", mots: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'] },
  { id: 'nombres-10', label: 'Nombres 1 → 10', titre: 'Les nombres de un à dix', mots: ['un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix'] },
  { id: 'couleurs', label: 'Couleurs', titre: 'Les couleurs', mots: ['rouge', 'bleu', 'jaune', 'vert', 'orange', 'violet', 'rose', 'marron', 'noir', 'blanc', 'gris'] },
  { id: 'famille', label: 'Famille', titre: 'La famille', mots: ['papa', 'maman', 'frère', 'sœur', 'papi', 'mamie', 'bébé'] },
]
// Familles de lettres de la progression en écriture cursive
export const PRESETS = [
  { label: 'Alphabet', lettres: ALPHABET },
  { label: 'Voyelles', lettres: ['a', 'e', 'i', 'o', 'u', 'y'] },
  { label: 'Rondes (c o a d g q)', lettres: ['c', 'o', 'a', 'd', 'g', 'q'] },
  { label: 'Boucles (e l b h k f)', lettres: ['e', 'l', 'b', 'h', 'k', 'f'] },
  { label: 'Coupes (i u t)', lettres: ['i', 'u', 't'] },
  { label: 'Ponts (m n v w x y)', lettres: ['m', 'n', 'v', 'w', 'x', 'y'] },
  { label: 'Jambages (j p g q y f z)', lettres: ['j', 'p', 'g', 'q', 'y', 'f', 'z'] },
  { label: 'Particulières (r s z x)', lettres: ['r', 's', 'z', 'x'] },
  { label: 'Accents et œ', lettres: ACCENTS },
  { label: 'Chiffres', lettres: CHIFFRES },
  { label: 'Aucune', lettres: [] },
]
export const INTERLIGNES = [
  { mm: 2,   label: '2 mm (CE2 et +)' },
  { mm: 2.5, label: '2,5 mm (CE1)' },
  { mm: 3,   label: '3 mm (CP)' },
  { mm: 4,   label: '4 mm (débutant)' },
]

export const DEFAUTS = {
  styles: ['attache-min'],
  contenu: 'lettres',
  lettres: ['a', 'b', 'c'],
  lier: false,
  mots: 'papa\nmaman\nécole\nmaison\nbonjour',
  texte: "Aujourd'hui, il fait beau.\nLe chat dort sur le tapis.",
  interligne: 3,
  sauter: true,
  repasser: 1,
  copie: 1,
  couleur: true,
}

// ── Mise en forme du texte selon l'écriture ──
const majuscule = s => s.toLocaleUpperCase('fr-FR')
const capitaliser = s => s.replace(/(^|[\s-])(\p{L})/gu, (_, a, b) => a + majuscule(b))

// digrammes (ch, c'h) : seule la première lettre en majuscule → Ch, C'h
const majLettre = l => majuscule(l[0]) + l.slice(1)

function transformer(texte, style, estLettre) {
  if (style === 'script-maj') return estLettre ? majLettre(texte) : majuscule(texte)
  if (style === 'attache-maj') return estLettre ? majLettre(texte) : capitaliser(texte)
  return estLettre ? texte.toLocaleLowerCase('fr-FR') : texte
}

// ── Géométrie de la page (mm) ──
const PAGE_W = 210, PAGE_H = 297, MARGE = 10, ENTETE = 18

function geometrie(config) {
  const i = config.interligne
  const c = 4 * i                       // un carreau Seyès = 4 interlignes
  const nbCol = Math.floor((PAGE_W - 2 * MARGE) / c)
  const nbLig = Math.floor((PAGE_H - MARGE - ENTETE - MARGE) / c)
  const x0 = (PAGE_W - nbCol * c) / 2
  const y0 = MARGE + ENTETE
  const margeRouge = x0 + Math.ceil(18 / c) * c
  const pas = config.sauter ? 2 : 1
  // ligne d'écriture posée sur une ligne principale (épaisse), en laissant la place des hampes
  const lignes = []
  for (let k = 1; k <= nbLig - 1; k += pas) lignes.push(y0 + k * c)
  return { i, c, nbCol, nbLig, x0, y0, margeRouge, debut: margeRouge + c / 2, fin: x0 + nbCol * c - 1.5, lignes }
}

// Taille de police (mm) : en attaché, la hauteur d'x = 1 interligne ;
// en script, les majuscules montent à 3 interlignes.
function policeDe(style, g, polices) {
  if (style.startsWith('attache')) {
    const famille = polices.attache
    return { famille, taille: g.i / metriquesPolice(famille).x }
  }
  const famille = polices.script
  return { famille, taille: 3 * g.i / metriquesPolice(famille).majuscule }
}

// Coupe un texte long en segments qui tiennent sur une ligne
function couper(texte, police, largeurMax) {
  const mots = texte.split(/\s+/).filter(Boolean)
  const segs = []
  let cur = ''
  for (const m of mots) {
    const essai = cur ? cur + ' ' + m : m
    if (!cur || largeurTexte(essai, police.famille) * police.taille <= largeurMax) cur = essai
    else { segs.push(cur); cur = m }
  }
  if (cur) segs.push(cur)
  return segs
}

// Chaque « groupe » = les lignes consacrées à un élément (une lettre, un mot, un segment de phrase)
function construireGroupes(g, config, polices) {
  const { styles, contenu, repasser, copie, lier } = config
  const largeurUtile = g.fin - g.debut
  const items = contenu === 'lettres' ? config.lettres.map(t => ({ t, lettre: true }))
    : (contenu === 'mots' ? config.mots : config.texte)
        .split('\n').map(s => s.trim()).filter(Boolean).map(t => ({ t, lettre: false }))
  const ordreStyles = STYLES.map(s => s.id).filter(s => styles.includes(s))
  const groupes = []

  for (const item of items) {
    for (const style of ordreStyles) {
      // les chiffres n'ont qu'une forme : on ne les répète pas en majuscule
      if (item.lettre && /\d/.test(item.t) && style.endsWith('maj')) continue
      const police = policeDe(style, g, polices)
      let texte = transformer(item.t, style, item.lettre)
      if (item.lettre && lier && style === 'attache-min' && /^\p{L}$/u.test(texte)) texte = texte.repeat(3)
      const largeur = largeurTexte(texte, police.famille) * police.taille
      const ecart = item.lettre ? g.c : 1.5 * g.c
      const lignes = []

      if (contenu !== 'texte' && largeur * 2 + ecart <= largeurUtile) {
        // élément court : modèle noir puis copies grises sur toute la ligne
        const nbRep = Math.max(1, Math.floor((largeurUtile + ecart) / (largeur + ecart)))
        const ligneRepasser = Array.from({ length: nbRep }, (_, k) => ({
          texte, x: g.debut + k * (largeur + ecart), gris: k > 0,
        }))
        for (let r = 0; r < repasser; r++) lignes.push({ police, morceaux: ligneRepasser })
        for (let r = 0; r < copie; r++) lignes.push({ police, morceaux: [{ texte, x: g.debut, gris: false }] })
        if (!lignes.length) lignes.push({ police, morceaux: [{ texte, x: g.debut, gris: false }] })
        groupes.push(lignes)
      } else {
        // élément long : modèle, puis lignes grises entières, puis lignes vides
        for (const seg of couper(texte, police, largeurUtile)) {
          const l = [{ police, morceaux: [{ texte: seg, x: g.debut, gris: false }] }]
          for (let r = 0; r < repasser; r++) l.push({ police, morceaux: [{ texte: seg, x: g.debut, gris: true }] })
          for (let r = 0; r < Math.max(copie, repasser ? 0 : 1); r++) l.push({ police, morceaux: [] })
          groupes.push(l)
        }
      }
    }
  }
  return groupes
}

// Répartit les groupes sur les pages sans couper un groupe si possible
function paginer(groupes, parPage) {
  const pages = [[]]
  for (const gr of groupes) {
    let page = pages[pages.length - 1]
    if (page.length && page.length + gr.length > parPage && gr.length <= parPage) {
      page = []; pages.push(page)
    }
    for (const l of gr) {
      if (page.length >= parPage) { page = []; pages.push(page) }
      page.push(l)
    }
  }
  return pages
}

function svgSeyes(g, config) {
  const coul = config.couleur
    ? { forte: '#8e9ad8', fine: '#c9d2f3', marge: '#e5484d' }
    : { forte: '#9a9a9a', fine: '#d4d4d4', marge: '#777' }
  const w = g.nbCol * g.c, h = g.nbLig * g.c
  let s = ''
  for (let k = 0; k <= g.nbLig * 4; k++) {
    const y = g.y0 + k * g.i
    const principale = k % 4 === 0
    s += `<line x1="${g.x0}" y1="${y}" x2="${g.x0 + w}" y2="${y}" stroke="${principale ? coul.forte : coul.fine}" stroke-width="${principale ? 0.22 : 0.12}"/>`
  }
  for (let k = 0; k <= g.nbCol; k++) {
    const x = g.x0 + k * g.c
    s += `<line x1="${x}" y1="${g.y0}" x2="${x}" y2="${g.y0 + h}" stroke="${coul.forte}" stroke-width="0.18"/>`
  }
  s += `<line x1="${g.margeRouge}" y1="${g.y0}" x2="${g.margeRouge}" y2="${g.y0 + h}" stroke="${coul.marge}" stroke-width="0.35"/>`
  return s
}


// polices = { attache, script } : noms des familles à utiliser (déjà chargées)
export function genererEcriture(config, polices) {
  const g = geometrie(config)
  const groupes = construireGroupes(g, config, polices)
  const pagesLignes = paginer(groupes, g.lignes.length)
  const br = config.langue === 'br'
  const titre = config.titre || (br ? 'Skrivañ — ' : 'Écriture — ') +
    STYLES.filter(s => config.styles.includes(s.id)).map(s => (br ? s.br : s.label).toLowerCase()).join(br ? ' ; ' : ', ')
  const entete = br ? 'Anv-bihan' : 'Prénom', date = br ? 'Deiziad' : 'Date'
  const pagesHtml = pagesLignes.map(lignes => {
    let texte = ''
    lignes.forEach((l, n) => {
      const y = g.lignes[n]
      for (const m of l.morceaux) {
        texte += `<text x="${m.x.toFixed(2)}" y="${y}" font-family="'${l.police.famille}'" font-size="${l.police.taille.toFixed(3)}" fill="${m.gris ? '#bdbdbd' : '#1a1a1a'}">${echapper(m.texte)}</text>`
      }
    })
    return `<div class="entete"><span class="titre">${echapper(titre)}</span><span>${entete} : ____________________ &nbsp; ${date} : ______________</span></div>
<svg width="210mm" height="297mm" viewBox="0 0 210 297" class="feuille">${svgSeyes(g, config)}${texte}</svg>`
  })
  const html = documentImpression({
    titre,
    pages: pagesHtml,
    css: `.feuille { position: absolute; inset: 0; }
.entete { position: absolute; top: ${MARGE}mm; left: ${MARGE}mm; right: ${MARGE}mm; display: flex; justify-content: space-between;
  align-items: baseline; font-size: 11pt; border-bottom: 1.5px solid #333; padding-bottom: 2mm; }
.titre { font-weight: 700; font-size: 13pt; }`,
  })
  return { html, nbPages: pagesHtml.length, format: 'A4', orientation: 'portrait' }
}
