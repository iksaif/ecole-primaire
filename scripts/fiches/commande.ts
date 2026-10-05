// Commande `npm run fiches` : produit les fiches PDF toutes prêtes et leurs JSON (index et une entrée par fiche).
//   node scripts/fiches/commande.ts [--mode <site>] [--outDir <dossier>] [--avec-exemples] [--avec-anciens]
//                                   [--prefixe <slug>] [--travailleurs <n>]
//   --mode          site (mode Vite : ecoleprimaire, skoolik…) écrit dans l'index ; défaut : production
//   --outDir        dossier du site (défaut : dist) : les fichiers vont dans <outDir>/fiches/
//   --avec-exemples ajoute les exercices et affiches d'exemple (jamais en production)
//   --avec-anciens  ajoute les exercices de l'ancien registre (comparaison, reports)
//   --prefixe       seulement les fiches dont le slug commence ainsi (mise au point)
//   --travailleurs  onglets de Chrome en parallèle (défaut : un par cœur, 8 au plus)
// Variable : CHROME_PATH (chemin de Chrome). Format des données : src/telechargements/README.md.
import { parseArgs } from 'node:util'
import { resolve } from 'node:path'
import { assembler } from './assembler.ts'
import { ecrireFiches } from './ecrire.ts'
import { installerPolices } from './polices.ts'
import { produire } from './produire.ts'
import { fichesDesRegistres } from './registres.ts'
import { ouvrirRendu } from './rendu.ts'

const { values } = parseArgs({
  options: {
    mode: { type: 'string', default: 'production' },
    outDir: { type: 'string', default: 'dist' },
    'avec-exemples': { type: 'boolean', default: false },
    'avec-anciens': { type: 'boolean', default: false },
    prefixe: { type: 'string', default: '' },
    travailleurs: { type: 'string' },
  },
})

const racine = resolve(import.meta.dirname, '..', '..')
const outDir = resolve(racine, values.outDir)
if (values.mode === 'production' && values['avec-exemples']) throw new Error('--avec-exemples : jamais dans un build de production (donner un --mode de développement)')

installerPolices()
const fiches = await fichesDesRegistres({ avecExemples: values['avec-exemples'], avecAnciens: values['avec-anciens'], prefixe: values.prefixe })
console.log(`Fiches (${values.mode}) → ${values.outDir}/fiches/ : ${fiches.length} à produire`)

const debut = performance.now()
const rendu = await ouvrirRendu(values.travailleurs ? { travailleurs: Math.max(1, Number(values.travailleurs)) } : {})
try {
  const rendues = await produire(fiches, rendu, (f, nb) => console.log(`  ✓ ${f.source.meta.slug} (${nb}/${fiches.length})`))
  const { index, entrees } = assembler(rendues, { site: values.mode, genereLe: new Date().toISOString() })
  const dossier = ecrireFiches(outDir, index, entrees, rendues)
  console.log(`${entrees.length} fiche(s) écrite(s) dans ${dossier} en ${((performance.now() - debut) / 1000).toFixed(1)} s`)
} finally {
  await rendu.fermer()
}
