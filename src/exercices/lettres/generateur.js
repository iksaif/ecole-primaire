// Les lettres — générateur (pur : aucun import de Vue, aucun Math.random ; lisible par node).
//   questions({ niveau, reglages, rng, T, nb? })     une partie : 15 lettres (nb) à reconnaître, ou à associer majuscule / minuscule
//   questionsFiche({ niveau, reglages, rng, T })      les blocs de la fiche « relier majuscule et minuscule »
//   verifier(q, rep)                                  rep : { choix } (indice de la proposition)
//   ecartsAuProgramme(x, contraintes)                 lettres hors de l'alphabet de la langue ; au plus l'alphabet à partir de la GS
// L'alphabet est celui de la langue du contenu (T('alphabet'), catalogue src/i18n/<langue>/contenu/lettres.js), sans test
// de langue ici. L'ordre des tirages est celui de l'ancienne vue : même flux de hasard, mêmes fiches.
import DEFINITION from './definition.js'

export const NB_QUESTIONS = 15   // lettres d'une partie
export const PAR_BLOC = 6        // lettres d'un bloc de la fiche

const niveauConnu = niveau => (DEFINITION.niveaux[niveau] ? niveau : DEFINITION.niveauDefaut)

// Lettres du groupe choisi, dans l'ordre de l'alphabet de la langue
export function lettresDe(T, groupe) {
  const alphabet = T('alphabet'), voyelles = T('voyelles')
  if (groupe === 'voyelles') return alphabet.filter(l => voyelles.includes(l))
  if (groupe === 'consonnes') return alphabet.filter(l => !voyelles.includes(l))
  return alphabet
}

const fausses = (rng, pool, exclure, n) => rng.melanger(pool.filter(l => l !== exclure)).slice(0, n)

// Une question : `options` { label } (4 propositions), `bonne` : indice de la bonne ; `affiche` : ce qu'on montre
function question(rng, mode, pool, lettre) {
  if (mode === 'reconnaitre') {
    // montre la minuscule, choisit la majuscule (ou l'inverse)
    const afficheMaj = rng.vrai(0.5)
    const affiche = afficheMaj ? lettre : lettre.toLowerCase()
    const choix = rng.melanger([lettre, ...fausses(rng, pool, lettre, 3)])
    return { cle: `reconnaitre-${lettre}`, mode, lettre, affiche, options: choix.map(label => ({ label })), bonne: choix.indexOf(lettre), attendu: lettre }
  }
  // montre majuscule → trouver minuscule, ou inverse
  const versMin = rng.vrai(0.5)
  const affiche = versMin ? lettre : lettre.toLowerCase()
  const attendu = versMin ? lettre.toLowerCase() : lettre
  const pool2 = versMin ? pool.map(l => l.toLowerCase()) : pool
  const choix = rng.melanger([attendu, ...fausses(rng, pool2, attendu, 3)])
  return { cle: `majuscule-${lettre}`, mode, lettre, affiche, options: choix.map(label => ({ label })), bonne: choix.indexOf(attendu), attendu, question: versMin ? 'quelleMinuscule' : 'quelleMajuscule' }
}

/** Une partie : `nb` lettres (15) du groupe, mélangées. */
export function questions({ niveau, reglages, rng, T, nb }) {
  niveauConnu(niveau)
  const pool = lettresDe(T, reglages.groupe)
  const mode = reglages.mode === 'majuscule' ? 'majuscule' : 'reconnaitre'
  return rng.melanger([...pool]).slice(0, nb ?? NB_QUESTIONS).map(lettre => question(rng, mode, pool, lettre))
}

/** La fiche : les lettres du groupe en blocs de 6 (répartition équilibrée : 26 lettres → 6 + 5 + 5 + 5 + 5), majuscules à gauche, minuscules mélangées à droite. */
export function questionsFiche({ niveau, reglages, rng, T }) {
  const pool = rng.melanger([...lettresDe(T, reglages.groupe)])
  const nbBlocs = Math.ceil(pool.length / PAR_BLOC)
  const blocs = Array.from({ length: nbBlocs }, (_, i) => pool.filter((_, j) => j % nbBlocs === i))
  return { niveau: niveauConnu(niveau), blocs: blocs.map(lettres => ({ lettres, droite: rng.melanger([...lettres]) })) }
}

export const verifier = (q, rep) => rep?.choix === q.bonne
export const bonneReponse = q => ({ choix: q.bonne })

// ── Programme : l'alphabet de la langue (BO n° 41 p. 52 : toutes les lettres de l'alphabet à partir de la GS) ──
export function ecartsAuProgramme(x, contraintes) {
  const lettres = Array.isArray(x) ? x.map(q => q.lettre) : x.blocs.flatMap(b => b.lettres)
  const alphabet = contraintes.lettres
  if (alphabet !== 'alphabet' && contraintes.niveau !== 'cp') return [`lettres : « ${alphabet} » n'est pas l'alphabet entier`]
  return lettres.length ? [] : ['aucune lettre']
}
