// Options communes à toutes les fiches d'exercice du noyau, affichées dans le bloc « Sur la fiche » du cadre
// (CadreExercice, mode impression) ; le dernier choix est mémorisé, sous la clé `options_fiche` (la même que l'ancien
// socle : les deux mondes lisent les mêmes préférences) :
//   entete  : ligne « Prénom : ____  Date : ____ » en haut de la fiche
//   corrige : 'non' | 'page' (sur une nouvelle page) | 'dessous' (en bas, à l'envers, à découper)
//
// Une fiche n'a qu'à baliser :
//   ${ligneNomDate(langue)}                 → <p class="entete">…</p>   (documentFiche, src/impression/document.ts)
//   <section class="corrige">…</section>    → le corrigé, avec son titre
// et le cadre applique les options (appliquerOptionsFiche) avant l'aperçu et l'impression.
import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import { charger, sauvegarder } from '../utils/index.js'

export type ChoixCorrige = 'non' | 'page' | 'dessous'
export interface OptionsDeFiche { entete: boolean, corrige: ChoixCorrige }

export const OPTIONS_FICHE_DEFAUT: OptionsDeFiche = { entete: true, corrige: 'page' }
export const CHOIX_CORRIGE: readonly ChoixCorrige[] = ['non', 'page', 'dessous']

const lire = (): OptionsDeFiche => {
  const lues: OptionsDeFiche = { ...OPTIONS_FICHE_DEFAUT, ...charger<Partial<OptionsDeFiche>>('options_fiche', {}) }
  if (!CHOIX_CORRIGE.includes(lues.corrige)) lues.corrige = OPTIONS_FICHE_DEFAUT.corrige
  if (typeof lues.entete !== 'boolean') lues.entete = OPTIONS_FICHE_DEFAUT.entete
  return lues
}

const options = ref(lire())
watch(options, v => sauvegarder('options_fiche', v), { deep: true })

/**
 * Les options de fiche (partagées par toutes les pages du noyau). Relues à chaque appel : une page de l'ancien socle a
 * pu les changer entre-temps (elle garde sa propre copie, qui ne se met pas à jour en retour).
 */
export function useOptionsFiche(): Ref<OptionsDeFiche> {
  const a = lire()
  if (a.entete !== options.value.entete || a.corrige !== options.value.corrige) options.value = a
  return options
}

export const aUnCorrige = (html: string): boolean => /class="corrige"/.test(html)

/** Styles des options (en-tête, corrigé à part ou en bas) : ceux de appliquerOptionsFiche, et du build des fiches. */
export const CSS_OPTIONS_FICHE = `
.entete { font-size: .85rem; color: #666; margin-bottom: .8rem; }
section.corrige { font-size: .85rem; color: #444; }
section.corrige h2 { font-size: 1rem; margin: 0 0 .3rem; }
section.corrige.sur-page { break-before: page; page-break-before: always; }
section.corrige.dessous { transform: rotate(180deg); break-inside: avoid; page-break-inside: avoid; }
.ligne-coupe { margin: .8cm 0 .4cm; border-top: 1.5px dashed #999; position: relative; break-after: avoid; page-break-after: avoid; }
.ligne-coupe::before { content: '✂'; position: absolute; left: 0; top: -.62em; background: white; padding-right: .2em; color: #777; }
`

/** Applique les options à un document HTML complet de fiche (navigateur : utilise DOMParser). */
export function appliquerOptionsFiche(html: string, { entete = true, corrige = 'page' }: Partial<OptionsDeFiche> = {}): string {
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
  style.textContent = CSS_OPTIONS_FICHE
  // en premier : la fiche peut toujours préciser ses propres styles
  doc.head.prepend(style)
  return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML
}
