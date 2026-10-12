// Les supports imprimables des ceintures : livret, ceintures à découper, diplôme, passeport. Purs (des chaînes HTML) : lus par la fiche de l'activité
// (src/exercices/ceintures/fiche.ts), par le build des PDF et par les tests. La couleur ou le motif vient de la palette choisie (reglages.ts) ; le nom de la
// couleur est toujours écrit (la couleur ne porte jamais seule l'information). Maquettes : brouillons/ceintures/maquettes-impression.html.
import { echapper as e } from '../utils/html.js'
import { ceintureSvg } from './dessin.ts'
import { couleursDe } from './palettes.ts'
import type { CouleurCeinture, ReglagesCeintures } from './types.ts'

/** Ce qu'un support écrit : les mots de la feuille, dans la langue du contenu. */
export interface Libelles {
  prenom: string
  classe: string
  date: string
  signature: string
  /** « Mon livret de ceintures » */
  livret: string
  /** « Diplôme » */
  diplome: string
  /** « Passeport » */
  passeport: string
  /** « décerné à » */
  decerne: string
  /** une phrase d'encouragement, sous le livret */
  commentFaire: string
}

/** Une ceinture à imprimer : sa couleur, son nom écrit (« Ceinture verte ») et ses objectifs. */
export interface CeintureAImprimer {
  couleur: CouleurCeinture
  nom: string
  objectifs: string[]
}

export interface DonneesSupport {
  /** le titre de la piste (« Tables de multiplication ») */
  titre: string
  ceintures: CeintureAImprimer[]
  reglages: ReglagesCeintures
  libelles: Libelles
  /** le prénom écrit d'avance (vide : une ligne à remplir) */
  prenom?: string
}

/** Les ceintures d'une piste : les `nom`, objectifs et couleurs de la palette, au plus `nbCeintures` du réglage. */
export function ceinturesDe(objectifs: readonly string[], noms: (couleur: CouleurCeinture) => string, reglages: ReglagesCeintures): CeintureAImprimer[] {
  const nb = Math.min(objectifs.length, reglages.nbCeintures)
  return couleursDe(reglages.palette, nb).slice(0, nb).map((couleur, i) => ({ couleur, nom: noms(couleur), objectifs: [objectifs[i]] }))
}

const dessin = (c: CeintureAImprimer, d: DonneesSupport, largeur: string): string => ceintureSvg({ couleur: c.couleur, style: d.reglages.style, noirEtBlanc: d.reglages.noirEtBlanc, largeur })
const ligne = (texte: string, valeur?: string): string => `<span class="rempli">${e(texte)} : ${valeur ? e(valeur) : '<i class="blanc"></i>'}</span>`

export const CSS_CEINTURES = `
      .case { display: inline-block; width: 4.5mm; height: 4.5mm; border: .5mm solid #222; border-radius: 1mm; vertical-align: -1mm; margin-right: 1.5mm; }
      .rempli { display: inline-flex; gap: 2mm; align-items: flex-end; white-space: nowrap; }
      .blanc { display: inline-block; min-width: 38mm; border-bottom: .3mm solid #222; }
      .piste-titre { font-size: 1.05rem; margin: 0 0 .4rem; }
      table.livret { width: 100%; border-collapse: collapse; margin-top: 4mm; }
      table.livret td { border-top: .3mm solid #999; padding: 3mm 2mm; vertical-align: middle; }
      table.livret tr:first-child td { border-top: 0; }
      table.livret td.ceinture { width: 28mm; }
      .nom-ceinture { font-weight: 700; font-size: 1.05rem; }
      .objectif { font-size: .95rem; color: #333; }
      .encadre { border: .5mm solid #222; border-radius: 2mm; padding: 3mm 4mm; margin-top: 6mm; font-size: .95rem; }
      .bandes { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm 8mm; margin-top: 5mm; }
      .bande { border: .35mm dashed #444; padding: 2.5mm 3mm; display: flex; align-items: center; gap: 3mm; font-size: .9rem; break-inside: avoid; }
      .bande .lignes { display: grid; gap: 1.5mm; }
      .bande .blanc { min-width: 24mm; }
      .diplome { border: 1.4mm double #222; padding: 10mm; text-align: center; min-height: 190mm; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 6mm; }
      .diplome .mot { font-size: 1.1rem; letter-spacing: .25em; text-transform: uppercase; }
      .diplome .gros { font-size: 2rem; font-weight: 800; }
      .passeports { display: grid; grid-template-columns: 86mm 86mm; gap: 4mm; justify-content: center; margin-top: 4mm; }
      .passeport { border: .4mm solid #222; border-radius: 3mm; padding: 2.5mm 3.5mm; font-size: .8rem; break-inside: avoid; height: 54mm; overflow: hidden; }
      .passeport .rangee { display: flex; align-items: center; gap: 1.5mm; margin-top: 1.4mm; }
      .passeport .titre { font-weight: 700; margin-bottom: 1mm; }`

/** Le livret : une ligne par ceinture (couleur, nom, objectifs à cocher, date et signature). */
export function livretHtml(d: DonneesSupport): string {
  const lignes = d.ceintures.map(c => `<tr>
      <td class="ceinture">${dessin(c, d, '24mm')}</td>
      <td><div class="nom-ceinture">${e(c.nom)}</div>${c.objectifs.map(o => `<div class="objectif"><span class="case"></span>${e(o)}</div>`).join('')}</td>
      <td class="objectif">${e(d.libelles.date)} : ________<br>${e(d.libelles.signature)} :</td>
    </tr>`).join('')
  return `<p class="piste-titre">${e(d.titre)}</p>
    <p class="entete">${ligne(d.libelles.prenom, d.prenom)} &nbsp; ${ligne(d.libelles.classe)}</p>
    <table class="livret"><tbody>${lignes}</tbody></table>
    <p class="encadre">${e(d.libelles.commentFaire)}</p>`
}

/** Les ceintures à découper et à coller : chaque ceinture `copies` fois, avec le prénom et la date à écrire. */
export function bandesHtml(d: DonneesSupport, copies: number): string {
  const bandes = d.ceintures.flatMap(c => Array.from({ length: copies }, () => `<div class="bande">${dessin(c, d, '36mm')}
      <div class="lignes"><b>${e(c.nom)}</b>${ligne(d.libelles.prenom, d.prenom)}${ligne(d.libelles.date)}</div></div>`))
  return `<p class="piste-titre">${e(d.titre)}</p><div class="bandes">${bandes.join('')}</div>`
}

/** Le diplôme d'une ceinture (`indice` : 0 pour la première) : une page, à emporter. */
export function diplomeHtml(d: DonneesSupport, indice: number): string {
  const c = d.ceintures[Math.min(Math.max(indice, 0), d.ceintures.length - 1)]
  return `<div class="diplome"><div class="mot">${e(d.libelles.diplome)}</div>
      <div class="gros">${e(c.nom)}</div>${dessin(c, d, '90mm')}
      <div>${e(d.titre)}</div>
      <div>${e(d.libelles.decerne)} ${d.prenom ? `<b>${e(d.prenom)}</b>` : '<i class="blanc" style="min-width:90mm"></i>'}</div>
      <div>${ligne(d.libelles.date)} &nbsp; ${ligne(d.libelles.signature)}</div></div>`
}

/** Le passeport : huit cartes (format carte bancaire, 2 × 4 par feuille) avec toutes les ceintures de la piste, chacune à cocher. */
export function passeportHtml(d: DonneesSupport): string {
  const carte = `<div class="passeport"><div class="titre">${e(d.libelles.passeport)} — ${e(d.titre)}</div>
      ${ligne(d.libelles.prenom, d.prenom)}
      ${d.ceintures.map(c => `<div class="rangee"><span class="case"></span>${dessin(c, d, '12mm')}<span>${e(c.nom)}</span></div>`).join('')}</div>`
  return `<div class="passeports">${Array.from({ length: 8 }, () => carte).join('')}</div>`
}
