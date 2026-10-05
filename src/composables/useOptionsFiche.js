// @deprecated — remplacé par src/noyau/optionsFiche.ts, à supprimer avec le dernier exercice migré (plan 10)
import { ref, watch } from 'vue'
import { charger, sauvegarder } from '../utils'
// une seule implémentation de la ligne « Prénom / Date » : le gabarit commun des fiches (pur, lisible par node)
export { ligneNomDate } from '../impression/document.js'

// Options communes à toutes les fiches d'exercice : affichées dans le formulaire de chaque exercice
// (cadre ConfigExercice, mode impression), le dernier choix est mémorisé :
//   entete  : ligne « Prénom : ____  Date : ____ » en haut de la fiche
//   corrige : 'non' | 'page' (sur une nouvelle page) | 'dessous' (en bas, à l'envers, à découper)
//
// Une vue n'a qu'à baliser sa fiche :
//   ${ligneNomDate(langue)}                 → <p class="entete">…</p>
//   <section class="corrige">…</section>    → le corrigé, avec son titre
// et ConfigExercice applique les options (appliquerOptionsFiche) avant l'aperçu et l'impression.
export const OPTIONS_FICHE_DEFAUT = { entete: true, corrige: 'page' }
export const CHOIX_CORRIGE = ['non', 'page', 'dessous']

const lues = { ...OPTIONS_FICHE_DEFAUT, ...charger('options_fiche', {}) }
if (!CHOIX_CORRIGE.includes(lues.corrige)) lues.corrige = OPTIONS_FICHE_DEFAUT.corrige
const optionsFiche = ref(lues)
watch(optionsFiche, v => sauvegarder('options_fiche', v), { deep: true })

export function useOptionsFiche() {
  return optionsFiche
}

export const aUnCorrige = html => /class="corrige"/.test(html)

const CSS = `
.entete { font-size: .85rem; color: #666; margin-bottom: .8rem; }
section.corrige { font-size: .85rem; color: #444; }
section.corrige h2 { font-size: 1rem; margin: 0 0 .3rem; }
section.corrige.sur-page { break-before: page; page-break-before: always; }
section.corrige.dessous { transform: rotate(180deg); break-inside: avoid; page-break-inside: avoid; }
.ligne-coupe { margin: .8cm 0 .4cm; border-top: 1.5px dashed #999; position: relative; break-after: avoid; page-break-after: avoid; }
.ligne-coupe::before { content: '✂'; position: absolute; left: 0; top: -.62em; background: white; padding-right: .2em; color: #777; }
`

// Applique les options à un document HTML complet de fiche
export function appliquerOptionsFiche(html, { entete = true, corrige = 'page' } = {}) {
  if (!html) return html
  const doc = new DOMParser().parseFromString(html, 'text/html')
  if (!entete) doc.querySelectorAll('.entete').forEach(e => e.remove())
  doc.querySelectorAll('section.corrige').forEach(s => {
    if (corrige === 'non') return s.remove()
    if (corrige === 'dessous') {
      s.classList.add('dessous')
      const coupe = doc.createElement('div')
      coupe.className = 'ligne-coupe'
      s.before(coupe)
    } else s.classList.add('sur-page')
  })
  const style = doc.createElement('style')
  style.textContent = CSS
  // en premier : la vue peut toujours préciser ses propres styles
  doc.head.prepend(style)
  return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML
}
