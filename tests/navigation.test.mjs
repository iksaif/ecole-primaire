// Navigation (Chrome) : adresses propres ouvertes à froid, redirection des anciennes adresses `#/…`, titre de document par page,
// <main> et focus à chaque changement de page, retour / avance du navigateur, contexte porté par l'adresse (prioritaire sur le réglage
// mémorisé, sans le modifier, reporté de page en page). Le build de skoolik (TEST_URL_SKOOLIK) sert aux titres en breton.
//   TEST_URL=http://localhost:5173/ecole-primaire/ node tests/navigation.test.mjs
import { lancerNavigateur, contexte, surveiller, verifier, nbEchecs, URL_SITE, titreQui } from './outils.mjs'

const URL_SKOOLIK = process.env.TEST_URL_SKOOLIK && process.env.TEST_URL_SKOOLIK.replace(/\/?$/, '/')
const BASE = new URL(URL_SITE).pathname
const adresse = (base, route) => `${base}${route.replace(/^\//, '')}`
// chemin et paramètres de la page courante, sans la base de l'application
const ou = page => { const u = new URL(page.url()); return `${u.pathname.slice(BASE.length - 1)}${u.search}${u.hash}` }
const pret = page => page.waitForSelector('main#contenu h1', { timeout: 10000 })
const stocke = (page, cle) => page.evaluate(c => localStorage.getItem(`ep_${c}`), cle)

const nav = await lancerNavigateur()

console.log('Adresses ouvertes à froid')
{
  const ctx = await contexte(nav)
  const page = await ctx.newPage()
  const erreurs = surveiller(page)
  const titres = new Map()
  const ROUTES = ['/', '/maths', '/francais', '/monde', '/brezhoneg', '/maths/fiches', '/francais/fiches', '/monde/fiches', '/telechargements/', '/programme',
    '/competence/ce1-nombres', '/parametres', '/about', '/nouveautes', '/une/adresse/inconnue']
  for (const route of ROUTES) {
    await page.goto(adresse(URL_SITE, route))
    await pret(page)
    const titre = await titreQui(page, / — École Primaire$/)
    titres.set(route, titre)
    const h1 = (await page.locator('main h1').first().textContent())?.trim()
    verifier(ou(page) === route && !!h1 && titre.endsWith(' — École Primaire'), `${route} : page affichée à froid, titre « ${titre} »`)
  }
  verifier(!erreurs.length, `aucune erreur JavaScript${erreurs.length ? ` (${erreurs[0]})` : ''}`)
  const differents = [...titres].filter(([r]) => !['/competence/ce1-nombres', '/une/adresse/inconnue'].includes(r))
  verifier(new Set(differents.map(([, t]) => t)).size === differents.length, 'un titre de document propre à chaque page')
  await page.goto(adresse(URL_SITE, '/langue-regionale'))
  await pret(page)
  verifier(ou(page) === '/brezhoneg', 'l’ancienne /langue-regionale renvoie vers la page de la langue régionale')
  await page.goto(adresse(URL_SITE, '/maths'))
  await pret(page)
  verifier(await page.locator('main#contenu').count() === 1 && await page.locator('a.lien-evitement').count() === 1, '<main id="contenu"> et lien d’évitement')
  verifier(await page.evaluate(() => document.querySelector('link[rel=icon]').href === location.origin + document.querySelector('link[rel=icon]').getAttribute('href')), 'les icônes sont chargées depuis la base, pas depuis l’adresse courante')
  await ctx.close()
}

console.log('Anciennes adresses #/…')
{
  const ctx = await contexte(nav)
  const page = await ctx.newPage()
  const erreurs = surveiller(page)
  await page.goto(`${URL_SITE}#/maths/fiches?classes=cm1`)
  await pret(page)
  verifier(ou(page) === '/maths/fiches?classes=cm1', '#/maths/fiches?classes=cm1 → /maths/fiches?classes=cm1')
  await page.goto(`${URL_SITE}#/telechargements/une-fiche/`)
  await page.waitForSelector('main#contenu')
  verifier(ou(page) === '/telechargements/une-fiche/', '#/telechargements/<slug>/ → /telechargements/<slug>/')
  await page.goto(`${URL_SITE}#/`)
  await pret(page)
  verifier(ou(page) === '/', '#/ → accueil')
  await page.goto(`${URL_SITE}?graine=3#/about?classes=cp`)
  await pret(page)
  verifier(ou(page) === '/about?graine=3&classes=cp', 'les paramètres d’avant le # sont gardés')
  verifier(!erreurs.length, `sans erreur JavaScript${erreurs.length ? ` (${erreurs[0]})` : ''}`)
  await ctx.close()
}

console.log('Focus, retour et avance')
{
  const ctx = await contexte(nav)
  const page = await ctx.newPage()
  await page.goto(adresse(URL_SITE, '/'))
  await pret(page)
  verifier(await page.evaluate(() => document.activeElement?.id !== 'contenu'), 'au chargement, le focus n’est pas volé')
  await page.locator('.pied a[href$="about"]').click()
  await page.waitForSelector('[data-page="apropos"]')
  verifier(ou(page) === '/about' && await page.evaluate(() => document.activeElement?.id === 'contenu'), 'changer de page : le focus va au <main>')
  await page.keyboard.press('Tab')
  verifier(await page.evaluate(() => document.activeElement?.id !== 'contenu'), 'Tab part du contenu')
  await page.goBack()
  await page.waitForSelector('[data-page="accueil"]')
  verifier(ou(page) === '/', 'retour du navigateur : l’accueil')
  await page.goForward()
  await page.waitForSelector('[data-page="apropos"]')
  verifier(ou(page) === '/about', 'avance du navigateur : à propos')
  await page.goto(adresse(URL_SITE, '/'))
  await pret(page)
  await page.keyboard.press('Tab')
  const evite = await page.evaluate(() => document.activeElement?.className)
  verifier(evite === 'lien-evitement', 'le lien d’évitement est le premier élément atteint au clavier')
  await page.keyboard.press('Enter')
  verifier(await page.evaluate(() => document.activeElement?.id === 'contenu'), 'le lien d’évitement met le focus sur le contenu')
  await ctx.close()
}

console.log('Contexte dans l’adresse')
{
  const ctx = await contexte(nav)
  await ctx.addInitScript(() => { try { if (!localStorage.getItem('ep_classes')) { localStorage.setItem('ep_classes', '["cp"]'); localStorage.setItem('ep_classe', '"cp"') } } catch {} })
  const page = await ctx.newPage()
  const erreurs = surveiller(page)
  await page.goto(adresse(URL_SITE, '/?classes=ce2,ce1,ce2'))
  await pret(page)
  verifier(await stocke(page, 'classes') === '["cp"]' && await stocke(page, 'classe') === '"cp"', 'une adresse avec des classes ne modifie pas le réglage mémorisé')
  await page.locator('.pied a[href$="about"]').click()
  await page.waitForSelector('[data-page="apropos"]')
  verifier(ou(page) === '/about?classes=ce2,ce1,ce2', 'les classes de l’adresse suivent d’une page à l’autre (liens internes)')
  await page.goBack()
  await page.waitForSelector('[data-page="accueil"]')
  verifier(ou(page) === '/?classes=ce2,ce1,ce2', 'retour : l’adresse d’origine, sans entrée d’historique en trop')
  await page.goto(adresse(URL_SITE, '/'))
  await pret(page)
  await page.locator('.pied a[href$="about"]').click()
  await page.waitForSelector('[data-page="apropos"]')
  verifier(ou(page) === '/about', 'sans contexte dans l’adresse : rien n’est ajouté')
  // mode=reg : interface dans la langue régionale (si le site la propose), sans toucher au réglage mémorisé de la langue
  await page.goto(adresse(URL_SITE, '/maths?mode=reg'))
  await pret(page)
  verifier(await page.evaluate(() => document.documentElement.lang) === 'br' && (await titreQui(page, /^Jedoniezh/).catch(() => '')).startsWith('Jedoniezh'), 'mode=reg : interface en breton (titre compris)')
  verifier(await stocke(page, 'langue_interface') === '"fr"', 'mode=reg : le réglage de langue de l’interface n’est pas modifié')
  await page.goto(adresse(URL_SITE, '/maths'))
  await pret(page)
  verifier(await page.evaluate(() => document.documentElement.lang) === 'fr-FR', 'sans mode : retour au français')
  verifier(!erreurs.length, `sans erreur JavaScript${erreurs.length ? ` (${erreurs[0]})` : ''}`)
  await ctx.close()
}

if (URL_SKOOLIK) {
  console.log('skoolik')
  const ctx = await nav.newContext()
  await ctx.addInitScript(() => { try { localStorage.setItem('ep_avis_traduction_vu', 'true'); localStorage.setItem('ep_langue_interface', '"br"') } catch {} })
  const page = await ctx.newPage()
  const erreurs = surveiller(page)
  await page.goto(adresse(URL_SKOOLIK, '/maths'))
  await page.waitForSelector('main#contenu h1')
  const t = await titreQui(page, /^Jedoniezh.* — Skoolik$/).catch(() => page.title())
  verifier(t.startsWith('Jedoniezh') && t.endsWith(' — Skoolik'), `titre en breton : « ${t} »`)
  await page.goto(`${URL_SKOOLIK}#/brezhoneg`)
  await page.waitForSelector('[data-page="langue-regionale"]')
  verifier(new URL(page.url()).pathname === '/brezhoneg', 'skoolik : #/brezhoneg → /brezhoneg')
  verifier(!erreurs.length, `sans erreur JavaScript${erreurs.length ? ` (${erreurs[0]})` : ''}`)
  await ctx.close()
}

await nav.close()
process.exit(nbEchecs() ? 1 : 0)
