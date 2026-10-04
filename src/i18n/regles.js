// Règles de langue pour écrire du contenu généré (énoncés, consignes, documents) sans branches
// « si breton … sinon … » dans le code. Pur JavaScript, utilisable aussi par node (build des PDF).
//
//   import { regles } from '../i18n/regles'
//   const R = regles(langue)          // langue du CONTENU ('fr' | 'br'), pas forcément celle de l'interface
//   R.nombre(3, NOMS.bille)           → « 3 billes » / « 3 bilhenn »
//   R.et('aval')                      → « et » / « hag »
//   R.que('Emma')                     → « qu'Emma » (fr)
//
// Breton (orthographe peurunvan). Règles appliquées :
//  - le nom reste au SINGULIER après un nombre (« 3 bilhenn ») ;
//  - « ha » devient « hag » devant une voyelle ou un h muet ;
//  - après l'article : nom masculin en k → c'h (« ar c'hi ») ; nom féminin singulier → mutation adoucissante
//    k→g, t→d, p→b, g→c'h, gw→w, b→v, m→v, sauf d (« ar gador », « an daol », « ar vamm ») ;
//  - mutation spirante après « tri, pevar, nav » : k→c'h, t→z, p→f.
// Les nombres sont écrits en chiffres dans les énoncés : la mutation après un chiffre se fait à l'oral,
// ce qui évite la plupart des erreurs à l'écrit.

const VOYELLE = /^[aeiouyàâäéèêëîïôöùûüœh]/i

const fr = {
  langue: 'fr',
  // « 1 bille », « 3 billes » ; nom = { s, p } ou chaîne (pluriel en -s)
  nombre: (n, nom) => `${n} ${pluriel(n, nom)}`,
  pluriel: (n, nom) => pluriel(n, nom),
  et: () => 'et',
  ou: () => 'ou',
  // élision : « que Léo », « qu'Emma »
  que: mot => (VOYELLE.test(mot) ? `qu'${mot}` : `que ${mot}`),
  de: mot => (VOYELLE.test(mot) ? `d'${mot}` : `de ${mot}`),
  le: (mot, genre = 'm') => (VOYELLE.test(mot) ? `l'${mot}` : `${genre === 'f' ? 'la' : 'le'} ${mot}`),
}
function pluriel(n, nom) {
  if (typeof nom === 'string') return Math.abs(n) >= 2 ? `${nom}s` : nom
  return Math.abs(n) >= 2 ? nom.p : nom.s
}

// ── Breton ──
const ADOUCIE = [['gw', 'w'], ['k', 'g'], ['t', 'd'], ['p', 'b'], ['g', "c'h"], ['b', 'v'], ['d', 'z'], ['m', 'v']]
const SPIRANTE = [['k', "c'h"], ['t', 'z'], ['p', 'f']]
function muter(mot, table) {
  for (const [de, vers] of table) {
    if (mot.toLowerCase().startsWith(de)) {
      const r = vers + mot.slice(de.length)
      return mot[0] === mot[0].toUpperCase() ? r[0].toUpperCase() + r.slice(1) : r
    }
  }
  return mot
}

const br = {
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

const REGLES = { fr, br }
export const regles = langue => REGLES[langue] ?? fr
