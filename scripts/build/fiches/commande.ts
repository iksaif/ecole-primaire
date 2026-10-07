// Commande `npm run fiches` : produit les fiches PDF toutes prêtes et leurs JSON (index et une entrée par fiche).
//   node scripts/build/fiches/commande.ts [--mode <site>] [--outDir <dossier>] [--avec-exemples]
//                                   [--prefixe <slug>] [--travailleurs <n>]
//   --mode          site (mode Vite : ecoleprimaire, skoolik…) écrit dans l'index ; défaut : production
//   --outDir        dossier du site (défaut : dist) : les fichiers vont dans <outDir>/fiches/
//   --avec-exemples ajoute les exercices et affiches d'exemple (jamais en production)
//   --prefixe       seulement les fiches dont le slug commence ainsi (mise au point)
//   --echantillon   seulement un échantillon représentatif (build de test rapide ; `echantillonner`) : jamais en production
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
import { racine } from '../../lib/racine.ts'

const { values } = parseArgs({
  options: {
    mode: { type: 'string', default: 'production' },
    outDir: { type: 'string', default: 'dist' },
    'avec-exemples': { type: 'boolean', default: false },
    prefixe: { type: 'string', default: '' },
    echantillon: { type: 'boolean', default: false },
    travailleurs: { type: 'string' },
  },
})

const outDir = resolve(racine, values.outDir)
if (values.mode === 'production' && values['avec-exemples']) throw new Error('--avec-exemples : jamais dans un build de production (donner un --mode de développement)')

if (values.mode === 'production' && values.echantillon) throw new Error('--echantillon : jamais dans un build de production (donner un --mode de test)')

installerPolices()
const fiches = await fichesDesRegistres({ avecExemples: values['avec-exemples'], prefixe: values.prefixe, echantillon: values.echantillon, site: values.mode })
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
