// Écriture — la fiche : lignage Seyès en SVG (mm), puis, ligne d'écriture après ligne d'écriture, le modèle en noir et ses copies grises.
// Chaque élément (generateur.ts) donne un « groupe » de lignes par écriture choisie :
//   - élément court (une lettre, un mot) : une ligne « à repasser » remplie de copies grises après le modèle (× repasser), puis le
//     modèle seul au début de lignes à compléter (× copie) ;
//   - élément long (une phrase) : coupé en segments qui tiennent sur une ligne ; chacun : le modèle, des lignes grises entières, des
//     lignes vides.
// Les groupes sont répartis sur les pages sans en couper un quand c'est possible. La taille du texte vient de la police : en attaché, la
// hauteur d'x vaut un interligne ; en script, les majuscules montent à trois interlignes. La mesure (largeur, hauteurs) est injectée
// (`mesure` : canvas dans le navigateur, largeurs tabulées au build) : la fiche reste pure.
import { documentImpression } from '../../utils/page.ts'
import { echapper } from '../../utils/html.js'
import { mesureEstimee } from '../../affiches/mesure.ts'
import type { Mesure } from '../../affiches/types.ts'
import type { ParamsFiche } from '../../noyau/types.ts'
import { POLICES_LIVREES, TOUS_STYLES, estAttache, estMajuscule } from './donnees.ts'
import type { ReglagesEcriture, Style } from './donnees.ts'
import type { Element, TirageFiche } from './generateur.ts'

// ── Mise en forme du texte selon l'écriture ──

const majuscule = (s: string): string => s.toLocaleUpperCase('fr-FR')
/** une majuscule au début de chaque mot (attaché majuscule : « Lundi ») */
const capitaliser = (s: string): string => s.replace(/(^|[\s-])(\p{L})/gu, (_, avant: string, lettre: string) => avant + majuscule(lettre))
/** digrammes (ch, c'h) : seule la première lettre en majuscule → Ch, C'h */
const majusculeDeLettre = (l: string): string => majuscule(l[0]) + l.slice(1)

/** Le texte d'un élément dans une écriture. */
function transformer({ texte, lettre }: Element, style: Style): string {
  if (style === 'script-maj') return lettre ? majusculeDeLettre(texte) : majuscule(texte)
  if (style === 'attache-maj') return lettre ? majusculeDeLettre(texte) : capitaliser(texte)
  return lettre ? texte.toLocaleLowerCase('fr-FR') : texte
}

// ── Géométrie de la page (mm) ──

const PAGE_L = 210, PAGE_H = 297, MARGE = 10, ENTETE = 18

interface Geometrie {
  /** interligne et carreau (4 interlignes) */
  i: number
  c: number
  nbCol: number
  nbLig: number
  /** coin du lignage, marge rouge */
  x0: number
  y0: number
  margeRouge: number
  /** où commence et finit l'écriture sur une ligne */
  debut: number
  fin: number
  /** les lignes d'écriture (y), une ligne principale sur un ou deux */
  lignes: number[]
}

function geometrie(reglages: ReglagesEcriture): Geometrie {
  const i = reglages.interligne
  const c = 4 * i
  const nbCol = Math.floor((PAGE_L - 2 * MARGE) / c)
  const nbLig = Math.floor((PAGE_H - MARGE - ENTETE - MARGE) / c)
  const x0 = (PAGE_L - nbCol * c) / 2
  const y0 = MARGE + ENTETE
  const margeRouge = x0 + Math.ceil(18 / c) * c
  const pas = reglages.sauter ? 2 : 1
  // ligne d'écriture posée sur une ligne principale (épaisse), en laissant la place des hampes
  const lignes: number[] = []
  for (let k = 1; k <= nbLig - 1; k += pas) lignes.push(y0 + k * c)
  return { i, c, nbCol, nbLig, x0, y0, margeRouge, debut: margeRouge + c / 2, fin: x0 + nbCol * c - 1.5, lignes }
}

/** Une police posée : sa famille et sa taille (mm). */
interface Police { famille: string, taille: number }

function policeDe(style: Style, g: Geometrie, polices: Readonly<Record<string, string>>, mesure: Mesure): Police {
  if (estAttache(style)) {
    const famille = polices.attache
    return { famille, taille: g.i / mesure.metriques(famille).x }
  }
  const famille = polices.script
  return { famille, taille: 3 * g.i / mesure.metriques(famille).majuscule }
}

/** Coupe un texte long en segments qui tiennent sur une ligne. */
function couper(texte: string, police: Police, largeurMax: number, mesure: Mesure): string[] {
  const segments: string[] = []
  let courant = ''
  for (const mot of texte.split(/\s+/).filter(Boolean)) {
    const essai = courant ? `${courant} ${mot}` : mot
    if (!courant || mesure.largeur(essai, police.famille) * police.taille <= largeurMax) courant = essai
    else { segments.push(courant); courant = mot }
  }
  if (courant) segments.push(courant)
  return segments
}

// ── Lignes et groupes ──

/** Un texte posé sur une ligne : en noir (modèle) ou en gris (à repasser). */
interface Morceau { texte: string, x: number, gris: boolean }
interface Ligne { police: Police, morceaux: Morceau[] }

interface Contexte { g: Geometrie, reglages: ReglagesEcriture, polices: Readonly<Record<string, string>>, mesure: Mesure }

/** Élément court : modèle noir puis copies grises sur toute la ligne (× repasser), puis le modèle seul (× copie). */
function groupeCourt(texte: string, largeur: number, ecart: number, police: Police, { g, reglages }: Contexte): Ligne[] {
  const largeurUtile = g.fin - g.debut
  const nbCopies = Math.max(1, Math.floor((largeurUtile + ecart) / (largeur + ecart)))
  const aRepasser = Array.from({ length: nbCopies }, (_, k) => ({ texte, x: g.debut + k * (largeur + ecart), gris: k > 0 }))
  const modele = (): Morceau[] => [{ texte, x: g.debut, gris: false }]
  const lignes: Ligne[] = []
  for (let r = 0; r < reglages.repasser; r++) lignes.push({ police, morceaux: aRepasser })
  for (let r = 0; r < reglages.copie; r++) lignes.push({ police, morceaux: modele() })
  // ni ligne à repasser ni ligne à copier : le modèle quand même
  if (!lignes.length) lignes.push({ police, morceaux: modele() })
  return lignes
}

/** Élément long : pour chaque segment, le modèle, des lignes grises entières, puis des lignes vides. */
function groupesLongs(texte: string, police: Police, { g, reglages, mesure }: Contexte): Ligne[][] {
  // sans ligne à repasser, au moins une ligne vide pour écrire
  const nbVides = Math.max(reglages.copie, reglages.repasser ? 0 : 1)
  return couper(texte, police, g.fin - g.debut, mesure).map(segment => {
    const lignes: Ligne[] = [{ police, morceaux: [{ texte: segment, x: g.debut, gris: false }] }]
    for (let r = 0; r < reglages.repasser; r++) lignes.push({ police, morceaux: [{ texte: segment, x: g.debut, gris: true }] })
    for (let r = 0; r < nbVides; r++) lignes.push({ police, morceaux: [] })
    return lignes
  })
}

/** Les groupes de lignes : un par élément et par écriture (un groupe par segment pour un élément long). */
function construireGroupes(elements: TirageFiche, ctx: Contexte): Ligne[][] {
  const { g, reglages, polices, mesure } = ctx
  const styles = TOUS_STYLES.filter(s => reglages.styles.includes(s))
  const groupes: Ligne[][] = []
  for (const element of elements) {
    for (const style of styles) {
      // les chiffres n'ont qu'une forme : on ne les répète pas en majuscule
      if (element.lettre && /\d/.test(element.texte) && estMajuscule(style)) continue
      const police = policeDe(style, g, polices, mesure)
      let texte = transformer(element, style)
      const lettreLiee = element.lettre && reglages.lier && style === 'attache-min' && /^\p{L}$/u.test(texte)
      if (lettreLiee) texte = texte.repeat(3)
      const largeur = mesure.largeur(texte, police.famille) * police.taille
      const ecart = element.lettre ? g.c : 1.5 * g.c
      const tientDeuxFois = largeur * 2 + ecart <= g.fin - g.debut
      if (reglages.contenu !== 'texte' && tientDeuxFois) groupes.push(groupeCourt(texte, largeur, ecart, police, ctx))
      else groupes.push(...groupesLongs(texte, police, ctx))
    }
  }
  return groupes
}

/** Répartit les groupes sur les pages, sans couper un groupe quand il tient sur une page. */
function paginer(groupes: Ligne[][], parPage: number): Ligne[][] {
  const pages: Ligne[][] = [[]]
  for (const groupe of groupes) {
    let page = pages[pages.length - 1]
    const deborde = page.length + groupe.length > parPage
    if (page.length && deborde && groupe.length <= parPage) { page = []; pages.push(page) }
    for (const ligne of groupe) {
      if (page.length >= parPage) { page = []; pages.push(page) }
      page.push(ligne)
    }
  }
  return pages
}

// ── Dessin ──

/** Le lignage Seyès : interlignes fins, lignes principales, verticales des carreaux, marge rouge. */
function svgSeyes(g: Geometrie, couleur: boolean): string {
  const coul = couleur
    ? { forte: '#8e9ad8', fine: '#c9d2f3', marge: '#e5484d' }
    : { forte: '#9a9a9a', fine: '#d4d4d4', marge: '#777' }
  const l = g.nbCol * g.c, h = g.nbLig * g.c
  let s = ''
  for (let k = 0; k <= g.nbLig * 4; k++) {
    const y = g.y0 + k * g.i
    const principale = k % 4 === 0
    s += `<line x1="${g.x0}" y1="${y}" x2="${g.x0 + l}" y2="${y}" stroke="${principale ? coul.forte : coul.fine}" stroke-width="${principale ? 0.22 : 0.12}"/>`
  }
  for (let k = 0; k <= g.nbCol; k++) {
    const x = g.x0 + k * g.c
    s += `<line x1="${x}" y1="${g.y0}" x2="${x}" y2="${g.y0 + h}" stroke="${coul.forte}" stroke-width="0.18"/>`
  }
  s += `<line x1="${g.margeRouge}" y1="${g.y0}" x2="${g.margeRouge}" y2="${g.y0 + h}" stroke="${coul.marge}" stroke-width="0.35"/>`
  return s
}

/** Le texte d'une page : chaque ligne posée sur sa ligne d'écriture. */
function svgTextes(lignes: Ligne[], g: Geometrie): string {
  let s = ''
  lignes.forEach((ligne, n) => {
    const y = g.lignes[n]
    for (const m of ligne.morceaux) {
      s += `<text x="${m.x.toFixed(2)}" y="${y}" font-family="'${ligne.police.famille}'" font-size="${ligne.police.taille.toFixed(3)}" fill="${m.gris ? '#bdbdbd' : '#1a1a1a'}">${echapper(m.texte)}</text>`
    }
  })
  return s
}

// le bandeau du haut : le titre, et la ligne Prénom / Date (`.entete` : l'option « Prénom et date » du cadre la retire)
const CSS = `.feuille { position: absolute; inset: 0; }
.bandeau { position: absolute; top: ${MARGE}mm; left: ${MARGE}mm; right: ${MARGE}mm; display: flex; justify-content: space-between;
  align-items: baseline; font-size: 11pt; border-bottom: 1.5px solid #333; padding-bottom: 2mm; }
.bandeau .entete { font-size: inherit; color: inherit; margin: 0; }
.titre { font-weight: 700; font-size: 13pt; }`

export function fiche({ questions: elements, reglages, T, polices, mesure = mesureEstimee }: ParamsFiche<ReglagesEcriture, TirageFiche>): string {
  const familles = { script: polices?.script ?? POLICES_LIVREES.script, attache: polices?.attache ?? POLICES_LIVREES.attache }
  const g = geometrie(reglages)
  const pages = paginer(construireGroupes(elements, { g, reglages, polices: familles, mesure }), g.lignes.length)
  const nomsStyles = TOUS_STYLES.filter(s => reglages.styles.includes(s)).map(s => T(`style.${s}`).toLowerCase())
  const titre = reglages.titre || T('titre') + nomsStyles.join(T('separateurStyles'))
  const nomDate = `<span class="entete">${T('prenom')} : ____________________ &nbsp; ${T('date')} : ______________</span>`
  const pagesHtml = pages.map(lignes => `<div class="bandeau"><span class="titre">${echapper(titre)}</span>${nomDate}</div>
<svg width="210mm" height="297mm" viewBox="0 0 210 297" class="feuille">${svgSeyes(g, reglages.couleur)}${svgTextes(lignes, g)}</svg>`)
  return documentImpression({ titre, pages: pagesHtml, css: CSS })
}
