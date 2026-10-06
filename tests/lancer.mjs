// Lance les tests : construit les sites (sans les PDF d'exercices), les sert, exécute les tests EN PARALLÈLE (sorties
// regroupées par test, dans l'ordre de la liste), puis affiche les durées, les plus longues d'abord.
//   npm test                 tests node de la base + Chrome (pages de la base, jeu et fiche des exemples)
//   TEST_URL=https://ecoleprimaire.app/ node tests/lancer.mjs --sans-build   tester la production
//
// RÈGLE DE DÉPENDANCES (deux listes à tenir à jour plus bas : NODE et CHROME ; un test nouveau va dans l'une des deux)
//   - NODE   : ni serveur ni build, pur node (modules de src/ importés tels quels). Lancés AU DÉPART, pendant que les builds
//              tournent : ils n'attendent rien. Ils ne lisent ni TEST_URL*, ni dist-test*.
//   - CHROME : besoin d'un site SERVI (TEST_URL, TEST_URL_SKOOLIK, TEST_URL_DEV : tests/outils.mjs) ou d'un build (production lit
//              PROD_DIRS). Ils attendent la fin des builds (`pret`), puis passent du plus long au plus court : le dernier qui
//              reste est court (CONCURRENCE tests à la fois). Une durée qui change beaucoup : réordonner CHROME d'après le
//              tableau des durées affiché en fin de run.
// Trois builds, lancés ensemble :
//   - dist-test          ecoleprimaire, PRODUCTION (+ fiches d'exemple, pour tests/fiches*.test.mjs)     port 4190
//   - dist-test-skoolik  skoolik, PRODUCTION                                                           port 4191
//   - dist-test-dev      ecoleprimaire AVEC les pages de développement (`VITE_AVEC_DEV=1`, src/dev.ts) : /dev/exemple,
//                        /dev/affiches… pour les tests de fumée du jeu (tests/jeu-dev, dev-affiche)       port 4192
// Les deux premiers sont ce qui part en ligne : tests/production.test.mjs y cherche les exemples (il ne doit y en avoir aucun).
// Pas de cache de build : l'ensemble coûte quelques secondes (durée affichée en fin de run) ; un cache périmé donnerait un faux vert.
import { execFile, spawn } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync, rmSync, readdirSync } from 'node:fs'
import { preview } from 'vite'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const sansBuild = process.argv.includes('--sans-build')
const OUT = 'dist-test'
const OUT_SKOOLIK = 'dist-test-skoolik'
const OUT_DEV = 'dist-test-dev'
const FUITE = '__fuite_test__.json'
const CONCURRENCE = 4
const debutTotal = Date.now()

// un script node (stdout masqué : ses lignes de progression noieraient la sortie) : promesse, pour en lancer plusieurs ensemble
const node = (...a) => new Promise((ok, ko) => {
  execFile(process.execPath, a, { cwd: racine, maxBuffer: 1 << 26 }, (e, sortie, erreur) => { if (e) { process.stderr.write(erreur); ko(e) } else ok() })
})
// un build vite : promesse (plusieurs en même temps)
const construire = (args, env = {}) => new Promise((ok, ko) => {
  const p = spawn('npx', ['vite', 'build', ...args, '--emptyOutDir', '--logLevel', 'warn'], { cwd: racine, stdio: 'inherit', env: { ...process.env, ...env } })
  p.on('exit', c => (c === 0 ? ok() : ko(new Error(`vite build ${args.join(' ')} : code ${c}`))))
})

const serveurs = []
const env = {}
const phases = []   // [nom, ms] : où passe le temps avant les tests Chrome
const chrono = async (nom, f) => { const t = Date.now(); const r = await f(); phases.push([nom, Date.now() - t]); return r }

// Builds, fiches, pages statiques, serveurs : tout ce dont les tests CHROME ont besoin. Les tests NODE ne l'attendent pas.
async function preparer() {
  if (process.env.TEST_URL) return
  if (!sansBuild) {
    // un fichier dans public/fiches/ : `vite build` ne doit pas le copier (tests/production.test.mjs)
    const dossierFiches = join(racine, 'public/fiches')
    const dossierExistait = existsSync(dossierFiches)
    mkdirSync(dossierFiches, { recursive: true })
    writeFileSync(join(dossierFiches, FUITE), '{}')
    try {
      await chrono('builds vite (x3)', () => Promise.all([
        construire(['--mode', 'skoolik', '--outDir', OUT_SKOOLIK]),
        construire(['--mode', 'ecoleprimaire', '--outDir', OUT]),
        construire(['--mode', 'ecoleprimaire', '--outDir', OUT_DEV], { VITE_AVEC_DEV: '1' }),
      ]))
    } finally {
      rmSync(join(dossierFiches, FUITE), { force: true })
      if (!dossierExistait && !readdirSync(dossierFiches).length) rmSync(dossierFiches, { recursive: true, force: true })
    }
    // le site de développement a aussi les fiches d'exemple : son catalogue (fiches voisines, jeu lié) en a besoin (tests/pages-fiches) ;
    // les pages statiques de OUT lisent les fiches de OUT : elles passent après, en même temps que celles de OUT_DEV
    await chrono('fiches + pages statiques', () => Promise.all([
      node('scripts/build/fiches/commande.ts', '--mode', 'ecoleprimaire', '--outDir', OUT, '--avec-exemples')
        .then(() => node('scripts/build/statique/commande.ts', '--mode', 'ecoleprimaire', '--outDir', OUT, '--avec-exemples')),
      node('scripts/build/fiches/commande.ts', '--mode', 'ecoleprimaire', '--outDir', OUT_DEV, '--avec-exemples'),
    ]))
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
const pret = preparer()
pret.catch(() => {})   // l'échec est rapporté plus bas, par le test qui l'attend ou par la fin du run

// NODE : tests node de la base (sites, langues, nombres, définitions, noyau, exercices, affiches, réponses, instantanés, fiches).
const NODE = ['sites', 'langues', 'nombres', 'uniques', 'contexte', 'definir', 'noyau', 'exercices', 'affiches-modele', 'affiches-planche', 'reponses', 'instantanes', 'ressources', 'recherche',
  'polices', 'fiches', 'statique', 'programme-page', 'recents', 'fiches-pages', 'heure']
// CHROME : pages dans Chrome, du plus long au plus court (durées : tableau de fin de run). Les tests de l'ancien code sont dans
// tests/ancien/, hors de ces listes.
const CHROME = ['pages-shell', 'accessibilite', 'pages-pages', 'pages-programme', 'pages-fiches', 'pages-recherche', 'memorises', 'dev-affiche', 'affiches-alphabet', 'affiches-monnaie', 'routes-langues',
  'navigation', 'vie-privee', 'base', 'composants', 'statique-fumee', 'jeu-dev', 'production', 'statique-debordement', 'fiches-debordement']
const fichiers = [...NODE, ...CHROME]

// chaque fichier finit par process.exit(nbEchecs() ? 1 : 0) : on ne lit que son code de sortie (exception, échec
// d'une vérification ou signal comptent comme un échec)
const lancer = f => new Promise(ok => {
  const sortie = []
  const debut = Date.now()
  const p = spawn(process.execPath, [`tests/${f}.test.mjs`], { cwd: racine, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, ...env } })
  p.stdout.on('data', d => sortie.push(d)); p.stderr.on('data', d => sortie.push(d))
  p.on('exit', (c, signal) => ok({ f, code: signal ? 1 : c, sortie: Buffer.concat(sortie).toString(), duree: Date.now() - debut }))
})
// CONCURRENCE à la fois (Chrome et node se partagent la machine) ; les NODE passent d'abord, les CHROME attendent `pret`
const resultats = new Map()
const file = fichiers.map(f => ({ f, chrome: CHROME.includes(f) }))
await Promise.all(Array.from({ length: CONCURRENCE }, async () => {
  for (let t; (t = file.shift());) {
    if (t.chrome) {
      try { await pret } catch (e) { resultats.set(t.f, { f: t.f, code: 1, sortie: `  ✗ préparation des sites : ${e.message}\n`, duree: 0 }); continue }
    }
    resultats.set(t.f, await lancer(t.f))
  }
}))
const echoues = []
for (const f of fichiers) {
  const r = resultats.get(f)
  console.log(`\n▶ ${f}${r.code ? '  ✗' : ''}`)
  process.stdout.write(r.code ? r.sortie : r.sortie.split('\n').filter(l => !/^\s+✓/.test(l)).join('\n'))
  if (r.code !== 0) echoues.push(f)
}
for (const s of serveurs) await new Promise(ok => s.httpServer.close(ok))
// durées, les plus longues d'abord (pour régler l'ordre de CHROME) ; sans effet sur le code de sortie
console.log(`\nDurées (${((Date.now() - debutTotal) / 1000).toFixed(0)} s au total) :`)
for (const [nom, ms] of phases) console.log(`  ${(ms / 1000).toFixed(1).padStart(5)} s  [préparation] ${nom}`)
for (const r of [...resultats.values()].sort((a, b) => b.duree - a.duree)) console.log(`  ${(r.duree / 1000).toFixed(1).padStart(5)} s  ${r.f}`)
console.log(echoues.length ? `\n✗ Des tests ont échoué : ${echoues.join(', ')}` : '\n✓ Tous les tests passent')
process.exit(echoues.length ? 1 : 0)
