// Pages de la base (Chrome) : chaque page, en français et en breton, sans erreur JavaScript ; comportement par site
// (ecoleprimaire : interface française, aucune langue régionale ; skoolik : interface bretonne, breton actif).
// Le build de skoolik est servi par tests/lancer.mjs (TEST_URL_SKOOLIK) ; sans lui, la partie skoolik est ignorée.
//   TEST_URL=http://localhost:5173/ecole-primaire/ node tests/base.test.mjs
import { lancerNavigateur, contexte, surveiller, verifier, nbEchecs, URL_SITE } from './outils.mjs'

const URL_SKOOLIK = process.env.TEST_URL_SKOOLIK && process.env.TEST_URL_SKOOLIK.replace(/\/?$/, '/')
// route → marque `data-page` de la page (attend la page demandée, pas la précédente)
const PAGES = { '/': 'accueil', '/brezhoneg': 'langue-regionale', '/parametres': 'reglages', '/about': 'apropos', '/nouveautes': 'nouveautes' }
const attendre = (page, route) => page.waitForSelector(`[data-page="${PAGES[route]}"]`, { timeout: 10000 })
const adresse = (base, route) => `${base}${route.replace(/^\//, '')}`
const nav = await lancerNavigateur()

// langue de l'interface (attribut lang de <html>) et texte du logo
const etat = page => page.evaluate(() => ({
  lang: document.documentElement.lang, regionale: localStorage.getItem('ep_langue_regionale'), interface: localStorage.getItem('ep_langue_interface'),
  menu: [...document.querySelectorAll('.nav-links a')].map(a => a.textContent.trim()),
}))

for (const langue of ['fr', 'br']) {
  console.log(`Pages de la base (${langue})`)
  const ctx = await contexte(nav, { langue })
  const page = await ctx.newPage()
  const erreurs = surveiller(page)
  // le signal de statistiques anonymes part vers /journal, qui n'existe que derrière nginx : son 404 hors production est attendu
  page.on('console', m => { if (m.type() === 'error' && !/\/journal\?/.test(m.location().url ?? '')) erreurs.push(m.text().slice(0, 200)) })
  for (const route of Object.keys(PAGES)) {
    await page.goto(adresse(URL_SITE, route))
    await attendre(page, route)
    const h = await page.locator('h1').first().textContent()
    verifier(!!h?.trim() && !erreurs.length, `${route} : titre « ${h?.trim().slice(0, 40)} », sans erreur${erreurs.length ? ` (${erreurs[0]})` : ''}`)
  }
  // une adresse inconnue : page « introuvable » avec un lien vers l'accueil
  await page.goto(adresse(URL_SITE, '/ancienne-route/maths'))
  await page.waitForSelector('[data-page="introuvable"]', { timeout: 10000 })
  await page.locator('[data-page="introuvable"] a').click()
  await attendre(page, '/')
  verifier(new URL(page.url()).pathname === new URL(URL_SITE).pathname, 'une adresse inconnue : page introuvable, et un lien vers l’accueil')
  await ctx.close()
}

console.log('ecoleprimaire')
{
  const ctx = await nav.newContext()
  const page = await ctx.newPage()
  await page.goto(URL_SITE)
  await page.waitForSelector('.nav')
  const e = await etat(page)
  verifier(e.lang.startsWith('fr') && e.interface === '"fr"', 'interface française par défaut')
  verifier(!e.menu.some(m => /Brezhoneg/i.test(m)), 'aucune langue régionale dans le menu par défaut')
  // activer la langue régionale avec le menu « Langue » de la barre : le menu s’enrichit
  await page.getByRole('button', { name: /^Langue :/ }).click()
  await page.getByRole('button', { name: /Français \+ Brezhoneg/ }).click()
  await page.waitForSelector('.nav-links a[href$="/brezhoneg"]')
  verifier((await etat(page)).menu.some(m => /Brezhoneg/i.test(m)), 'langue régionale activable dans la barre')
  await page.goto(adresse(URL_SITE, '/brezhoneg'))
  await attendre(page, '/brezhoneg')
  verifier(await page.locator('.lettre').count() === 25, 'page de la langue régionale : 25 lettres de l’alphabet breton')
  // changer la langue d’interface dans les réglages
  await page.goto(adresse(URL_SITE, '/parametres'))
  await attendre(page, '/parametres')
  await page.locator('.bloc').first().getByRole('button', { name: /Brezhoneg/ }).click()
  verifier((await etat(page)).lang === 'br', 'le drapeau breton passe l’interface en breton')
  verifier(await page.locator('.fond[role=dialog], [role=dialog]').count() === 1, 'avis de traduction automatique à la première fois')
  await ctx.close()
}

if (URL_SKOOLIK) {
  console.log('skoolik')
  const ctx = await nav.newContext()
  const page = await ctx.newPage()
  const erreurs = surveiller(page)
  await page.goto(URL_SKOOLIK)
  await page.waitForSelector('.nav')
  const e = await etat(page)
  verifier(e.lang === 'br' && e.interface === '"br"', 'interface en breton par défaut')
  verifier(e.menu.some(m => /Brezhoneg/i.test(m)), 'langue régionale (breton) active : elle est dans le menu')
  await page.locator('[role=dialog] .btn-primary').click()
  await page.goto(adresse(URL_SKOOLIK, '/parametres'))
  await attendre(page, '/parametres')
  verifier(await page.locator('.bloc').first().getByRole('button').count() === 2, 'interface en breton ou en français : deux langues dans les réglages')
  await page.locator('.bloc').first().getByRole('button').nth(1).click()
  verifier((await etat(page)).lang.startsWith('fr'), 'le français est disponible')
  await page.goto(adresse(URL_SKOOLIK, '/brezhoneg'))
  await attendre(page, '/brezhoneg')
  verifier(await page.locator('.lettre').count() === 25, 'page de la langue régionale avec les données du breton')
  verifier(!erreurs.length, `sans erreur JavaScript${erreurs.length ? ` (${erreurs[0]})` : ''}`)
  await ctx.close()
}

await nav.close()
process.exit(nbEchecs() ? 1 : 0)
