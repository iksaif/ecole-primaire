// Page /telechargements dans Chrome (test de fumée) : sur un site construit avec `npm run fiches -- --avec-exemples`
// (tests/lancer.mjs le fait ; en développement : `npm run fiches:dev`), la grille affiche les fiches d'exemple, les filtres et
// la recherche agissent, une fiche s'ouvre avec son aperçu et un PDF valide ; index absent, vide ou illisible : un message.
//   TEST_URL=http://localhost:5173/ecole-primaire/ node tests/fiches-fumee.test.mjs
import { lancerNavigateur, contexte, surveiller, verifier, nbEchecs, app } from './outils.mjs'

const nav = await lancerNavigateur()
const erreursDe = page => {
  const erreurs = surveiller(page)
  page.on('console', m => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) erreurs.push(m.text().slice(0, 200)) })
  return erreurs
}
const cartes = page => page.locator('.carte')

console.log('Grille')
{
  const ctx = await contexte(nav, { langue: 'fr', regionale: '' })
  const page = await ctx.newPage()
  const erreurs = erreursDe(page)
  await page.goto(app('/telechargements'))
  await cartes(page).first().waitFor({ timeout: 10000 })
  const n = await cartes(page).count()
  const titres = await page.locator('.carte .titre').allTextContents()
  verifier(n > 0, `${n} fiche(s) affichée(s)`)
  verifier(titres.some(t => /bande numérique/i.test(t)) && titres.some(t => /suites de nombres/i.test(t)), 'les fiches d\'exemple (affiche et exercice) sont là')
  verifier(await page.locator('.carte.apprendre').count() > 0 && await page.locator('.carte.sentrainer').count() > 0, 'pour apprendre / pour s\'entraîner')
  // les miniatures hors écran se chargent à la demande : on les amène à l'écran (la grille peut avoir autant de cartes qu'on veut)
  await page.evaluate(() => document.querySelectorAll('.carte img').forEach(i => i.scrollIntoView()))
  await page.waitForFunction(() => [...document.querySelectorAll('.carte img')].every(i => i.complete && i.naturalWidth > 0), null, { timeout: 10000 }).then(
    () => verifier(true, 'toutes les miniatures sont chargées'), () => verifier(false, 'toutes les miniatures sont chargées'))
  verifier(!(await page.locator('.carte').allTextContents()).some(t => /breton|brezhoneg/i.test(t)), 'langue régionale inactive : pas de fiche en breton')
  verifier(await page.getByRole('button', { name: /en breton/i }).count() === 1, 'un bouton propose d\'afficher les fiches en breton')

  // filtres
  await page.getByRole('button', { name: 'MS', exact: true }).click()
  const nMs = await cartes(page).count()
  verifier(nMs > 0 && nMs < n, `filtre MS : ${nMs} fiche(s)`)
  verifier(await page.getByRole('button', { name: 'MS', exact: true }).getAttribute('aria-pressed') === 'true', 'le bouton du filtre est « pressé »')
  await page.getByRole('button', { name: 'Toutes', exact: true }).first().click()
  await page.getByRole('button', { name: 'Pour apprendre' }).first().click()
  verifier(await page.locator('.carte.sentrainer').count() === 0 && await page.locator('.carte.apprendre').count() > 0, 'filtre « pour apprendre »')
  await page.getByRole('button', { name: 'Tout', exact: true }).click()
  // recherche (sans accents)
  await page.getByRole('searchbox').fill('numerique')
  const nRecherche = await cartes(page).count()
  verifier(nRecherche > 0 && nRecherche < n, `recherche « numerique » (sans accent) : ${nRecherche} fiche(s)`)
  await page.getByRole('searchbox').fill('zzzzzz')
  verifier(await cartes(page).count() === 0 && await page.getByRole('button', { name: /Effacer/ }).count() === 1, 'recherche sans résultat : message et bouton pour effacer')
  await page.getByRole('button', { name: /Effacer/ }).click()
  verifier(await cartes(page).count() === n, 'effacer les filtres')

  // régionale : un clic sur « Afficher aussi… » montre les fiches en breton
  await page.getByRole('button', { name: /en breton/i }).click()
  await page.waitForFunction(m => document.querySelectorAll('.carte').length > m, n)
  verifier(await cartes(page).count() > n, 'langue régionale activée : les fiches en breton apparaissent')
  verifier(!erreurs.length, `aucune erreur JavaScript${erreurs.length ? ` (${erreurs[0]})` : ''}`)
  await ctx.close()
}

console.log('Page d\'une fiche')
{
  const ctx = await contexte(nav, { langue: 'fr', regionale: '' })
  const page = await ctx.newPage()
  const erreurs = erreursDe(page)
  await page.goto(app('/telechargements'))
  await cartes(page).first().waitFor()
  await page.locator('.carte', { hasText: 'Suites de nombres' }).filter({ hasText: 'CE1' }).first().click()
  await page.waitForURL(/\/telechargements\/exercices-exemple-ce1$/)
  verifier(true, 'la carte mène à /telechargements/<slug>')
  await page.locator('.fiche').waitFor()
  verifier(/Suites de nombres/.test(await page.locator('h1').textContent()), 'titre de la fiche')
  const img = page.locator('.apercu img')
  await page.waitForFunction(() => { const i = document.querySelector('.apercu img'); return i && i.complete && i.naturalWidth > 0 })
  verifier(true, 'aperçu chargé')
  const avant = await img.getAttribute('src')
  await page.getByRole('button', { name: 'Fiche 2' }).click()
  verifier(await img.getAttribute('src') !== avant, 'un autre exemplaire change l\'aperçu')

  const lien = page.getByRole('link', { name: /Télécharger le PDF/ })
  const href = await lien.getAttribute('href')
  const r = await page.request.get(new URL(href, page.url()).href)
  const corps = await r.body()
  verifier(r.ok() && /pdf/.test(r.headers()['content-type'] ?? '') && corps.subarray(0, 4).toString() === '%PDF', `le PDF s'ouvre (${href}, ${corps.length} octets)`)
  const perso = page.getByRole('link', { name: /Personnaliser/ })
  verifier(/\/dev\/exemple\?mode=imprimer$/.test(await perso.evaluate(a => a.href)), 'lien « Personnaliser » vers le formulaire de l\'exercice')
  verifier(await page.getByText('Fiches par compétence').count() === 1 && await page.locator('.bloc .carte').count() >= 2, 'les fiches par compétence du bilan sont listées')
  verifier(await page.locator('.bloc li[lang="fr"]').count() > 0, 'compétences visées avec libellé du programme')
  await page.locator('.bloc .carte', { hasText: /ajouter|dizaines|règle|suite/i }).first().click()
  await page.waitForURL(/\/telechargements\/exercices-exemple-ce1-/)
  await page.getByRole('link', { name: /Toutes les compétences de la classe/ }).waitFor({ timeout: 5000 }).then(
    () => verifier(true, 'une fiche par compétence renvoie à son bilan'), () => verifier(false, 'une fiche par compétence renvoie à son bilan'))

  // affiche : deux formats de PDF
  await page.goto(app('/telechargements/affiche-exemple-jusqua6'))
  await page.getByRole('link', { name: /Télécharger le PDF/ }).waitFor()
  verifier(await page.getByRole('link', { name: /Télécharger en A3/ }).count() === 1, 'affiche : le PDF A3 est proposé aussi')

  // fiche inconnue
  await page.goto(app('/telechargements/n-existe-pas'))
  await page.getByRole('alert').waitFor()
  verifier(/n’existe pas/.test(await page.getByRole('alert').textContent()), 'fiche inconnue : message')
  verifier(!erreurs.length, `aucune erreur JavaScript${erreurs.length ? ` (${erreurs[0]})` : ''}`)
  await ctx.close()
}

console.log('Breton')
{
  const ctx = await contexte(nav, { langue: 'br', regionale: 'br' })
  const page = await ctx.newPage()
  const erreurs = erreursDe(page)
  await page.goto(app('/telechargements'))
  await cartes(page).first().waitFor()
  verifier(/Fichennoù da voullañ/.test(await page.locator('h1').textContent()), 'interface en breton')
  verifier((await page.locator('.carte .titre').allTextContents()).some(t => /Bandenn niveroù/.test(t)), 'titres des fiches en breton')
  verifier(await page.getByRole('button', { name: 'br', exact: true }).count() === 0, 'pas de bouton parasite')
  verifier(!erreurs.length, `aucune erreur JavaScript${erreurs.length ? ` (${erreurs[0]})` : ''}`)
  await ctx.close()
}

console.log('Index absent, vide ou illisible')
for (const [nom, repondre, attendu] of [
  ['absent', r => r.fulfill({ status: 404, body: 'x' }), /introuvable/],
  ['page HTML à la place du JSON (serveur de développement)', r => r.fulfill({ status: 200, contentType: 'text/html', body: '<html></html>' }), /introuvable/],
  ['illisible', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"version":99}' }), /pas pu être lues/],
  ['vide', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ version: 1, genereLe: '2026-10-05T00:00:00Z', site: 'x', filtres: { classes: [], langues: [], usages: [], domaines: [] }, entrees: [] }) }), /pas encore de fiche/],
]) {
  const ctx = await contexte(nav, { langue: 'fr' })
  const page = await ctx.newPage()
  await page.route('**/fiches/index.json', repondre)
  await page.goto(app('/telechargements'))
  await page.locator('.message').waitFor()
  verifier(attendu.test(await page.locator('.message').textContent()) && await page.locator('.carte').count() === 0, `index ${nom} : message adapté, pas de grille`)
  await ctx.close()
}

await nav.close()
process.exit(nbEchecs() ? 1 : 0)
