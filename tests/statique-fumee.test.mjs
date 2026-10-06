// Page statique d'une fiche ouverte à froid, dans Chrome : (1) sans JavaScript, elle affiche son contenu (titre, classes, compétences,
// liens PDF) et ses balises (canonical, JSON-LD) ; (2) avec JavaScript, l'app la prend en charge sans changer de titre ni de
// canonical (aucun contenu incohérent entre les deux), puis les titres suivent la navigation ; (3) l'index statique et 404.html.
// Demande un site construit avec `npm run fiches -- --avec-exemples` puis `npm run statique -- --avec-exemples` (tests/lancer.mjs).
//   TEST_URL=http://localhost:4190/ node tests/statique-fumee.test.mjs
import { lancerNavigateur, contexte, surveiller, verifier, nbEchecs, app } from './outils.mjs'

const SLUG = 'exercices-exemple-ce1'
const nav = await lancerNavigateur()

console.log('Sans JavaScript')
{
  const ctx = await nav.newContext({ javaScriptEnabled: false })
  const page = await ctx.newPage()
  const r = await page.goto(app(`/telechargements/${SLUG}/`))
  verifier(r.status() === 200, 'la page statique répond 200')
  verifier(await page.title() === 'Suites de nombres — École Primaire', 'titre du document propre à la fiche')
  verifier(await page.locator('h1').innerText() === 'Suites de nombres', 'le titre de la fiche est affiché sans JavaScript')
  verifier(await page.locator('h1').count() === 1, 'un seul h1')
  const texte = await page.locator('main.statique').innerText()
  verifier(/CE1/.test(texte) && /Compter de n en n/.test(texte) && /Télécharger le PDF/.test(texte), 'classes, compétences et liens PDF dans le texte')
  verifier(await page.locator('main.statique img').first().isVisible(), 'l’aperçu est visible')
  verifier(/^https:\/\/ecoleprimaire\.app\/telechargements\/exercices-exemple-ce1\/$/.test(await page.locator('link[rel=canonical]').getAttribute('href') ?? ''), 'canonical absolu')
  const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent())
  verifier(ld['@type'] === 'LearningResource' && ld.name === 'Suites de nombres', 'JSON-LD LearningResource')
  const pdf = await page.locator('a[href$=".pdf"]').first().getAttribute('href')
  const rp = await ctx.request.get(app(pdf))
  verifier(rp.status() === 200 && (await rp.body()).subarray(0, 4).toString() === '%PDF', 'le lien PDF mène à un vrai PDF')
  const apercu = await page.locator('main.statique img').first().getAttribute('src')
  verifier((await ctx.request.get(app(apercu))).status() === 200, 'l’aperçu existe')
  await ctx.close()
}

console.log('Avec JavaScript : l’app prend la page en charge')
{
  const ctx = await contexte(nav, { langue: 'fr', regionale: '' })
  // tous les titres et canonical vus pendant le chargement (un clignotement les ferait varier)
  await ctx.addInitScript(() => {
    window.__vus = { titres: new Set(), canonicals: new Set() }
    const noter = () => {
      if (!document.body) return   // la tête n'est pas encore lue en entier
      if (document.title) window.__vus.titres.add(document.title)
      const c = document.querySelector('link[rel=canonical]')
      window.__vus.canonicals.add(c ? c.href : '(aucun)')
    }
    new MutationObserver(noter).observe(document, { childList: true, subtree: true, characterData: true, attributes: true })
    document.addEventListener('DOMContentLoaded', noter)
  })
  const page = await ctx.newPage()
  const erreurs = surveiller(page)
  await page.goto(app(`/telechargements/${SLUG}/`))
  const h1Statique = await page.locator('h1').innerText()
  await page.locator('main.statique').waitFor({ state: 'detached', timeout: 10000 })
  await page.locator('h1').first().waitFor({ timeout: 10000 })
  verifier(await page.locator('h1').first().innerText() === h1Statique, 'l’app affiche le même titre de fiche que la page statique')
  verifier(await page.title() === 'Suites de nombres — École Primaire', 'le titre du document n’a pas changé')
  const vus = await page.evaluate(() => ({ titres: [...window.__vus.titres], canonicals: [...window.__vus.canonicals] }))
  verifier(vus.titres.length === 1, `un seul titre pendant tout le chargement${vus.titres.length > 1 ? ` : ${vus.titres.join(' | ')}` : ''}`)
  verifier(vus.canonicals.length === 1 && vus.canonicals[0].endsWith(`/telechargements/${SLUG}/`), `un seul canonical pendant tout le chargement${vus.canonicals.length > 1 ? ` : ${vus.canonicals.join(' | ')}` : ''}`)
  verifier(await page.locator('link[rel=canonical]').count() === 1 && await page.locator('script[type="application/ld+json"]').count() === 1, 'un canonical et un JSON-LD')
  verifier(!erreurs.length, `aucune erreur JavaScript${erreurs.length ? ` : ${erreurs[0]}` : ''}`)

  // la navigation suivante retrouve les titres et canonical de l'app
  await page.goto(app('/'))
  await page.locator('h1').first().waitFor({ timeout: 10000 })
  verifier(/^https:\/\/ecoleprimaire\.app\/$/.test(await page.locator('link[rel=canonical]').getAttribute('href')), 'accueil : canonical = adresse du site')
  await page.goto(app('/parametres'))
  await page.locator('h1').first().waitFor({ timeout: 10000 })
  verifier(await page.locator('link[rel=canonical]').count() === 0 && await page.locator('meta[name=robots][content=noindex]').count() === 1, 'réglages : pas de canonical, noindex')
  await page.goto(app('/maths'))
  await page.locator('h1').first().waitFor({ timeout: 10000 })
  verifier(/\/maths$/.test(await page.locator('link[rel=canonical]').getAttribute('href')) && await page.locator('meta[name=robots]').count() === 0, 'matière : canonical par route, plus de noindex')
  await ctx.close()
}

console.log('Index statique et 404')
{
  const ctx = await nav.newContext({ javaScriptEnabled: false })
  const page = await ctx.newPage()
  await page.goto(app('/telechargements/'))
  verifier(await page.locator('main.statique a[href*="/telechargements/"]').count() >= 5, 'l’index liste les fiches sans JavaScript')
  const r = await page.goto(app('/assets/introuvable.js'))
  // vite preview répond par l'app ; derrière nginx c'est 404.html (vérifié à la main, deploy/setup-nginx.sh)
  verifier(r !== null, 'un fichier absent répond')
  const nf = await ctx.request.get(app('/404.html'))
  const html = await nf.text()
  verifier(nf.status() === 200 && /noindex/.test(html) && /<form[^>]*action="[^"]*telechargements\/"/.test(html), '404.html : noindex et recherche')
  await ctx.close()
}

await nav.close()
process.exit(nbEchecs() ? 1 : 0)
