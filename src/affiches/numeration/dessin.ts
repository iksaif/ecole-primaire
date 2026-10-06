// Le dessin de l'affiche du tableau de numération : pur. Un tableau (classes, rangs, valeurs, deux exemples lus à voix haute) par
// langue de la feuille. La taille du texte est celle que la page permet en hauteur ET que les libellés permettent en largeur,
// MESURÉE dans la police choisie (contexte.mesure) : une police attachée, plus large et plus haute, réduit simplement le tableau.
import { echapper } from '../../utils/html.js'
import { COULEURS, cm } from '../../impression/affiches/cadre.ts'
import { donneesRegionales } from '../../langues/registre.ts'
import type { Langue } from '../../langues/registre.ts'
import { enLettresFr } from '../../langues/fr/nombres.ts'
import type { Traducteur } from '../../noyau/types.ts'
import type { Rendu } from '../types.ts'
import type { Reglages } from './definition.ts'

const RANGS = ['centaines', 'dizaines', 'unites'] as const
const DECIMALES = ['dixiemes', 'centiemes', 'milliemes'] as const
const VALEURS_DECIMALES = ['0,1', '0,01', '0,001']
const CLASSES = ['unitesSimples', 'milliers', 'millions'] as const
/** Les exemples à lire et les valeurs des rangs, par nombre de classes (0 : le CE1, jusqu'à mille). */
const EXEMPLES: Readonly<Record<number, readonly string[]>> = { 0: ['207', '1000'], 2: ['407305', '52,36'], 3: ['125407038', '3406,275'] }
const VALEURS: Readonly<Record<number, readonly string[]>> = {
  0: ['1 000', '100', '10', '1'],
  2: ['100 000', '10 000', '1 000', '100', '10', '1'],
  3: ['100 000 000', '10 000 000', '1 000 000', '100 000', '10 000', '1 000', '100', '10', '1'],
}

const enLettres = (langue: string, n: number): string => donneesRegionales(langue as Langue)?.enLettres(n) ?? enLettresFr(n)

/** Ce que lit le tableau pour un nombre : « 207 se lit « deux-cent-sept » », « 52 unités et 36 centièmes », ou la décomposition en classes. */
function lecture(nb: string, langue: string, T: Traducteur): string {
  const [ent, dec] = nb.split(',')
  if (dec) return T('lecture.decimal', { n: cm(+ent), d: +dec, nom: T(`rang.${DECIMALES[dec.length - 1]}`) })
  const n = +ent
  if (n <= 999999) return T('lecture.entier', { nb: cm(n), lettres: enLettres(langue, n) })
  return T('lecture.grand', { nb: cm(n), m: cm(Math.floor(n / 1e6)), k: cm(Math.floor(n / 1000) % 1000), u: cm(n % 1000) })
}

export const dessin: Rendu<Reglages>['dessin'] = (r, { W, H }, _T, ctx) => {
  const { mesure } = ctx
  const nom = ctx.nomPolice()
  const m = mesure.metriques(nom)
  // interligne relatif de la police : 1 pour une script (hampes + jambages ≈ 1 em), jusqu'à 2,3 pour une attachée
  const il = Math.max(1, (m.hampe + m.jambage) / 1.05)
  const nbClasses = r.nbClasses as number, nbDec = r.decimales as number
  return (r.langues as readonly string[]).map(langue => {
    const T = ctx.Tde(langue)
    // les classes, de la plus grande à la plus petite : mille seul (CE1), ou milliers + unités simples, ou millions + milliers + unités simples
    const classes = nbClasses === 0
      ? [{ nom: T('classe.mille'), rangs: [T('rang.mille')] }, { nom: T('classe.unitesSimples'), rangs: RANGS.map(k => T(`rang.${k}`)) }]
      : CLASSES.slice(0, nbClasses).reverse().map(c => ({ nom: T(`classe.${c}`), rangs: RANGS.map(k => T(`rang.${k}`)) }))
    const colEntieres = classes.flatMap(c => c.rangs)
    const decimales = DECIMALES.slice(0, nbDec).map(k => T(`rang.${k}`)), valDec = VALEURS_DECIMALES.slice(0, nbDec)
    const avecDec = decimales.length > 0
    const nbCol = colEntieres.length + (avecDec ? 1 + decimales.length : 0)
    const wCol = Math.min(40, W / (nbCol + 0.2))
    const hLigne = Math.min(28, H / 9)
    const exemples = EXEMPLES[nbClasses], valeurs = VALEURS[nbClasses]
    const nEx = exemples.length
    // hauteur : en-têtes ≈ 1,2 em, chaque exemple ≈ 4,4 em + 4 mm (chiffres + lecture), note ≈ 0,9 em + 5 mm
    const fsHauteur = (H * 0.9 - hLigne * 0.7 - 4 - nEx * 4 - 5) / (1.2 * il + nEx * (3.5 + 0.9 * il) + 0.9 * il)
    // largeur : chaque libellé tient dans sa colonne (rangs, valeurs) ou dans sa classe (marge de 8 %)
    const tient = (textes: readonly string[], em: number, place: number, gras = false): number => Math.min(...textes.map(t => place / (em * mesure.largeur(t, nom, gras) * 1.08)))
    const fsLargeur = Math.min(
      tient([...colEntieres, ...decimales], 0.45, wCol * 0.92, true),
      tient([...valeurs, ...valDec], 0.42, wCol * 0.92),
      ...classes.map(c => tient([c.nom], 0.6, c.rangs.length * wCol * 0.95, true)),
      avecDec ? tient([T('classe.decimale')], 0.6, decimales.length * wCol * 0.95, true) : Infinity,
    )
    // les lignes de lecture passent sur toute la largeur du tableau
    const note = T(`note.${nbClasses}`)
    const lectures = exemples.map(nb => lecture(nb, langue, T))
    const fsTexte = Math.min(...[note, ...lectures].map(t => (wCol * nbCol) / (mesure.largeur(t, nom) * 1.08 * 0.7)))
    const fs = Math.min(wCol * 0.4, 16, fsHauteur, fsLargeur, fsTexte)
    const couleurRang = (i: number): string => COULEURS[Math.floor(i / 3) % COULEURS.length]
    // une ligne de cellules : chiffres alignés à droite des colonnes entières ; la virgule dans sa colonne
    const ligneNombre = (nombre: string): string => {
      const [ent, dec = ''] = nombre.split(',')
      const cases = ent.padStart(colEntieres.length, ' ').split('').map((c, i) => `<td style="color:${couleurRang(i)}">${c.trim()}</td>`)
      if (avecDec) {
        cases.push(`<td class="virg">${dec ? ',' : ''}</td>`)
        decimales.forEach((_, i) => cases.push(`<td style="color:${COULEURS[(i + 3) % COULEURS.length]}">${dec[i] ?? ''}</td>`))
      }
      return cases.join('')
    }
    const entete1 = classes.map(c => `<th colspan="${c.rangs.length}" class="classe">${echapper(c.nom)}</th>`).join('')
      + (avecDec ? `<th colspan="${1 + decimales.length}" class="classe dec">${echapper(T('classe.decimale'))}</th>` : '')
    const entete2 = colEntieres.map((rang, i) => `<th style="background:${couleurRang(i)}">${echapper(rang)}</th>`).join('')
      + (avecDec ? `<th class="virg"></th>${decimales.map((d, i) => `<th style="background:${COULEURS[(i + 3) % COULEURS.length]}">${echapper(d)}</th>`).join('')}` : '')
    const ligneValeurs = valeurs.map((v, i) => `<td style="color:${couleurRang(i)}">${v}</td>`).join('')
      + (avecDec ? `<td class="virg"></td>${valDec.map(v => `<td>${v}</td>`).join('')}` : '')
    const lignesEx = exemples.map((nb, i) => `<tr class="ex">${ligneNombre(nb)}</tr><tr class="lect"><td colspan="${nbCol}">${echapper(lectures[i])}</td></tr>`).join('')
    const interligne = il > 1 ? `;line-height:${(1.15 * il).toFixed(2)};--il:${il.toFixed(2)}` : ''
    const corps = `<div class="boite"><table class="num" style="font-size:${fs}mm;width:${wCol * nbCol}mm${interligne}">
    <tr>${entete1}</tr><tr class="rangs">${entete2}</tr>
    <tr class="val" style="height:${hLigne * 0.7}mm">${ligneValeurs}</tr>
    ${lignesEx}
  </table>
  <p class="note" style="font-size:${fs * 0.7}mm${il > 1 ? `;line-height:${(1.15 * il).toFixed(2)}` : ''}">${echapper(note)}</p></div>`
    return { titre: T('titre'), corps }
  })
}

export const css = `.boite { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; }
  table.num { border-collapse: collapse; table-layout: fixed; }
  table.num th, table.num td { border: 0.4mm solid #9aa4b2; text-align: center; padding: 1mm 0; }
  table.num th { color: white; font-weight: 700; font-size: 0.45em; line-height: calc(1.1 * var(--il, 1)); white-space: nowrap; }
  table.num tr.val td { white-space: nowrap; }
  table.num th.classe { background: #f1f3f5; color: #222; border-bottom: 0.4mm solid #222; font-size: 0.6em;
    padding-bottom: calc(1mm + (var(--il, 1) - 1) * 0.35em); }
  table.num th.classe.dec { background: #fff3cd; }
  table.num tr.val td { font-size: 0.42em; color: #555; background: #fafafa; }
  table.num tr.ex td { font-size: 1.6em; font-weight: 700; height: 2.2em; }
  table.num td.virg, table.num th.virg { width: 0.5em; border-left: none; border-right: none; background: transparent; color: #d9480f; }
  table.num tr.lect td { font-size: 0.7em; border: none; color: #555; padding: 1mm 0 3mm; }
  .note { margin-top: 5mm; color: #555; text-align: center; }`
