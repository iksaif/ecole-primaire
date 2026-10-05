// Pages d'exercice : mode impression (aperçu, « Nouvelle fiche ») puis mode jeu (Commencer), en fr et en br
import { lancerNavigateur, contexte, surveiller, verifier, nbEchecs, app, EXERCICES } from './outils.mjs'

const nav = await lancerNavigateur()
for (const langue of ['fr', 'br']) {
  console.log(`Exercices, deux modes (${langue})`)
  const ctx = await contexte(nav, { langue })
  const page = await ctx.newPage()
  const erreurs = surveiller(page)
  let fenetres = 0
  page.on('popup', () => fenetres++)
  for (const r of EXERCICES) {
    erreurs.length = 0
    await page.goto(app(`${r}?mode=imprimer`))
    const apercu = await page.locator('.cadre-exercice iframe').first().waitFor({ timeout: 8000 }).then(() => true).catch(() => false)
    let regen = true
    const btn = page.getByRole('button', { name: /Nouvelle fiche|Fichenn nevez/ })
    if (apercu && await btn.count()) {
      const a = await page.locator('.cadre-exercice iframe').first().getAttribute('srcdoc')
      await btn.click(); await page.waitForTimeout(300)
      regen = a !== await page.locator('.cadre-exercice iframe').first().getAttribute('srcdoc')
    }
    await page.getByRole('tab').first().click({ timeout: 2000 }).catch(() => {})
    await page.waitForTimeout(200)
    const go = page.getByRole('button', { name: /Commencer|Kregiñ/ })
    const jeu = await go.count() && await go.first().click({ timeout: 2000 }).then(() => true).catch(() => false)
    verifier(apercu && regen && jeu && !erreurs.length, `${r}${!apercu ? ' — pas d\'aperçu' : ''}${!regen ? ' — « Nouvelle fiche » sans effet' : ''}${!jeu ? ' — pas de série' : ''}${erreurs.length ? ' — ' + erreurs[0] : ''}`)
  }
  verifier(fenetres === 0, 'aucune fenêtre ouverte')
  await ctx.close()
}
await nav.close()

// code de sortie lu par tests/lancer.mjs
process.exit(nbEchecs() ? 1 : 0)
