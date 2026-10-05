// @ts-check
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

// Police des fiches. Arial pour l'instant : c'est ce qu'utilisent toutes les fiches d'exercice publiées. La police
// scolaire du site (Andika, a et g simples, embarquée en woff2) est une option : l'adopter changerait toutes les
// fiches d'un coup, c'est une décision à part (plan 10).
export const POLICE_FICHE = 'Arial, sans-serif'
export const POLICE_SCOLAIRE = "'Andika', Arial, sans-serif"

/**
 * Ligne « Prénom : ____  Date : ____ » en haut de la fiche (retirée par le cadre si l'option est décochée).
 * @param {string} langue
 */
export function ligneNomDate(langue) {
  const tr = (/** @type {string} */ cle) => COMMUN[langue]?.[cle] ?? COMMUN.fr[cle]
  return `<p class="entete">${tr('prenom')} : ________________________ &nbsp; ${tr('date')} : ______________</p>`
}

/**
 * Document HTML complet d'une fiche d'exercice.
 * @param {object} o
 * @param {string} o.titre titre de la fiche (balise <title>, et h1 si `h1` est absent) ; texte brut
 * @param {string} o.langue langue du contenu (attribut lang)
 * @param {string} o.corps HTML du corps, après le h1 : ligneNomDate, exercices, section.corrige
 * @param {string} [o.css] CSS propre à la fiche (après le CSS de base, qu'il peut préciser)
 * @param {string} [o.h1] HTML du titre affiché (ex. avec un emoji) ; par défaut le titre
 * @param {string} [o.police] familles CSS du texte (POLICE_FICHE par défaut, POLICE_SCOLAIRE pour Andika)
 * @param {string} [o.cssPolices] @font-face à embarquer (cssPolices() de utils/impression, côté navigateur)
 * @param {string} [o.largeur] largeur maximale du corps
 * @param {string} [o.marge] marge verticale de la page
 * @returns {string}
 */
export function documentFiche({ titre, langue, corps, css = '', h1, police = POLICE_FICHE, cssPolices = '', largeur = '720px', marge = '1.5cm' }) {
  return `<!DOCTYPE html><html lang="${langue}"><head>
    <meta charset="UTF-8"><title>${echapper(titre)}</title>
    <style>${cssPolices ? `\n${cssPolices}` : ''}
      body { font-family: ${police}; max-width: ${largeur}; margin: ${marge} auto; color: #222; }
      h1 { font-size: 1.3rem; border-bottom: 2px solid #333; padding-bottom: .4rem; margin-bottom: .5rem; }
${css}
    </style></head><body>
    <h1>${h1 ?? echapper(titre)}</h1>
    ${corps}
  </body></html>`
}
