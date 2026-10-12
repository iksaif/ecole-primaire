// Options communes à toutes les fiches d'exercice du noyau, affichées dans le bloc « Sur la fiche » du cadre
// (CadreExercice, mode impression) ; le dernier choix est mémorisé, sous la clé `options_fiche` (la même que l'ancien
// socle : les deux mondes lisent les mêmes préférences) :
//   entete  : ligne « Prénom : ____  Date : ____ » en haut de la fiche
//   corrige : 'non' | 'page' (sur une nouvelle page) | 'dessous' (en bas, à l'envers, à découper)
//   pictogrammes : pictogrammes des consignes (src/images/consignes.ts) : 'classe' (en maternelle), 'oui', 'non' ; lu par la fiche
//   mentionPictos : la ligne de crédit des pictogrammes en bas de la feuille (leur licence demande de citer l'auteur)
//
// Une fiche n'a qu'à baliser :
//   ${ligneNomDate(langue)}                 → <p class="entete">…</p>   (documentFiche, src/impression/document.ts)
//   <section class="corrige">…</section>    → le corrigé, avec son titre
// et le cadre applique les options (appliquerOptionsFiche) avant l'aperçu et l'impression.
import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import { charger, sauvegarder } from '../utils/index.js'
import { assainirPictogrammes, CSS_PICTOGRAMMES, DEFAUT_PICTOGRAMMES, MARQUE_ARASAAC } from '../images/consignes.ts'
import type { ChoixPictogrammes } from '../images/consignes.ts'

export type ChoixCorrige = 'non' | 'page' | 'dessous'
export interface OptionsDeFiche { entete: boolean, corrige: ChoixCorrige, pictogrammes: ChoixPictogrammes, mentionPictos: boolean }

export const OPTIONS_FICHE_DEFAUT: OptionsDeFiche = { entete: true, corrige: 'page', pictogrammes: DEFAUT_PICTOGRAMMES, mentionPictos: true }
export const CHOIX_CORRIGE: readonly ChoixCorrige[] = ['non', 'page', 'dessous']

const lire = (): OptionsDeFiche => {
  const lues: OptionsDeFiche = { ...OPTIONS_FICHE_DEFAUT, ...charger<Partial<OptionsDeFiche>>('options_fiche', {}) }
  if (!CHOIX_CORRIGE.includes(lues.corrige)) lues.corrige = OPTIONS_FICHE_DEFAUT.corrige
  if (typeof lues.entete !== 'boolean') lues.entete = OPTIONS_FICHE_DEFAUT.entete
  lues.pictogrammes = assainirPictogrammes(lues.pictogrammes)
  if (typeof lues.mentionPictos !== 'boolean') lues.mentionPictos = OPTIONS_FICHE_DEFAUT.mentionPictos
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
  const change = (Object.keys(a) as (keyof OptionsDeFiche)[]).some(cle => a[cle] !== options.value[cle])
  if (change) options.value = a
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

/** La ligne de crédit des pictogrammes, si la fiche en montre et si l'option la garde. */
function crediterPictogrammes(doc: Document, mention: boolean, texte: string): void {
  if (!mention || !texte) return
  if (!doc.querySelector(`[data-image="${MARQUE_ARASAAC}"]`)) return
  const ligne = doc.createElement('p')
  ligne.className = 'credit-pictos'
  ligne.textContent = texte
  // avant le corrigé (et sa ligne de coupe) : la ligne reste sur la partie de l'élève
  const suite = doc.querySelector('.ligne-coupe') ?? doc.querySelector('section.corrige')
  if (suite) suite.before(ligne)
  else doc.body.append(ligne)
}

/**
 * Applique les options à un document HTML complet de fiche (navigateur : utilise DOMParser). `mentionPictos` : le texte de la ligne
 * de crédit des pictogrammes (dans la langue de l'interface), ajoutée si la fiche en montre et que l'option `mentionPictos` la garde.
 */
export function appliquerOptionsFiche(html: string, { entete = true, corrige = 'page', mentionPictos = true }: Partial<OptionsDeFiche> = {}, texteMention = ''): string {
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
  crediterPictogrammes(doc, mentionPictos, texteMention)
  const style = doc.createElement('style')
  style.textContent = CSS_OPTIONS_FICHE + CSS_PICTOGRAMMES
  // en premier : la fiche peut toujours préciser ses propres styles
  doc.head.prepend(style)
  return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML
}
