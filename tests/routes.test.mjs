// Toutes les routes, en français et en breton : pas d'erreur JS, pas de libellé d'interface français en breton
import { lancerNavigateur, contexte, surveiller, verifier, nbEchecs, app, ROUTES } from './outils.mjs'

// mots d'interface français qui ne doivent plus apparaître dans l'interface bretonne
const MOTS_FR = /\b(Commencer|Valider|Passer|Suivant|Quitter|Rejouer|Paramètres|Imprimer|Niveau|Nombre de|Question \d|Bravo|Bonne réponse|Ta réponse|Exercices?|Choisis|Clique|Combien|Écris|Bienvenue|Aperçu|Calculs?)\b/g

const nav = await lancerNavigateur()
for (const langue of ['fr', 'br']) {
  console.log(`Routes (${langue})`)
  const ctx = await contexte(nav, { langue })
  const page = await ctx.newPage()
  const erreurs = surveiller(page)
  for (const r of ROUTES) {
    erreurs.length = 0
    await page.goto(app(r))
    await page.waitForTimeout(400)
    // texte de l'interface, sans le contenu en français par nature (lang="fr" : libellés du programme, titres de fiches)
    const interface_ = () => page.locator('.container').first().evaluate(e => { const c = e.cloneNode(true); c.querySelectorAll('[lang="fr"]').forEach(x => x.remove()); return c.innerText || c.textContent }, null, { timeout: 3000 }).catch(() => '')
    let texte = await interface_()
    const go = page.getByRole('button', { name: /Commencer|Kregiñ/ })
    if (await go.count()) {
      await go.first().click({ timeout: 2000 }).catch(() => {})
      await page.waitForTimeout(300)
      texte += await interface_()
    }
    const restes = langue === 'br' ? [...new Set(texte.match(MOTS_FR) ?? [])] : []
    verifier(!erreurs.length && !restes.length, `${r}${erreurs.length ? ' — ' + erreurs[0] : ''}${restes.length ? ' — français : ' + restes.join(', ') : ''}`)
  }
  await ctx.close()
}
await nav.close()

// code de sortie lu par tests/lancer.mjs
process.exit(nbEchecs() ? 1 : 0)
