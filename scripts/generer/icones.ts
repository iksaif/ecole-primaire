// Importe les icônes d'interface de src/images/icones.ts dans src/images/donnees/interface.ts : le dessin OpenMoji en couleur de chacune,
// nettoyé. Un lot à part des contenus (donnees/couleur.ts) : le paquet principal le charge sans les dessins des fiches. Échoue si un
// code n'existe pas. À relancer quand on ajoute une icône à icones.ts.
//   node scripts/generer/icones.ts
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { ICONES } from '../../src/images/icones.ts'
import { chargerOpenMoji, ligneDessin, nettoyer, VERSION_OPENMOJI } from './openmoji.ts'

const SORTIE = join(import.meta.dirname, '../../src/images/donnees/interface.ts')

const codes = [...new Set(Object.values(ICONES))].sort()
const dessins: string[] = []
for (const code of codes) dessins.push(ligneDessin(code, nettoyer(code, await chargerOpenMoji(code))))
writeFileSync(SORTIE, `// GÉNÉRÉ par scripts/generer/icones.ts d'après src/images/icones.ts : ne pas modifier à la main.
// Dessins SVG des icônes d'interface : emojis OpenMoji ${VERSION_OPENMOJI} (couleur), CC BY-SA 4.0 — https://openmoji.org.
export const INTERFACE: Readonly<Record<string, string>> = {
${dessins.join('\n')}
}
`)
console.log(`${codes.length} icônes écrites dans src/images/donnees/interface.ts`)
