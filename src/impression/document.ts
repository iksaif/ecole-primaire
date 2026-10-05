// Gabarit HTML commun des fiches d'exercice (plan 10) : doctype, langue, titre, police, CSS de base, place de la
// ligne « Prénom / Date » et du corrigé. Module pur, lisible par node (le build des fiches l'appellera directement).
//
//   documentFiche({ titre, langue, css, corps })
//
// Le contrat avec le cadre (ConfigExercice → appliquerOptionsFiche) ne change pas : le corps contient
// `${ligneNomDate(langue)}` (→ <p class="entete">) et `<section class="corrige"><h2>…</h2>…</section>` ; le cadre
// retire ou déplace ces deux parties selon les options de l'utilisateur.
import { COMMUN } from '../i18n/commun.js'
import { echapper } from '../utils/html.js'

// Police des fiches : celle choisie dans « Sur la fiche » (ChoixPolice, usePoliceFiche), Andika par défaut (police
// scolaire du site, a et g simples, embarquée en woff2). L'appelant fournit les @font-face (`cssPolices`, côté
// navigateur) ; sans eux (node), Arial prend le relais. POLICE_FICHE : l'ancienne police des fiches, pour comparer.
export const POLICE_FICHE = 'Arial, sans-serif'
export const POLICE_SCOLAIRE = "'Andika', Arial, sans-serif"

/** Ligne « Prénom : ____  Date : ____ » en haut de la fiche (retirée par le cadre si l'option est décochée). */
export function ligneNomDate(langue: string): string {
  const catalogues: Record<string, Record<string, unknown> | undefined> = COMMUN
  const tr = (cle: string) => catalogues[langue]?.[cle] ?? catalogues.fr?.[cle]
  return `<p class="entete">${tr('prenom')} : ________________________ &nbsp; ${tr('date')} : ______________</p>`
}

/** Options de `documentFiche`. */
export interface OptionsDocumentFiche {
  /** titre de la fiche (balise <title>, et h1 si `h1` est absent) ; texte brut */
  titre: string
  /** langue du contenu (attribut lang) */
  langue: string
  /** HTML du corps, après le h1 : ligneNomDate, exercices, section.corrige */
  corps: string
  /** CSS propre à la fiche (après le CSS de base, qu'il peut préciser) */
  css?: string
  /** HTML du titre affiché (ex. avec un emoji) ; par défaut le titre ; null : aucun (le corps a les siens, une fiche en plusieurs pages) */
  h1?: string | null
  /** familles CSS du texte (POLICE_SCOLAIRE par défaut : Andika, puis Arial) */
  police?: string
  /** @font-face à embarquer (usePoliceFiche() côté navigateur) */
  cssPolices?: string
  /** largeur maximale du corps */
  largeur?: string
  /** marge verticale de la page */
  marge?: string
}

/** Document HTML complet d'une fiche d'exercice. */
export function documentFiche({ titre, langue, corps, css = '', h1, police = POLICE_SCOLAIRE, cssPolices = '', largeur = '720px', marge = '1.5cm' }: OptionsDocumentFiche): string {
  return `<!DOCTYPE html><html lang="${langue}"><head>
    <meta charset="UTF-8"><title>${echapper(titre)}</title>
    <style>${cssPolices ? `\n${cssPolices}` : ''}
      body { font-family: ${police}; max-width: ${largeur}; margin: ${marge} auto; color: #222; }
      h1 { font-size: 1.3rem; border-bottom: 2px solid #333; padding-bottom: .4rem; margin-bottom: .5rem; }
${css}
    </style></head><body>
    ${h1 === null ? '' : `<h1>${h1 ?? echapper(titre)}</h1>`}
    ${corps}
  </body></html>`
}
