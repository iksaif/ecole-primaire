// Accessibilité des pages de la base dans Chrome, mesurée avec axe-core (WCAG 2.x A et AA) : aucune violation « critique » ou
// « sérieuse » sur les pages de développement (/dev, les exemples, les composants), en français et en breton, à 1280 px et à
// 360 px, et dans les états utiles (fiche à imprimer, question en cours, résultats).
// Hors périmètre (shell : src/shell, src/pages) : le test ignore les règles de page entière listées dans RESERVES et ne regarde
// ni la navigation (<nav class="nav">) ni le pied de page (<footer class="pied">) ; le rapport du plan 11 décrit leurs défauts
// (contraste du logo, du lien actif, des gris du pied de page ; <main> ; titre de document ; débordement à 320 px). Pour voir toutes les violations (y compris moyennes et mineures) :
//   AXE_DETAIL=1 TEST_URL=http://localhost:5173/ecole-primaire/ node tests/accessibilite.test.mjs
// Les pages /dev n'existent que dans un site construit avec VITE_AVEC_DEV=1 (TEST_URL_DEV) ou sur le serveur de dev.
import { createRequire } from 'node:module'
import { lancerNavigateur, contexte, verifier, nbEchecs, appDev } from './outils.mjs'

const require = createRequire(import.meta.url)
const AXE = require.resolve('axe-core/axe.min.js')
const detail = !!process.env.AXE_DETAIL
// Règles qui relèvent de la page entière, donc du shell et non des composants : <main>, repères, titre de document
const RESERVES = new Set(['document-title', 'landmark-one-main', 'region', 'page-has-heading-one'])
const GRAVES = new Set(['critical', 'serious'])

const PAGES = ['/dev', '/dev/exemple', '/dev/exemple-corpus', '/dev/affiches', '/dev/composants']
const nav = await lancerNavigateur()

async function mesurer(page, nom) {
  await page.addScriptTag({ path: AXE })
  const { violations } = await page.evaluate(() => globalThis.axe.run({ exclude: [['nav.nav'], ['footer.pied']] }, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } }))
  const retenues = violations.filter(v => !RESERVES.has(v.id))
  const graves = retenues.filter(v => GRAVES.has(v.impact))
  verifier(!graves.length, `${nom} : aucune violation critique ou sérieuse${graves.length ? ' (' + graves.map(v => `${v.id} x${v.nodes.length}`).join(', ') + ')' : ''}`)
  if (detail || graves.length) {
    for (const v of retenues) console.log(`      [${v.impact}] ${v.id} x${v.nodes.length} : ${v.nodes.slice(0, 2).map(n => n.target.join(' ')).join(' | ')}`)
  }
}

for (const largeur of [1280, 360]) {
  for (const langue of ['fr', 'br']) {
    console.log(`${largeur} px, interface ${langue}`)
    const ctx = await contexte(nav, { langue, viewport: { width: largeur, height: 900 } })
    const page = await ctx.newPage()
    for (const route of PAGES) {
      const nom = `${route} (${langue}, ${largeur})`
      await page.goto('about:blank')
      await page.goto(appDev(route))
      await page.waitForSelector('h1, h2')
      await mesurer(page, nom)
      // les exemples d'exercice : la fiche à imprimer, puis une question du jeu
      if (route === '/dev/exemple' || route === '/dev/exemple-corpus') {
        await page.locator('.modes button').nth(1).click()
        await page.waitForSelector('iframe')
        await mesurer(page, `${nom} fiche`)
        await page.locator('.modes button').nth(0).click()
        await page.locator('.actions .btn-primary').click()
        await page.waitForSelector('.score-bar')
        await mesurer(page, `${nom} question`)
      }
    }
    await ctx.close()
  }
}
await nav.close()
process.exit(nbEchecs() ? 1 : 0)
