// Couverture du programme : pour chaque domaine de src/data/programme.ts, chaque compétence et chaque classe où elle est
// travaillée, ce qui la couvre sur le site — exercice de l'app, fiche toute prête (générateur ou fiche par compétence),
// affiche. Écrit couverture.html (non versionné) et un résumé par domaine dans le terminal.
//   npm run couverture
//
// Il lit l'ANCIEN monde (src/impression/couverture.js, exercices.js, data/activites.js), seul à porter aujourd'hui les ressources
// du site : c'est l'outil pour choisir quoi reporter, et la source du compteur `couverture` de `npm run qualite`. La page
// /programme de la base lit, elle, le catalogue neuf (src/ressources/) : quand les exercices y seront reportés, ce rapport
// et ce compteur seront réécrits dessus (ou supprimés s'ils font double emploi).
import { writeFileSync } from 'node:fs'
import { chemin } from '../lib/racine.ts'
import { chargeurVite } from '../lib/vite.ts'
import { sectionsDomaines } from './couverture/domaines.ts'
import { sectionsExercices } from './couverture/exercices.ts'
import type { Activite, Couverture, Exercices, Programme } from './couverture/modeles.ts'
import { pageCouverture } from './couverture/page.ts'

// les modules de l'ancien monde importent sans extension : on passe par Vite (rendu côté serveur, sans navigateur)
const vite = chargeurVite()
const programme = await vite.charger<Programme>('/src/data/programme.ts')
const { ACTIVITES } = await vite.charger<{ ACTIVITES: Activite[] }>('/src/data/activites.js')
const exercices = await vite.charger<Exercices>('/src/impression/exercices.js')
const couverture = await vite.charger<Couverture>('/src/impression/couverture.js')
await vite.fermer()

const domaines = sectionsDomaines(programme, couverture)
const parExercice = sectionsExercices(programme, exercices, ACTIVITES, couverture)
writeFileSync(chemin('couverture.html'), pageCouverture(domaines.html, parExercice))

console.log(domaines.terminal.join('\n'))
console.log('\n→ couverture.html')
