// Lance les tests : construit le site (sans les PDF d'exercices, plus rapide), le sert, exécute les tests.
//   npm test                 tests node de la base (sites, langues, définitions, affiches) + pages de la base dans Chrome, sites ecoleprimaire et skoolik
//   TEST_URL=https://ecoleprimaire.app/ node tests/lancer.mjs --sans-build   tester la production
import { execFileSync, spawn } from 'node:child_process'
import { preview } from 'vite'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const sansBuild = process.argv.includes('--sans-build')
const OUT = 'dist-test'
const OUT_SKOOLIK = 'dist-test-skoolik'
const node = (...a) => execFileSync(process.execPath, a, { cwd: racine, stdio: 'inherit' })

let serveur = null, serveurSkoolik = null
if (!process.env.TEST_URL) {
  if (!sansBuild) {
    execFileSync('npx', ['vite', 'build', '--mode', 'skoolik', '--outDir', OUT_SKOOLIK, '--emptyOutDir', '--logLevel', 'warn'], { cwd: racine, stdio: 'inherit' })
    console.log('▶ Build de test…')
    execFileSync('npx', ['vite', 'build', '--mode', 'ecoleprimaire', '--outDir', OUT, '--emptyOutDir', '--logLevel', 'warn'], { cwd: racine, stdio: 'inherit' })
    node('scripts/fiches/commande.ts', '--mode', 'ecoleprimaire', '--outDir', OUT, '--avec-exemples')
  }
  serveur = await preview({ root: racine, mode: 'ecoleprimaire', build: { outDir: OUT }, preview: { port: 4190, strictPort: true }, logLevel: 'warn' })
  process.env.TEST_URL = 'http://localhost:4190/'
  serveurSkoolik = await preview({ root: racine, mode: 'skoolik', build: { outDir: OUT_SKOOLIK }, preview: { port: 4191, strictPort: true }, logLevel: 'warn' })
  process.env.TEST_URL_SKOOLIK = 'http://localhost:4191/'
}

// La base : tests node (sites, langues, définitions, affiches, réponses, instantanés) puis pages de la base dans Chrome.
// Les tests de l'ancien code (exercices, pages d'impression, programme) sont dans tests/ancien/, hors de cette liste.
const fichiers = ['sites', 'langues', 'definir', 'exercices', 'affiches-modele', 'reponses', 'instantanes', 'fiches', 'base', 'fiches-fumee']
// chaque fichier finit par process.exit(nbEchecs() ? 1 : 0) : on ne lit que son code de sortie (exception, échec
// d'une vérification ou signal comptent comme un échec)
const echoues = []
for (const f of fichiers) {
  console.log(`\n▶ ${f}`)
  const code = await new Promise(ok => spawn(process.execPath, [`tests/${f}.test.mjs`], { cwd: racine, stdio: ['ignore', 'inherit', 'inherit'], env: process.env })
    .on('exit', (c, signal) => ok(signal ? 1 : c)))
  if (code !== 0) echoues.push(f)
}
for (const s of [serveur, serveurSkoolik]) if (s) await new Promise(ok => s.httpServer.close(ok))
console.log(echoues.length ? `\n✗ Des tests ont échoué : ${echoues.join(', ')}` : '\n✓ Tous les tests passent')
process.exit(echoues.length ? 1 : 0)
