// Lance les tests : construit le site (sans les PDF d'exercices, plus rapide), le sert, exécute les tests.
//   npm test                 définitions d'exercices (node, sans Chrome) + logique + routes + exercices + réglages mémorisés abîmés + pages statiques
//   npm run test:complet     + effet de chaque réglage sur les fiches (≈ 5 min)
//   TEST_URL=https://ecoleprimaire.app/ node tests/lancer.mjs --sans-build   tester la production
import { execFileSync, spawn } from 'node:child_process'
import { preview } from 'vite'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const complet = process.argv.includes('--complet')
const sansBuild = process.argv.includes('--sans-build')
const OUT = 'dist-test'
const node = (...a) => execFileSync(process.execPath, a, { cwd: racine, stdio: 'inherit' })

let serveur = null
if (!process.env.TEST_URL) {
  if (!sansBuild) {
    console.log('▶ Build de test…')
    execFileSync('npx', ['vite', 'build', '--mode', 'ecoleprimaire', '--outDir', OUT, '--emptyOutDir', '--logLevel', 'warn'], { cwd: racine, stdio: 'inherit' })
    node('scripts/telechargements.mjs', '--mode', 'ecoleprimaire', '--outDir', OUT, '--sans-exercices')
  }
  serveur = await preview({ root: racine, mode: 'ecoleprimaire', build: { outDir: OUT }, preview: { port: 4190, strictPort: true }, logLevel: 'warn' })
  process.env.TEST_URL = 'http://localhost:4190/'
}

const fichiers = ['exercices', 'reponses', 'instantanes', 'logique', 'routes', 'cadre', 'memorises', 'statiques', 'affiches', 'programme-francais', 'programme-maths', ...(complet ? ['reglages'] : [])]
// chaque fichier finit par process.exit(nbEchecs() ? 1 : 0) : on ne lit que son code de sortie (exception, échec
// d'une vérification ou signal comptent comme un échec)
const echoues = []
for (const f of fichiers) {
  console.log(`\n▶ ${f}`)
  const code = await new Promise(ok => spawn(process.execPath, [`tests/${f}.test.mjs`], { cwd: racine, stdio: ['ignore', 'inherit', 'inherit'], env: process.env })
    .on('exit', (c, signal) => ok(signal ? 1 : c)))
  if (code !== 0) echoues.push(f)
}
if (serveur) await new Promise(ok => serveur.httpServer.close(ok))
console.log(echoues.length ? `\n✗ Des tests ont échoué : ${echoues.join(', ')}` : '\n✓ Tous les tests passent')
process.exit(echoues.length ? 1 : 0)
