// « Par domaine » : une table compétence × classe par domaine du programme, chaque case disant ce qui la couvre.
// Une case = (compétence, classe où elle est travaillée) ; vert : au moins deux sortes de ressources, jaune : une, rouge : rien,
// gris : la compétence n'est pas au programme de cette classe.
import { echapper } from '../../../src/utils/html.js'
import type { Couverture, Programme, Sorte } from './modeles.ts'

const SORTES: Record<Sorte, string> = { exercice: '🎯', fiche: '📄', affiche: '📘' }
const LISTE_SORTES = Object.keys(SORTES) as Sorte[]

export interface SectionsDomaines {
  /** le HTML des tables */
  html: string
  /** une ligne de résumé par domaine, pour le terminal */
  terminal: string[]
}

export function sectionsDomaines({ COMPETENCES, DOMAINES, NIVEAUX }: Programme, { ressourcesDe }: Couverture): SectionsDomaines {
  const terminal: string[] = []
  const html = DOMAINES.map(d => {
    const comps = COMPETENCES.filter(k => k.domaine === d.id)
    if (!comps.length) return ''
    let cases = 0, avecExercice = 0, avecRien = 0
    const lignes = comps.map(k => {
      const cellules = NIVEAUX.map(n => {
        if (!k.niveaux.includes(n)) return '<td class="hors"></td>'
        cases++
        const par = ressourcesDe(k.id, n)
        const sortes = LISTE_SORTES.filter(s => par[s].length)
        if (par.exercice.length) avecExercice++
        if (!sortes.length) { avecRien++; return '<td class="rien" title="rien">—</td>' }
        const titre = sortes.map(s => `${SORTES[s]} ${par[s].map(r => r.titre).join(', ')}`).join('\n')
        return `<td class="${sortes.length >= 2 ? 'bien' : 'peu'}" title="${echapper(titre)}">${sortes.map(s => SORTES[s]).join('')}</td>`
      }).join('')
      return `<tr><th title="${echapper(k.id)}">${echapper(k.libelle)}</th>${cellules}</tr>`
    }).join('\n')
    const pct = (x: number): number => (cases ? Math.round(100 * x / cases) : 0)
    terminal.push(`${d.court.padEnd(28)} ${String(cases).padStart(3)} cases · exercice ${String(pct(avecExercice)).padStart(3)} % · rien ${String(pct(avecRien)).padStart(3)} %`)
    return `<section><h2>${echapper(d.court)} <small>${cases} cases · ${pct(avecExercice)} % avec un exercice · ${avecRien} sans rien</small></h2>
<table><tr><th></th>${NIVEAUX.map(n => `<th>${n.toUpperCase()}</th>`).join('')}</tr>
${lignes}</table></section>`
  }).join('\n')
  return { html, terminal }
}
