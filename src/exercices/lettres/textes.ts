// Les lettres — textes de CONTENU : l'alphabet de la langue du contenu (en majuscules, « | » entre les lettres) et ses voyelles, et ce que
// la fiche écrit (titre, consigne). Lus par T (générateur, fiche) ; les textes de l'INTERFACE sont dans src/langues/<langue>/textes/lettres.ts.
// Breton : lizherenneg peurunvan (src/langues/br/donnees.ts : ch et c'h sont des lettres ; pas de c, q, x), majuscule d'un digramme sur la
// première lettre seulement (Ch, C'h).
import { catalogue } from '../../langues/catalogue.ts'
import { donneesBr } from '../../langues/br/donnees.ts'

const majuscule = (l: string): string => l.charAt(0).toUpperCase() + l.slice(1)

export const CONTENU = catalogue({
  titre: 'Les lettres',
  alphabet: 'A|E|I|O|U|Y|B|C|D|F|G|H|J|K|L|M|N|P|Q|R|S|T|V|W|X|Z',
  voyelles: 'A|E|I|O|U|Y',
  consigne: 'Relie chaque majuscule à sa minuscule.',
}, {
  br: {
    titre: 'Al lizherennoù',
    alphabet: donneesBr.alphabet.map(majuscule).join('|'),
    voyelles: 'A|E|I|O|U|Y',
    consigne: 'Lak ul linenn etre pep pennlizherenn hag he lizherenn vihan.', // br: à relire
  },
})
