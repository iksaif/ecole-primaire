// Affiche du tableau de numération (contenu des variantes : NUMERATION dans affiches/catalogue.js)
import { echapper } from '../../utils/impression'
import { enLettresFr } from '../../utils/nombres.js'
import { COULEURS, cm } from './cadre.js'
import { NUMERATION } from './catalogue.js'

const DECIMALES = ['dixièmes', 'centièmes', 'millièmes']
const VAL_DEC = ['0,1', '0,01', '0,001']

export const titre = () => 'Le tableau de numération'

export function dessin(cfg, W, H) {
  const def = NUMERATION[cfg.variante] ?? NUMERATION.cm1
  const colEntieres = def.classes.flatMap(c => c.rangs)
  // colonnes après la virgule : dixièmes, centièmes (CM1), millièmes (CM2)
  const decimales = DECIMALES.slice(0, def.decimales), valDec = VAL_DEC.slice(0, def.decimales)
  const avecDec = decimales.length > 0
  const nbCol = colEntieres.length + (avecDec ? 1 + decimales.length : 0)
  const wCol = Math.min(40, W / (nbCol + 0.2))
  const hLigne = Math.min(28, H / 9)
  // taille limitée aussi par la hauteur (peu de colonnes en paysage → sinon le tableau sort de la page) :
  // en-têtes ≈ 1,2 em, chaque exemple ≈ 4,4 em + 4 mm (chiffres + lecture), note ≈ 0,9 em + 5 mm
  const nEx = def.exemples.length
  const fsHauteur = (H * 0.92 - hLigne * 0.7 - 4 - nEx * 4 - 5) / (1.2 + nEx * 4.4 + 0.9)
  const fs = Math.min(wCol * 0.4, 16, fsHauteur)
  const couleurRang = i => COULEURS[Math.floor(i / 3) % COULEURS.length]
  // une ligne de cellules : chiffres alignés à droite des colonnes entières ; la virgule dans sa colonne
  const ligneNombre = nombre => {
    const [ent, dec = ''] = nombre.split(',')
    const chiffres = ent.padStart(colEntieres.length, ' ').split('')
    const cases = chiffres.map((c, i) => `<td style="color:${couleurRang(i)}">${c.trim()}</td>`)
    if (avecDec) {
      cases.push(`<td class="virg">${dec ? ',' : ''}</td>`)
      decimales.forEach((_, i) => cases.push(`<td style="color:${COULEURS[(i + 3) % COULEURS.length]}">${dec[i] ?? ''}</td>`))
    }
    return cases.join('')
  }
  const entete1 = def.classes.map(c => `<th colspan="${c.rangs.length}" class="classe">${echapper(c.nom)}</th>`).join('')
    + (avecDec ? `<th colspan="${1 + decimales.length}" class="classe dec">partie décimale</th>` : '')
  const entete2 = colEntieres.map((r, i) => `<th style="background:${couleurRang(i)}">${r}</th>`).join('')
    + (avecDec ? `<th class="virg"></th>${decimales.map((d, i) => `<th style="background:${COULEURS[(i + 3) % COULEURS.length]}">${d}</th>`).join('')}` : '')
  const valeurs = def.valeurs.map((v, i) => `<td style="color:${couleurRang(i)}">${v}</td>`).join('')
    + (avecDec ? `<td class="virg"></td>${valDec.map(v => `<td>${v}</td>`).join('')}` : '')
  const lecture = nb => {
    const [ent, dec] = nb.split(',')
    if (dec) return `${cm(+ent)} unités et ${+dec} ${DECIMALES[dec.length - 1]}`
    const n = +ent
    if (n <= 999999) return `${cm(n)} se lit « ${enLettresFr(n)} »`
    return `${cm(n)} = ${cm(Math.floor(n / 1e6))} millions + ${cm(Math.floor(n / 1000) % 1000)} milliers + ${cm(n % 1000)} unités`
  }
  const lignesEx = def.exemples.map(([nb]) => `<tr class="ex">${ligneNombre(nb)}</tr><tr class="lect"><td colspan="${nbCol}">${echapper(lecture(nb))}</td></tr>`).join('')
  const html = `<table class="num" style="font-size:${fs}mm;width:${wCol * nbCol}mm">
    <tr>${entete1}</tr><tr class="rangs">${entete2}</tr>
    <tr class="val" style="height:${hLigne * 0.7}mm">${valeurs}</tr>
    ${lignesEx}
  </table>
  <p class="note" style="font-size:${fs * 0.7}mm">${echapper(def.note)}</p>`
  return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1">${html}</div>`
}

export const css = `
  table.num { border-collapse: collapse; table-layout: fixed; }
  table.num th, table.num td { border: 0.4mm solid #9aa4b2; text-align: center; padding: 1mm 0; }
  table.num th { color: white; font-weight: 700; font-size: 0.45em; line-height: 1.1; }
  table.num th.classe { background: #f1f3f5; color: #222; border-bottom: 0.4mm solid #222; font-size: 0.6em; }
  table.num th.classe.dec { background: #fff3cd; }
  table.num tr.val td { font-size: 0.42em; color: #555; background: #fafafa; }
  table.num tr.ex td { font-size: 1.6em; font-weight: 700; height: 2.2em; }
  table.num td.virg, table.num th.virg { width: 0.5em; border-left: none; border-right: none; background: transparent; color: #d9480f; }
  table.num tr.lect td { font-size: 0.7em; border: none; color: #555; padding: 1mm 0 3mm; }
  .note { margin-top: 5mm; color: #555; text-align: center; }`
