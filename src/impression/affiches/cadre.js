// Cadre commun des affiches (alphabet, nombres, tables, affiches du programme) : page, marges, titre,
// échelle A3 et document d'impression. Chaque famille ne fournit que son corps et sa feuille de style.
import { dimensionsPage, documentImpression, echapper } from '../../utils/impression'

// En A3, marges, titres et écarts sont agrandis dans le rapport des formats (√2 ≈ 1,41)
export const echelleA3 = format => (format === 'A3' ? 1.41 : 1)

// Mesures d'une affiche : page w × h, marge et hauteur du titre, zone W × H sous le titre.
// echelle : marge et titre agrandis en A3 (sinon les valeurs sont prises telles quelles).
export function mesuresAffiche({ format, orientation, marge = 10, hTitre = 16, echelle = true }) {
  const { w, h } = dimensionsPage(format, orientation)
  const k = echelle ? echelleA3(format) : 1
  const m = marge * k, t = hTitre * k
  return { w, h, k, marge: m, hTitre: t, W: w - 2 * m, H: h - 2 * m - t }
}

// Une page : bloc .contenu à la marge, titre facultatif (h1 de hauteur fixe), puis le corps.
// style : déclarations ajoutées au bloc (ex. « ;justify-content:center »).
export const pageAffiche = ({ marge, hTitre, titre, corps, style = '', ratioTitre = 0.62 }) =>
  `<div class="contenu" style="inset:${marge}mm${style}">${titre
    ? `<h1 style="height:${hTitre}mm;font-size:${hTitre * ratioTitre}mm">${echapper(titre)}</h1>` : ''}${corps}</div>`

// Le document complet. corps : une page sous le titre ; pages : [{ titre, corps, style }] pour plusieurs pages.
// titreDocument : titre du fichier (par défaut, celui de l'affiche).
// centrer : contenu centré horizontalement et titre centré dans sa hauteur (affiches du programme, tables).
// polices = { script } : police du texte (déjà chargée).
export function cadreAffiche({ titre, titreDocument = titre, format, orientation, marge, hTitre, corps, pages,
  css = '', polices, centrer = true, ratioTitre = 0.62 }) {
  const liste = (pages ?? [{ titre, corps }]).map(p => pageAffiche({ marge, hTitre, ratioTitre, ...p }))
  const html = documentImpression({
    titre: titreDocument, format, orientation, pages: liste,
    css: `${polices?.script ? `body { font-family: '${polices.script}', Arial, sans-serif; }\n  ` : ''}.contenu { position: absolute; display: flex; flex-direction: column; }
  h1 { font-weight: 700; text-align: center; line-height: 1; flex: none; }${centrer ? `
  .contenu { align-items: center; }
  h1 { display: flex; align-items: center; }` : ''}
  ${css}`,
  })
  return { html, nbPages: liste.length, format, orientation }
}

// Hauteur (mm) d'un contenu d'affiche rendu dans sa police, hors écran : quand une estimation ne suffit pas (polices
// attachées, OpenDyslexic…). Shadow DOM : les styles de la page n'interviennent pas, seulement la remise à zéro du
// document imprimé (documentImpression) et `css`. Hors navigateur : null.
export function hauteurRendue(html, css, largeur, police) {
  if (typeof document === 'undefined' || !document.body?.attachShadow) return null
  const hote = document.createElement('div')
  hote.style.cssText = 'position:absolute;left:-100000px;top:0;visibility:hidden'
  const racine = hote.attachShadow({ mode: 'open' })
  racine.innerHTML = `<style>* { box-sizing: border-box; margin: 0; padding: 0; }
    .boite { width: ${largeur}mm; font: 16px/normal '${police}', Arial, sans-serif; color: #222; } ${css}</style><div class="boite">${html}</div>`
  document.body.appendChild(hote)
  const h = racine.querySelector('.boite').getBoundingClientRect().height * 25.4 / 96
  hote.remove()
  return h
}

// ── Petits outils de dessin partagés ─────────────────────────────────────────
export const COULEURS = ['#1d4e9e', '#d9480f', '#2b8a3e', '#862e9c', '#c2255c', '#0b7285']
// 1 000 avec l'espace des milliers
export const cm = n => (n >= 1000 ? n.toLocaleString('fr-FR') : String(n))
// texte SVG centré (ou ancré) en (x, y)
export const txt = (x, y, s, taille, o = {}) => `<text x="${x}" y="${y}" font-size="${taille}" text-anchor="${o.ancre ?? 'middle'}" `
  + `dominant-baseline="${o.base ?? 'central'}" ${o.gras ? 'font-weight="700"' : ''} fill="${o.couleur ?? '#222'}"${o.rot ? ` transform="rotate(${o.rot} ${x} ${y})"` : ''}>${echapper(s)}</text>`
