// Règles du breton (orthographe peurunvan) pour écrire du contenu généré. Appliquées :
//  - le nom reste au SINGULIER après un nombre (« 3 bilhenn ») ;
//  - « ha » devient « hag » devant une voyelle ou un h muet ;
//  - après l'article : nom masculin en k → c'h (« ar c'hi ») ; nom féminin singulier → mutation adoucissante
//    k→g, t→d, p→b, g→c'h, gw→w, b→v, m→v, sauf d (« ar gador », « an daol », « ar vamm ») ;
//  - mutation spirante après « tri, pevar, nav » : k→c'h, t→z, p→f.
// Les nombres sont écrits en chiffres dans les énoncés : la mutation après un chiffre se fait à l'oral,
// ce qui évite la plupart des erreurs à l'écrit.
import type { Regles } from '../types.ts'

const VOYELLE = /^[aeiouyàâäéèêëîïôöùûüœh]/i

type Table = readonly (readonly [string, string])[]
const ADOUCIE: Table = [['gw', 'w'], ['k', 'g'], ['t', 'd'], ['p', 'b'], ['g', "c'h"], ['b', 'v'], ['d', 'z'], ['m', 'v']]
const SPIRANTE: Table = [['k', "c'h"], ['t', 'z'], ['p', 'f']]

function muter(mot: string, table: Table): string {
  for (const [de, vers] of table) {
    if (mot.toLowerCase().startsWith(de)) {
      const r = vers + mot.slice(de.length)
      return mot[0] === mot[0].toUpperCase() ? r[0].toUpperCase() + r.slice(1) : r
    }
  }
  return mot
}

export const reglesBr: Regles = {
  langue: 'br',
  // le nom reste au singulier après un nombre ; nom = { s } ou chaîne
  nombre: (n, nom) => `${n} ${typeof nom === 'string' ? nom : nom.s}`,
  pluriel: (n, nom) => (typeof nom === 'string' ? nom : Math.abs(n) >= 2 && nom.p ? nom.p : nom.s),
  et: mot => (VOYELLE.test(mot ?? '') ? 'hag' : 'ha'),
  ou: () => 'pe',
  que: mot => `eget ${mot}`,
  de: mot => mot,
  // article défini : « an » devant voyelle, n, d, t, h ; « al » devant l ; « ar » ailleurs.
  le: (mot, genre = 'm') => {
    const m = genre === 'f' ? (/^d/i.test(mot) ? mot : muter(mot, ADOUCIE)) : muter(mot, [['k', "c'h"]])
    return `${/^[aeiouhndt]/i.test(m) ? 'an' : /^l/i.test(m) ? 'al' : 'ar'} ${m}`
  },
  adoucir: mot => muter(mot, ADOUCIE),
  spirer: mot => muter(mot, SPIRANTE),
}
