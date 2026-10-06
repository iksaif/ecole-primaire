// Commande `npm run statique` : écrit les pages HTML statiques des fiches (pour les moteurs de recherche et les gens sans
// JavaScript), l'index `telechargements/`, `sitemap.xml`, `robots.txt` et `404.html`, à partir des JSON de `npm run fiches`.
//   node scripts/statique/commande.ts [--mode <site>] [--outDir <dossier>] [--avec-exemples]
//   --mode          site (ecoleprimaire, skoolik…) ; défaut : production (le site par défaut)
//   --outDir        dossier du site déjà construit (`vite build` puis `npm run fiches`) ; défaut : dist
//   --avec-exemples garde les entrées d'exemple de l'index (jamais en production)
// Ordre d'un build : vite build → npm run fiches → npm run statique. Spécification : src/telechargements/README.md.
import { parseArgs } from 'node:util'
import { resolve } from 'node:path'
import { ecrireStatique, fichiersStatiques } from './ecrire.ts'
import { lireContexte } from './lire.ts'

const { values } = parseArgs({
  options: {
    mode: { type: 'string', default: 'production' },
    outDir: { type: 'string', default: 'dist' },
    'avec-exemples': { type: 'boolean', default: false },
  },
})
if (values.mode === 'production' && values['avec-exemples']) throw new Error('--avec-exemples : jamais dans un build de production (donner un --mode de développement)')

const debut = performance.now()
const outDir = resolve(import.meta.dirname, '..', '..', values.outDir)
const ctx = lireContexte({ mode: values.mode, outDir, avecExemples: values['avec-exemples'] })
const fichiers = fichiersStatiques(ctx)
ecrireStatique(outDir, fichiers)
console.log(`Pages statiques (${values.mode}) → ${values.outDir} : ${ctx.index.entrees.length} fiche(s), ${fichiers.length} fichier(s) en ${((performance.now() - debut) / 1000).toFixed(2)} s`)
