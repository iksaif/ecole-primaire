// Affiches des tables d'addition et de multiplication (mode « affiche » de /imprimer/calcul) :
// toutes les tables sur une page, une table par page, ou le tableau à double entrée (Pythagore).
import { echapper } from '../../utils/impression'
import { contenu } from '../../i18n/index.js'
import contenuFr from '../../i18n/fr/contenu/calcul.js'
import contenuBr from '../../i18n/br/contenu/calcul.js'
import { cadreAffiche, mesuresAffiche } from './cadre.js'

const COULEURS = ['#e74c3c', '#e67e22', '#d4a00f', '#2ecc71', '#1abc9c', '#3498db', '#9b59b6', '#e84393', '#795548', '#607d8b']
const plage = (de, a) => Array.from({ length: a - de + 1 }, (_, k) => de + k)

// cfg : config normalisée de calcul.js (affiche, disposition, tablesAffiche, format, orientation, langue, titre)
export function genererTables(cfg, polices) {
  const mult = cfg.affiche !== 'addition'
  const op = mult ? '×' : '+'
  const f = (a, b) => mult ? a * b : a + b
  const tables = [...cfg.tablesAffiche].sort((a, b) => a - b)
  const T = contenu({ fr: contenuFr, br: contenuBr }, cfg.langue)
  const titre = cfg.titre || T.t(mult ? 'afficheMult' : 'afficheAdd')
  const { h, k: echelle, marge, hTitre, W: wD, H: hD } = mesuresAffiche({ format: cfg.format, orientation: cfg.orientation, marge: 12, hTitre: 14 })
  const couleur = t => COULEURS[(t - 1) % COULEURS.length]

  // une ligne de table : 7 × 3 = 21 (colonnes alignées)
  const ligne = (t, k, fs) => `<div class="tl" style="font-size:${fs}mm"><span>${t}</span><span>${op}</span><span>${k}</span><span>=</span><b>${f(t, k)}</b></div>`
  const wLigne = 1.3 + 1 + 1.3 + 1 + 2.2 + 0.4
  const bloc = (t, bw, bh) => {
    const fs = Math.min((bh / 11.6) * 0.72, (bw - 4) / wLigne)
    return `<div class="bloc" style="width:${bw}mm;height:${bh}mm;border-color:${couleur(t)}">
      <div class="bt" style="background:${couleur(t)};font-size:${fs * 1.05}mm;height:${bh / 11.6 * 1.4}mm">${echapper(T.t('tableAffiche', { t }))}</div>
      <div class="bl">${plage(1, 10).map(k => ligne(t, k, fs)).join('')}</div></div>`
  }

  let pages
  if (cfg.disposition === 'une') {
    // une table par page, sans titre : le bloc occupe toute la page
    pages = tables.map(t => ({ corps: bloc(t, wD, h - 2 * marge) }))
  } else if (cfg.disposition === 'grille') {
    // tableau à double entrée
    const de = mult ? 1 : 0
    const nums = plage(de, 10)
    const n = nums.length + 1
    const cote = Math.min(wD / n, hD / n)
    const fs = cote * 0.42
    const cell = (contenu, cls, style = '') => `<div class="gc ${cls}" style="width:${cote}mm;height:${cote}mm;${style}">${contenu}</div>`
    let g = cell(op, 'coin')
    nums.forEach(b => { g += cell(b, 'tete', `background:${couleur(b || 10)}`) })
    nums.forEach(a => {
      g += cell(a, 'tete', `background:${couleur(a || 10)}`)
      nums.forEach(b => { g += cell(f(a, b), a === b ? 'diag' : (a + b) % 2 ? '' : 'pair') })
    })
    pages = [{ titre, style: ';justify-content:center', corps: `<div class="grillep" style="grid-template-columns:repeat(${n}, ${cote}mm);font-size:${fs}mm">${g}</div>` }]
  } else {
    // toutes les tables sur une page : on choisit la grille qui donne le plus gros texte
    let best = null
    const ecart = 4 * echelle
    for (let cols = 1; cols <= tables.length; cols++) {
      const rangs = Math.ceil(tables.length / cols)
      const bw = (wD - (cols - 1) * ecart) / cols, bh = (hD - (rangs - 1) * ecart) / rangs
      const fs = Math.min((bh / 11.6) * 0.72, (bw - 4) / wLigne)
      if (!best || fs > best.fs) best = { cols, bw, bh, fs }
    }
    pages = [{ titre, corps: `<div class="blocs" style="grid-template-columns:repeat(${best.cols}, ${best.bw}mm);gap:${ecart}mm">${tables.map(t => bloc(t, best.bw, best.bh)).join('')}</div>` }]
  }

  return cadreAffiche({
    titre, format: cfg.format, orientation: cfg.orientation, marge, hTitre, pages, polices, ratioTitre: 0.6,
    css: `.blocs { display: grid; }
  .bloc { border: 0.6mm solid; border-radius: 3mm; overflow: hidden; display: flex; flex-direction: column; background: white; }
  .bt { color: white; font-weight: 700; display: flex; align-items: center; justify-content: center; flex: none; }
  .bl { flex: 1; display: flex; flex-direction: column; justify-content: space-evenly; align-items: center; }
  .tl { display: grid; grid-template-columns: 1.3em 1em 1.3em 1em 2.2em; text-align: center; line-height: 1.1; }
  .tl span:first-child { text-align: right; }
  .tl b { text-align: right; color: #1d4e9e; }
  .grillep { display: grid; border: 0.5mm solid #444; }
  .gc { display: flex; align-items: center; justify-content: center; border: 0.15mm solid #b8bec7; }
  .gc.tete { color: white; font-weight: 700; }
  .gc.coin { background: #444; color: white; font-weight: 700; }
  .gc.pair { background: #f3f6fa; }
  .gc.diag { background: #fff3cd; font-weight: 700; }`,
  })
}
