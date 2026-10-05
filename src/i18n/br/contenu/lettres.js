// Contenu — exercice « Les lettres » (src/exercices/lettres/), en breton : l'alphabet de la langue (src/data/languesRegionales.js,
// lizherenneg peurunvan : ch et c'h sont des lettres ; pas de c, q, x), avec la majuscule d'un digramme sur la première lettre
// seulement (Ch, C'h), et ses voyelles. Clés partagées avec src/i18n/fr/contenu/lettres.js.
import { langueRegionale } from '../../../data/languesRegionales.js'

const majuscule = l => l.charAt(0).toUpperCase() + l.slice(1)

export default {
  alphabet: langueRegionale('br').alphabet.map(majuscule),
  voyelles: ['A', 'E', 'I', 'O', 'U', 'Y'],
}
