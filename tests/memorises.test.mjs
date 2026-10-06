// Réglages mémorisés abîmés : aucune page de la table de routes ne doit planter, rester vide ni boucler.
// Avant chaque chargement, TOUTES les clés `ep_*` que le code de la base lit reçoivent la même valeur corrompue (ancienne
// version, mauvais type, JSON invalide, très long). La liste des clés est LUE dans les sources (appels `charger('…')`,
// `chargerReglages`, `sauvegarder`, littéraux 'ep_…'), jamais recopiée : une clé nouvelle est testée sans y toucher. Les
// réglages des exemples (`<id>_config`) s'y ajoutent, et les pages /dev sont visitées sur le site de développement.
//   TEST_URL=http://localhost:5173/ecole-primaire/ node tests/memorises.test.mjs
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { EXEMPLES } from '../src/exercices/dev.ts'
import { lancerNavigateur, contexte, surveiller, verifier, nbEchecs, app, appDev, URL_SITE } from './outils.mjs'
import { cheminsDeLaTable, cheminsDev, adresses, valeursValides } from './outils-routes.mjs'

// ── les clés : dossiers de la base (l'ancien monde — views, composables, i18n… — n'est pas lu) ──
const src = join(dirname(fileURLToPath(import.meta.url)), '..', 'src')
const DOSSIERS = ['contexte', 'shell', 'pages', 'ressources', 'noyau', 'telechargements', 'router', 'langues', 'affiches', 'exercices', 'main.ts', 'App.vue']
const sources = c => statSync(c).isDirectory() ? readdirSync(c).flatMap(f => sources(join(c, f))) : /\.(js|ts|vue)$/.test(c) ? [c] : []
const texte = DOSSIERS.flatMap(d => sources(join(src, d))).concat(join(src, 'utils/impression.js')).map(f => readFileSync(f, 'utf8')).join('\n')
const CLES = [...new Set([
  ...[...texte.matchAll(/\b(?:charger|chargerValeur|chargerReglages|sauvegarder)(?:<[^>]*>)?\(\s*'([a-z][a-z_]*)'/g)].map(m => m[1]),
  ...[...texte.matchAll(/'ep_([a-z][a-z_]*)'/g)].map(m => m[1]),
  // réglages d'un exercice : `<id>_config` (cleReglages, src/noyau/useReglages.ts)
  ...EXEMPLES.map(e => `${e.definition.id.replaceAll('-', '_')}_config`),
])].sort()
// garde : le balayage doit retrouver au moins ce que le contexte, la langue et les ressources lisent
const ATTENDUES = ['classes', 'mode', 'reg', 'profil', 'vue', 'langue_interface', 'langue_regionale', 'polices', 'plis', 'recents']
const manquantes = ATTENDUES.filter(c => !CLES.includes(c))
verifier(!manquantes.length, `${CLES.length} clés lues dans les sources${manquantes.length ? ` — manquantes : ${manquantes}` : ''} (${CLES.join(', ')})`)

// ── les valeurs corrompues ──
const CORROMPUES = {
  'objet vide': '{}', 'ancienne version': '{"version":0,"niveau":42,"classes":"cm1"}', 'texte': '"x"', 'tableau vide': '[]', 'nombre': '42', 'null': 'null',
  'JSON invalide': '{invalide', 'tableau de tableaux': '[[[[1]]]]', 'très long': JSON.stringify('x'.repeat(50000)),
}
const routes = adresses(cheminsDeLaTable(), await valeursValides(URL_SITE))
const routesDev = process.env.TEST_URL_DEV ? cheminsDev() : []

const nav = await lancerNavigateur()
async function essayer([nom, valeur]) {
  const ctx = await contexte(nav)
  // après `contexte` : la langue d'interface et l'avis de traduction sont eux aussi abîmés
  await ctx.addInitScript(([cles, v]) => { for (const c of cles) try { localStorage.setItem('ep_' + c, v) } catch {} }, [CLES, valeur])
  const page = await ctx.newPage()
  const erreurs = surveiller(page)
  // une erreur de rendu d'un composant n'est qu'écrite dans la console par Vue
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) erreurs.push(m.text().slice(0, 200)) })
  const ko = []
  for (const [adresse, base] of [...routes.map(r => [r, app]), ...routesDev.map(r => [r, appDev])]) {
    erreurs.length = 0
    await page.goto(base(adresse))   // rechargement complet : les réglages sont réabîmés à chaque page
    const prete = await page.waitForSelector('h1', { timeout: 8000 }).then(() => true).catch(() => false)
    // une page qui boucle ne répond plus au script : l'évaluation échoue
    const vivante = prete && await page.evaluate(() => true, null, { timeout: 3000 }).catch(() => false)
    if (!vivante || erreurs.length) ko.push(`${adresse}${prete ? '' : ' (page vide)'}${prete && !vivante ? ' (ne répond plus)' : ''}${erreurs.length ? ' — ' + erreurs[0] : ''}`)
  }
  await ctx.close()
  return [nom, ko]
}

console.log(`Réglages mémorisés abîmés (${routes.length + routesDev.length} pages × ${Object.keys(CORROMPUES).length} valeurs)`)
for (const [nom, ko] of await Promise.all(Object.entries(CORROMPUES).map(essayer))) verifier(!ko.length, `${nom}${ko.length ? ' — ' + ko.join(' ; ') : ''}`)
await nav.close()

// code de sortie lu par tests/lancer.mjs
process.exit(nbEchecs() ? 1 : 0)
