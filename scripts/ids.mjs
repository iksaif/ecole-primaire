// Écrit src/noyau/ids.ts : les constantes K (compétences) et D (domaines), une entrée par id de src/data/programme.ts
// (« heure-entiere » → K.heureEntiere), entrées fictives des exemples comprises. À relancer quand le programme gagne une compétence ou un domaine ; `npm run types`
// échoue tant que ids.ts est en retard (voir la vérification de complétude en bas du fichier).
//   node scripts/ids.mjs
import { writeFileSync } from 'node:fs'
import { COMPETENCES, COMPETENCES_EXEMPLE, DOMAINES, DOMAINES_EXEMPLE } from '../src/data/programme.ts'

const camel = id => id.replace(/-(\w)/g, (_, c) => c.toUpperCase())
const entrees = liste => liste.map(({ id }) => `  ${camel(id)}: '${id}',`).join('\n')

writeFileSync(new URL('../src/noyau/ids.ts', import.meta.url), `// Généré par \`node scripts/ids.mjs\` d'après src/data/programme.ts : ne pas modifier à la main.
// Des constantes plutôt que des chaînes : K.heureEntiere se complète dans l'éditeur, une faute de frappe ne compile pas
// (et lève une erreur claire si le code tourne sans vérification de types : voir fort()).
import type { CompetenceId, DomaineId } from './types.ts'
import { AVEC_DEV } from '../dev.ts'

/** Pourquoi un Proxy : node retire les types sans les vérifier, et \`K.inconnue\` vaudrait undefined en silence. */
function fort<T extends object>(nom: string, ids: T): T {
  return new Proxy(ids, {
    get: (cible, cle, recepteur) => {
      if (typeof cle === 'string' && !(cle in cible)) throw new Error(\`\${nom}.\${cle} n'existe pas (src/noyau/ids.ts, généré d'après programme.ts)\${cle.startsWith('exemple') ? ' : les entrées « exemple… » sont fictives, développement seulement : jamais dans un exercice réel ni en production (src/dev.ts)' : ''}\`)
      return Reflect.get(cible, cle, recepteur)
    },
  })
}

// Les entrées fictives des exemples (développement seulement) : leurs ids ne doivent pas entrer dans un build de production.
// La condition est écrite ICI avec les littéraux de Vite (src/dev.ts explique pourquoi) : en production, \`{}\`.
const avecDev: boolean = import.meta.env ? (import.meta.env.DEV || !!import.meta.env.VITE_AVEC_DEV) : AVEC_DEV
const competencesFictives = (avecDev ? {
${entrees(COMPETENCES_EXEMPLE)}
} : {}) as {
${entrees(COMPETENCES_EXEMPLE).replaceAll(/: '([^']+)',/g, ": '$1',")}
}
const domainesFictifs = (avecDev ? {
${entrees(DOMAINES_EXEMPLE)}
} : {}) as {
${entrees(DOMAINES_EXEMPLE)}
}

/** Compétences de src/data/programme.ts. */
export const K = fort('K', {
${entrees(COMPETENCES)}
  ...competencesFictives,
} as const satisfies Record<string, CompetenceId>)

/** Domaines de src/data/programme.ts. */
export const D = fort('D', {
${entrees(DOMAINES)}
  ...domainesFictifs,
} as const satisfies Record<string, DomaineId>)

// Complétude : ne compile plus si le programme a une compétence ou un domaine absent de K ou D (relancer scripts/ids.mjs)
type Manquants = Exclude<CompetenceId, (typeof K)[keyof typeof K]> | Exclude<DomaineId, (typeof D)[keyof typeof D]>
export const complet: [Manquants] extends [never] ? true : never = true
`)
