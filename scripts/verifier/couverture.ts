// Couverture du programme : pour chaque domaine de src/data/programme.ts, chaque compétence et chaque classe où elle est
// travaillée, ce qui la couvre sur le site — exercice de l'app, fiche toute prête, affiche. Écrit couverture.html (non versionné) et
// un résumé par domaine dans le terminal.
//   npm run couverture
//
// Il lit les registres de la base (src/ressources/couverture.ts), comme le compteur `couverture` de `npm run qualite` et la page
// /dev/couverture.
import { writeFileSync } from 'node:fs'
import { chemin } from '../lib/racine.ts'
import { COMPETENCES, DOMAINES, NIVEAUX } from '../../src/data/programme.ts'
import { ressourcesDe } from '../../src/ressources/couverture.ts'
import { sectionsDomaines } from './couverture/domaines.ts'
import { sectionsExercices } from './couverture/exercices.ts'
import { pageCouverture } from './couverture/page.ts'

const programme = { COMPETENCES, DOMAINES, NIVEAUX }
const domaines = sectionsDomaines(programme, { ressourcesDe })
const parExercice = sectionsExercices(programme)
writeFileSync(chemin('couverture.html'), pageCouverture(domaines.html, parExercice))

console.log(domaines.terminal.join('\n'))
console.log('\n→ couverture.html')
