// Lance les tests : construit les sites (sans les PDF d'exercices), les sert, exécute les tests EN PARALLÈLE (sorties
// regroupées par test, dans l'ordre de la liste).
//   npm test                 tests node de la base + Chrome (pages de la base, jeu et fiche des exemples) ; ~15 s
//   TEST_URL=https://ecoleprimaire.app/ node tests/lancer.mjs --sans-build   tester la production
// Trois builds, lancés ensemble :
//   - dist-test          ecoleprimaire, PRODUCTION (+ fiches d'exemple, pour tests/fiches*.test.mjs)     port 4190
//   - dist-test-skoolik  skoolik, PRODUCTION                                                           port 4191
//   - dist-test-dev      ecoleprimaire AVEC les pages de développement (`VITE_AVEC_DEV=1`, src/dev.ts) : /dev/exemple,
//                        /dev/affiches… pour les tests de fumée du jeu (tests/jeu-dev, dev-affiche)       port 4192
// Les deux premiers sont ce qui part en ligne : tests/production.test.mjs y cherche les exemples (il ne doit y en avoir aucun).
import { execFileSync, spawn } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync, rmSync, readdirSync } from 'node:fs'
import { preview } from 'vite'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const sansBuild = process.argv.includes('--sans-build')
const OUT = 'dist-test'
const OUT_SKOOLIK = 'dist-test-skoolik'
const OUT_DEV = 'dist-test-dev'
const node = (...a) => execFileSync(process.execPath, a, { cwd: racine, stdio: 'inherit' })
const FUITE = '__fuite_test__.json'

// un build vite : promesse (plusieurs en même temps)
const construire = (args, env = {}) => new Promise((ok, ko) => {
  const p = spawn('npx', ['vite', 'build', ...args, '--emptyOutDir', '--logLevel', 'warn'], { cwd: racine, stdio: 'inherit', env: { ...process.env, ...env } })
  p.on('exit', c => (c === 0 ? ok() : ko(new Error(`vite build ${args.join(' ')} : code ${c}`))))
})

const serveurs = []
const env = {}
if (!process.env.TEST_URL) {
  if (!sansBuild) {
    console.log('▶ Builds de test (production x2, développement)…')
    // un fichier dans public/fiches/ : `vite build` ne doit pas le copier (tests/production.test.mjs)
    const dossierFiches = join(racine, 'public/fiches')
    const dossierExistait = existsSync(dossierFiches)
    mkdirSync(dossierFiches, { recursive: true })
    writeFileSync(join(dossierFiches, FUITE), '{}')
    try {
      await Promise.all([
        construire(['--mode', 'skoolik', '--outDir', OUT_SKOOLIK]),
        construire(['--mode', 'ecoleprimaire', '--outDir', OUT]),
        construire(['--mode', 'ecoleprimaire', '--outDir', OUT_DEV], { VITE_AVEC_DEV: '1' }),
      ])
    } finally {
      rmSync(join(dossierFiches, FUITE), { force: true })
      if (!dossierExistait && !readdirSync(dossierFiches).length) rmSync(dossierFiches, { recursive: true, force: true })
    }
    node('scripts/fiches/commande.ts', '--mode', 'ecoleprimaire', '--outDir', OUT, '--avec-exemples')
  }
  const servir = async (mode, dossier, port) => {
    const s = await preview({ root: racine, mode, build: { outDir: dossier }, preview: { port, strictPort: true }, logLevel: 'warn' })
    serveurs.push(s)
    return `http://localhost:${port}/`
  }
  env.TEST_URL = await servir('ecoleprimaire', OUT, 4190)
  env.TEST_URL_SKOOLIK = await servir('skoolik', OUT_SKOOLIK, 4191)
  env.TEST_URL_DEV = await servir('ecoleprimaire', OUT_DEV, 4192)
  env.PROD_DIRS = `${OUT}:${OUT_SKOOLIK}`
  env.FUITE = FUITE
}

// La base : tests node (sites, langues, définitions, noyau, exercices, affiches, réponses, instantanés, fiches) puis pages dans
// Chrome (pages de la base, jeu et fiche des exemples). Les tests de l'ancien code sont dans tests/ancien/, hors de cette liste.
const fichiers = ['sites', 'langues', 'contexte', 'definir', 'noyau', 'exercices', 'affiches-modele', 'reponses', 'instantanes', 'ressources', 'recherche', 'production',
  'fiches', 'base', 'navigation', 'fiches-fumee', 'jeu-dev', 'dev-affiche', 'composants', 'accessibilite']
// chaque fichier finit par process.exit(nbEchecs() ? 1 : 0) : on ne lit que son code de sortie (exception, échec
// d'une vérification ou signal comptent comme un échec)
const lancer = f => new Promise(ok => {
  const sortie = []
  const p = spawn(process.execPath, [`tests/${f}.test.mjs`], { cwd: racine, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, ...env } })
  p.stdout.on('data', d => sortie.push(d)); p.stderr.on('data', d => sortie.push(d))
  p.on('exit', (c, signal) => ok({ f, code: signal ? 1 : c, sortie: Buffer.concat(sortie).toString() }))
})
// au plus 4 à la fois (Chrome et node se partagent la machine) ; les sorties sont affichées dans l'ordre de la liste
const resultats = new Map()
const file = [...fichiers]
await Promise.all(Array.from({ length: 4 }, async () => { for (let f; (f = file.shift());) resultats.set(f, await lancer(f)) }))
const echoues = []
for (const f of fichiers) {
  const r = resultats.get(f)
  console.log(`\n▶ ${f}${r.code ? '  ✗' : ''}`)
  process.stdout.write(r.code ? r.sortie : r.sortie.split('\n').filter(l => !/^\s+✓/.test(l)).join('\n'))
  if (r.code !== 0) echoues.push(f)
}
for (const s of serveurs) await new Promise(ok => s.httpServer.close(ok))
console.log(echoues.length ? `\n✗ Des tests ont échoué : ${echoues.join(', ')}` : '\n✓ Tous les tests passent')
process.exit(echoues.length ? 1 : 0)
