// Le dessin des affiches des tables : une fonction pure (réglages, zone, T, contexte) → pages, sans Vue ni DOM (lisible par node).
//   - « toutes » : toutes les tables sur une page, dans la grille qui donne le plus gros texte ;
//   - « une » : une table par page, sans titre (le bloc occupe toute la page) ;
//   - « grille » : le tableau à double entrée (table de Pythagore ; tableau des additions de 0 à 10, doubles en couleur).
import { echapper } from '../../utils/html.js'
import { echelleA3 } from '../../impression/affiches/cadre.ts'
import type { Page, Rendu } from '../types.ts'
import { H_TITRE, PLAGE } from './definition.ts'
import type { Reglages } from './definition.ts'

const COULEURS = ['#e74c3c', '#e67e22', '#d4a00f', '#2ecc71', '#1abc9c', '#3498db', '#9b59b6', '#e84393', '#795548', '#607d8b']
const plage = (de: number, a: number): number[] => Array.from({ length: a - de + 1 }, (_, k) => de + k)
const couleur = (t: number): string => COULEURS[(t - 1) % COULEURS.length]
// largeur d'une ligne « 7 × 3 = 21 » en em (colonnes alignées) : les 5 colonnes de .tl et un peu d'air
const L_LIGNE = 1.3 + 1 + 1.3 + 1 + 2.2 + 0.4

export const dessin: Rendu<Reglages>['dessin'] = (r, { W, H }, T) => {
  const mult = r.operation !== 'add'
  const op = mult ? '×' : '+'
  const f = (a: number, b: number): number => (mult ? a * b : a + b)
  // `tables` n'existe que pour les variantes qui le proposent ; aucune table cochée : toutes
  const choisies: readonly number[] = r.tables?.length ? r.tables : PLAGE
  const tables = [...choisies].sort((a, b) => a - b)
  const k = echelleA3(r.format)
  const titre = r.titre || T(mult ? 'titre.multiplication' : 'titre.addition')

  // une ligne de table : 7 × 3 = 21 (colonnes alignées)
  const ligne = (t: number, n: number, fs: number): string => `<div class="tl" style="font-size:${fs}mm"><span>${t}</span><span>${op}</span><span>${n}</span><span>=</span><b>${f(t, n)}</b></div>`
  const bloc = (t: number, bw: number, bh: number): string => {
    const fs = Math.min((bh / 11.6) * 0.72, (bw - 4) / L_LIGNE)
    return `<div class="bloc" style="width:${bw}mm;height:${bh}mm;border-color:${couleur(t)}">
      <div class="bt" style="background:${couleur(t)};font-size:${fs * 1.05}mm;height:${bh / 11.6 * 1.4}mm">${echapper(T('table', { t }))}</div>
      <div class="bl">${plage(1, 10).map(n => ligne(t, n, fs)).join('')}</div></div>`
  }

  if (r.disposition === 'une') {
    // une table par page, sans titre : le bloc occupe toute la page (la zone, plus la place du titre)
    const hPage = H + H_TITRE * k
    return tables.map((t): Page => ({ corps: bloc(t, W, hPage), titre: null }))
  }

  if (r.disposition === 'grille') {
    // tableau à double entrée
    const nums = plage(mult ? 1 : 0, 10)
    const n = nums.length + 1
    const cote = Math.min(W / n, H / n)
    const fs = cote * 0.42
    const cell = (contenu: string | number, cls: string, style = ''): string => `<div class="gc ${cls}" style="width:${cote}mm;height:${cote}mm;${style}">${contenu}</div>`
    let g = cell(op, 'coin')
    nums.forEach(b => { g += cell(b, 'tete', `background:${couleur(b || 10)}`) })
    nums.forEach(a => {
      g += cell(a, 'tete', `background:${couleur(a || 10)}`)
      nums.forEach(b => { g += cell(f(a, b), a === b ? 'diag' : (a + b) % 2 ? '' : 'pair') })
    })
    return [{ titre, corps: `<div class="grillep" style="grid-template-columns:repeat(${n}, ${cote}mm);font-size:${fs}mm">${g}</div>` }]
  }

  // toutes les tables sur une page : on choisit la grille qui donne le plus gros texte
  let meilleure: { cols: number, bw: number, bh: number, fs: number } | null = null
  const ecart = 4 * k
  for (let cols = 1; cols <= tables.length; cols++) {
    const rangs = Math.ceil(tables.length / cols)
    const bw = (W - (cols - 1) * ecart) / cols, bh = (H - (rangs - 1) * ecart) / rangs
    const fs = Math.min((bh / 11.6) * 0.72, (bw - 4) / L_LIGNE)
    if (!meilleure || fs > meilleure.fs) meilleure = { cols, bw, bh, fs }
  }
  const { cols, bw, bh } = meilleure as { cols: number, bw: number, bh: number }
  return [{ titre, corps: `<div class="blocs" style="grid-template-columns:repeat(${cols}, ${bw}mm);gap:${ecart}mm">${tables.map(t => bloc(t, bw, bh)).join('')}</div>` }]
}

// CSS propre à l'affiche (ajouté après celui du cadre)
export const css = `
  .blocs { display: grid; }
  .bloc { border: 0.6mm solid; border-radius: 3mm; overflow: hidden; display: flex; flex-direction: column; background: white; }
  .bt { color: white; font-weight: 700; display: flex; align-items: center; justify-content: center; flex: none; }
  .bl { flex: 1; display: flex; flex-direction: column; justify-content: space-evenly; align-items: center; }
  .tl { display: grid; grid-template-columns: 1.3em 1em 1.3em 1em 2.2em; text-align: center; line-height: 1.1; }
  .tl span:first-child { text-align: right; }
  .tl b { text-align: right; color: #1d4e9e; }
  /* le tableau est centré dans la hauteur qui reste sous le titre */
  .grillep { display: grid; border: 0.5mm solid #444; margin: auto 0; flex: none; }
  .gc { display: flex; align-items: center; justify-content: center; border: 0.15mm solid #b8bec7; }
  .gc.tete { color: white; font-weight: 700; }
  .gc.coin { background: #444; color: white; font-weight: 700; }
  .gc.pair { background: #f3f6fa; }
  .gc.diag { background: #fff3cd; font-weight: 700; }`
