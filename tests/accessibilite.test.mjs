// Accessibilité des pages de la base dans Chrome, mesurée avec axe-core (WCAG 2.x A et AA) : aucune violation « critique » ou
// « sérieuse » sur les pages de développement (/dev, les exemples, les composants) et les exercices reportés (calcul mental, lire l'heure, la monnaie, les tables, le calcul posé), en français et en breton, à 1280 px et à
// 360 px, et dans les états utiles (fiche à imprimer, question en cours, résultats).
// La barre et le pied de page sont inclus (le shell a son propre test : pages-shell.test.mjs). Pour voir toutes les violations (y compris
// moyennes et mineures) :
//   AXE_DETAIL=1 TEST_URL=http://localhost:5173/ecole-primaire/ node tests/accessibilite.test.mjs
// Les pages /dev n'existent que dans un site construit avec VITE_AVEC_DEV=1 (TEST_URL_DEV) ou sur le serveur de dev.
import { lancerNavigateur, contexte, nbEchecs, appDev } from './outils.mjs'
import { verifierAxe } from './outils-axe.mjs'

const PAGES = ['/dev', '/dev/exemple', '/dev/exemple-corpus', '/dev/affiches', '/dev/composants', '/maths/calcul-mental', '/maths/heure', '/maths/monnaie', '/maths/numeration', '/maths/suites', '/maths/problemes', '/maths/tables', '/maths/calcul-pose', '/maternelle/compter', '/maternelle/comparer', '/maternelle/ordonner', '/maternelle/formes', '/maternelle/motifs', '/maths/geometrie']
const nav = await lancerNavigateur()

const mesurer = verifierAxe

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
      if (route === '/dev/exemple' || route === '/dev/exemple-corpus' || route === '/maths/calcul-mental' || route === '/maths/heure' || route === '/maths/monnaie' || route === '/maths/numeration' || route === '/maths/suites' || route === '/maths/problemes' || route === '/maths/tables' || route === '/maths/calcul-pose' || route.startsWith('/maternelle/')) {
        await page.locator('.modes button').nth(1).click()
        await page.waitForSelector('iframe')
        await mesurer(page, `${nom} fiche`)
        // l'aide et l'ajout de police dépliés (champ du nom, boutons)
        await page.locator('.options-fiche .aide').evaluate(d => { d.open = true })
        await mesurer(page, `${nom} fiche, ajout de police`)
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
