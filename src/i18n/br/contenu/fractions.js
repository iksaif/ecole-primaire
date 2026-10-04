// Textes générés de l'exercice « Les fractions » (FractionsView) — breton.
// Traduction automatique : les passages marqués « br: à relire » sont à faire vérifier par un brittophone.
import { regles } from '../../regles.js'

const R = regles('br')
const CHIFFRES = ['zero', 'un', 'daou', 'tri', 'pevar', 'pemp', "c'hwec'h", 'seizh', 'eizh', 'nav']
const NOMS_PARTS = {
  2: 'hanter', 3: 'trede', 4: 'kard', 5: 'pempvet', 6: "c'hwec'hvet", 7: 'seizhvet',
  8: 'eizhvet', 9: 'navvet', 10: 'dekvet',
}

export default {
  // un hanter, un trede, ur c'hard, ur pempvet… ; daou drede, tri c'hard, daou bempvet…
  // (article indéfini : un devant voyelle, h, n, d, t ; ul devant l ; ur ailleurs, k → c'h après ur ;
  // mutation adoucissante après « daou », spirante après « tri, pevar, nav »)
  enLettres: ({ n, d }) => { // br: à relire
    const nom = NOMS_PARTS[d]
    if (n === 1) {
      if (/^[aeiouhndt]/.test(nom)) return `un ${nom}`
      if (nom.startsWith('l')) return `ul ${nom}`
      return `ur ${nom.startsWith('k') ? R.spirer(nom) : nom}`
    }
    if (n === 2) return `daou ${R.adoucir(nom)}`
    if (n === 3 || n === 4 || n === 9) return `${CHIFFRES[n]} ${R.spirer(nom)}`
    return `${CHIFFRES[n]} ${nom}`
  },
  // ordinal en chiffres : 1añ, 2vet, 3de, 4re, 5vet…
  ordinal: ({ n }) => `${n}${n === 1 ? 'añ' : n === 3 ? 'de' : n === 4 ? 're' : 'vet'}`, // br: à relire
  partDe_2: 'An hanter', partDe_3: 'An trede', partDe_4: "Ar c'hard", partDe_5: 'Ar pempvet', partDe_10: 'An dekvet',
  // en breton la consigne garde le nombre en chiffres
  nbParts: ({ d }) => String(d),
}
