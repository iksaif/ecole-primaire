// Pages des fiches toutes prêtes dans Chrome : liste d'une matière (filtres, langue seulement en bilingue, cartes et liste), index
// /telechargements, feuille ouverte à froid (aperçu multipage au clavier, Télécharger et Imprimer séparés, format seulement s'il y en a
// plusieurs, même fiche dans une autre langue, voisines sans filtre de classe, jeu lié), états absent / vide, axe à 360 et 1280 px.
// Besoin : un site construit avec les fiches d'exemple (tests/lancer.mjs le fait ; en développement : `npm run fiches:dev`).
//   TEST_URL=http://localhost:5173/ecole-primaire/ node tests/pages-fiches.test.mjs
import { lancerNavigateur, contexte, surveiller, verifier, nbEchecs, app, appDev, titreQui } from './outils.mjs'
import { verifierAxe } from './outils-axe.mjs'

const nav = await lancerNavigateur()
async function ouvrir({ langue = 'fr', largeur = 1280, regionale } = {}) {
  const ctx = await contexte(nav, { langue, regionale, viewport: { width: largeur, height: 900 } })
  const page = await ctx.newPage()
  const erreurs = surveiller(page)
  page.on('console', m => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) erreurs.push(m.text().slice(0, 200)) })
  return { ctx, page, erreurs }
}
const cartes = page => page.locator('article.carte')
const pret = page => page.waitForSelector('main#contenu h1', { timeout: 10000 })
const SLUG = 'exercices-exemple-ce1'

console.log('Liste d\'une matière')
{
  const { ctx, page, erreurs } = await ouvrir()
  await page.goto(app('/maths/fiches?classes=ce1'))
  await cartes(page).first().waitFor({ timeout: 10000 })
  verifier(await page.locator('h1').count() === 1 && /Fiches toutes prêtes — Maths/.test(await page.locator('h1').textContent()), 'un seul h1, avec la matière')
  await titreQui(page, /^Fiches de mathématiques/).catch(() => {})
  verifier((await page.title()).startsWith('Fiches de mathématiques'), 'titre du document')
  const n = await cartes(page).count()
  verifier(/CE1/.test(await page.getByRole('status').filter({ hasText: /fiche/ }).first().textContent()), `compteur annoncé (${n} fiche(s) pour CE1)`)
  verifier(await page.getByRole('group', { name: 'Langue' }).count() === 0, 'mode français : pas de filtre de langue')
  const domaine = page.getByRole('combobox', { name: 'Domaine' })
  verifier(await domaine.count() === 1 && /Tous les domaines/.test(await domaine.locator('option').first().textContent()) && await domaine.locator('option').count() >= 2, 'filtre « Domaine » : liste déroulante avec « Tous les domaines »')
  await domaine.selectOption({ index: 1 })
  verifier(await cartes(page).count() > 0, 'filtrer sur un domaine garde ses fiches')
  await domaine.selectOption('')
  verifier(await page.getByRole('button', { name: 'CE1', exact: true }).getAttribute('aria-pressed') === 'true', 'la classe du contexte est choisie')
  await page.getByRole('button', { name: /Toutes les classes/ }).click()
  const toutes = await cartes(page).count()
  verifier(toutes > n, `« Toutes les classes » : ${toutes} fiches`)
  await page.getByRole('button', { name: /À afficher/ }).click()
  verifier(await cartes(page).count() > 0 && await cartes(page).count() < toutes, 'filtre d\'usage')
  await page.getByRole('button', { name: /^🌐 Tous$/ }).click()
  await page.getByRole('searchbox').fill('zzzz')
  verifier(await cartes(page).count() === 0 && await page.getByRole('button', { name: 'Tout réinitialiser' }).count() === 1, 'aucun résultat : message et bouton')
  await page.getByRole('button', { name: 'Tout réinitialiser' }).click()
  verifier(await cartes(page).count() === n, 'réinitialiser rend la classe et les résultats de départ')
  await page.getByRole('button', { name: /Liste/ }).click()
  await page.locator('table').waitFor()
  verifier(await page.locator('tbody tr').count() === n, 'présentation « Liste » : une ligne par fiche')
  await page.goto(app('/maths/fiches?classes=ce1&vue=cartes'))
  await cartes(page).first().waitFor()
  verifier(await page.locator('table').count() === 0, 'l\'adresse impose la présentation (cartes)')
  verifier(!erreurs.length, `aucune erreur JavaScript${erreurs.length ? ` (${erreurs[0]})` : ''}`)
  await ctx.close()
}

console.log('Langue : seulement en mode bilingue')
{
  const { ctx, page } = await ouvrir({ regionale: 'br' })
  await page.goto(app('/maths/fiches?mode=bi&classes=ce1'))
  await cartes(page).first().waitFor({ timeout: 10000 })
  const groupe = page.getByRole('group', { name: 'Langue' })
  verifier(await groupe.count() === 1, 'mode bilingue : le filtre de langue apparaît')
  // une carte : aucun drapeau en français seul, le drapeau de la langue régionale seule, les deux pour la version bilingue (même titre)
  const slugs = await cartes(page).evaluateAll(cs => cs.map(c => ({ href: c.querySelector('a[href*="/telechargements/"]')?.getAttribute('href') ?? '', drapeaux: c.querySelectorAll('.drapeaux > *').length, langues: (c.querySelector('a[href*="/telechargements/"]')?.getAttribute('href') ?? '').match(/-(fr-br|br)\/?$/)?.[1] ?? 'fr' })))
  const attendus = { fr: 0, br: 1, 'fr-br': 2 }
  verifier(slugs.length > 0 && slugs.every(c => c.drapeaux === attendus[c.langues]), 'une carte : aucun drapeau en français seul, un en breton, deux en bilingue')
  const avant = await cartes(page).count()
  const codes = await groupe.getByRole('button').evaluateAll(bs => bs.map(b => b.querySelector('[aria-hidden="true"]:not(.drapeaux)')?.textContent?.trim() ?? ''))
  verifier(codes.includes('FR') && codes.includes('BR') && await groupe.locator('.drapeau').count() >= 2, `filtre de langue : drapeaux et codes FR / BR (${codes.join(' | ')})`)
  await groupe.getByRole('button').nth(2).click()
  verifier(await cartes(page).count() < avant && await cartes(page).count() > 0, 'filtrer sur une langue réduit la liste')
  await page.goto(app('/maths/fiches?mode=reg&classes=ce1'))
  await cartes(page).first().waitFor({ timeout: 10000 })
  verifier(await page.getByRole('group', { name: 'Langue' }).count() === 0, 'langue régionale seule : pas de filtre de langue')
  await ctx.close()
}

console.log('Index /telechargements')
{
  const { ctx, page } = await ouvrir()
  await page.goto(app('/telechargements?vue=liste&classes=ps,ms,gs,cp,ce1,ce2,cm1,cm2'))
  await page.locator('table').first().waitFor({ timeout: 10000 })
  verifier(/Toutes les fiches à imprimer/.test(await page.locator('h1').textContent()) && await page.locator('main h2').count() >= 1, 'index par matière')
  const titres = await page.locator('section.matiere').first().locator('tbody td.c-titre strong').allTextContents()
  verifier(titres.length > 1 && titres.join('|') === [...titres].sort((a, b) => a.localeCompare(b, 'fr')).join('|'), 'ordre alphabétique')
  // la classe de l'adresse filtre l'index, présenté en cartes (comme la page d'une matière)
  await page.goto(app('/telechargements?classes=cp&vue=cartes'))
  await page.locator('article.carte').first().waitFor({ timeout: 10000 })
  verifier(await page.locator('table').count() === 0, 'index : cartes par défaut')
  verifier((await page.locator('.compteur, [role=status]').first().textContent()).includes('CP'), 'index : la classe de l\'adresse est appliquée')
  await ctx.close()
}

console.log('Feuille ouverte à froid')
{
  const { ctx, page, erreurs } = await ouvrir()
  await page.goto(app(`/telechargements/${SLUG}`))
  await pret(page)
  await page.locator('.apercu img').waitFor()
  await titreQui(page, /^Suites de nombres/).catch(() => {})
  verifier(/Suites de nombres/.test(await page.locator('h1').textContent()) && (await page.title()).startsWith('Suites de nombres'), 'titre et titre du document')
  const fil = await page.locator('nav.fil li').allTextContents()
  verifier(fil.length === 4 && /Accueil/.test(fil[0]) && /Maths/.test(fil[1]) && /Fiches toutes prêtes/.test(fil[2]) && /Suites de nombres/.test(fil[3]), `fil d'Ariane : Accueil › Matière › Fiches toutes prêtes › titre (${fil.join(' › ')})`)
  verifier(await page.locator('nav.fil li a', { hasText: 'Fiches toutes prêtes' }).getAttribute('href').then(h => h.endsWith('/maths/fiches')), 'le maillon « Fiches toutes prêtes » mène à la sous-page de la matière')
  verifier(/^🛠/.test((await page.getByRole('link', { name: /Personnaliser/ }).textContent()).trim()), 'Personnaliser : 🛠')
  verifier(await page.getByRole('group', { name: 'Exemplaires de la fiche' }).getByRole('button').first().textContent().then(s => /Exemplaire 1/.test(s)), 'les variantes s’appellent « Exemplaire n »')
  const dl = page.getByRole('link', { name: /Télécharger/ }), imp = page.getByRole('button', { name: /Imprimer/ })
  const href = await dl.getAttribute('href')
  const r = await page.request.get(new URL(href, page.url()).href)
  verifier(/\.pdf$/.test(href) && r.ok() && (await r.body()).subarray(0, 4).toString() === '%PDF', 'Télécharger : lien vers le PDF existant')
  verifier(await imp.count() === 1 && await page.getByRole('group', { name: 'Format' }).count() === 0, 'Imprimer : bouton séparé ; un seul format : pas de choix')
  await imp.click()
  const cadre = page.locator('iframe[aria-hidden="true"]')
  verifier(await cadre.count() === 1 && /\.pdf$/.test(await cadre.getAttribute('src')), 'Imprimer charge le PDF dans un cadre caché')
  verifier(await page.getByRole('link', { name: /Personnaliser/ }).evaluate(a => /mode=imprimer/.test(a.href)), 'Personnaliser : lien vers l\'exercice avec ses réglages')
  verifier(await page.locator('a[href^="/competence/"], a[href*="/competence/"]').count() > 0, 'compétences : liens vers /competence/<id>')
  // même fiche dans une autre langue : lien vers l'entrée sœur
  const soeur = page.locator('.langues a')
  verifier(await soeur.count() === 1 && /-br$/.test(await soeur.getAttribute('href')), '« Même fiche » : lien vers l\'entrée en breton (langues de l\'index)')
  await soeur.click()
  await page.waitForURL(/-br$/)
  await page.locator('.langues [aria-current]').waitFor()
  verifier(await page.locator('.langues [aria-current]').count() === 1, 'la langue courante n\'est pas un lien')
  verifier(!erreurs.length, `aucune erreur JavaScript${erreurs.length ? ` (${erreurs[0]})` : ''}`)
  // affiche : deux formats de PDF
  await page.goto(app('/telechargements/affiche-exemple-jusqua6'))
  await pret(page)
  const formats = page.getByRole('group', { name: 'Format' })
  await formats.waitFor()
  const h0 = await page.getByRole('link', { name: /Télécharger/ }).getAttribute('href')
  await formats.getByRole('button', { name: 'A3' }).click()
  verifier(await page.getByRole('link', { name: /Télécharger/ }).getAttribute('href') !== h0, 'plusieurs formats : le choix change le PDF')
  // le sens : proposé avec le format, garde le format choisi
  const sens = page.getByRole('group', { name: 'Sens' })
  await sens.waitFor()
  const h1 = await page.getByRole('link', { name: /Télécharger/ }).getAttribute('href')
  const avant = await sens.getByRole('button', { pressed: false }).first().textContent()
  await sens.getByRole('button', { pressed: false }).first().click()
  verifier(await page.getByRole('link', { name: /Télécharger/ }).getAttribute('href') !== h1, `le sens (${avant}) change le PDF`)
  verifier(await formats.getByRole('button', { name: 'A3' }).getAttribute('aria-pressed') === 'true', 'changer de sens garde le format')
  await ctx.close()
}

console.log('Aperçu multipage au clavier')
{
  const { ctx, page } = await ouvrir()
  await page.route(`**/fiches/${SLUG}.json`, async r => {
    const reponse = await r.fetch()
    const j = await reponse.json()
    j.variantes[0].pages = [0, 1, 2].map(() => j.variantes[0].pages[0])
    await r.fulfill({ response: reponse, json: j })
  })
  await page.goto(app(`/telechargements/${SLUG}`))
  await pret(page)
  const pos = page.locator('.position')
  const suiv = page.getByRole('button', { name: 'Page suivante' }), prec = page.getByRole('button', { name: 'Page précédente' })
  await pos.waitFor()
  verifier(/Page 1 sur 3/.test(await pos.textContent()) && await pos.getAttribute('aria-live') === 'polite' && await prec.getAttribute('aria-disabled') === 'true', 'page 1 sur 3, annoncée, ◀ inactif')
  await suiv.click()
  verifier(/Page 2 sur 3/.test(await pos.textContent()), '▶')
  await suiv.focus()
  await page.keyboard.press('ArrowRight')
  verifier(/Page 3 sur 3/.test(await pos.textContent()) && await suiv.getAttribute('aria-disabled') === 'true', 'flèche droite ; ▶ inactif à la fin mais toujours focalisable')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowLeft')
  verifier(/Page 2 sur 3/.test(await pos.textContent()), 'flèche gauche (bornée)')
  await ctx.close()
}

console.log('Voisines et jeu lié (site avec le catalogue de développement)')
{
  const { ctx, page } = await ouvrir()
  await page.goto(appDev(`/telechargements/${SLUG}`))
  await pret(page)
  await page.getByRole('heading', { name: 'Même compétence' }).waitFor({ timeout: 15000 })
  const memeComp = await page.locator('h3', { hasText: 'Même compétence' }).locator('xpath=following-sibling::ul[1]//article//h4').allTextContents()
  verifier(memeComp.length > 0, `fiches de la même compétence (${memeComp.length})`)
  verifier((await page.locator('ul.grille article').allTextContents()).some(t => /CP|CE2/.test(t)), 'voisines sans filtre de classe (d\'autres classes y sont)')
  verifier(await page.getByRole('heading', { name: /Même domaine/ }).count() === 1, 'liste « Même domaine »')
  verifier(await page.getByRole('link', { name: /Faire en ligne/ }).count() === 1, '« Faire en ligne » : l\'exercice lié existe')
  await ctx.close()
}

console.log('États : absent, vide, fiche inconnue')
for (const [nom, repondre, attendu] of [
  ['absent', r => r.fulfill({ status: 404, body: 'x' }), /introuvable/],
  ['vide', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ version: 1, genereLe: '2026-10-05T00:00:00Z', site: 'x', filtres: { classes: [], langues: [], usages: [], domaines: [] }, entrees: [] }) }), /arrivent/],
]) {
  const { ctx, page } = await ouvrir()
  await page.route('**/fiches/index.json', repondre)
  await page.goto(app('/maths/fiches'))
  await page.locator('p[role="status"], div[role="alert"]').filter({ hasText: attendu }).waitFor({ timeout: 10000 }).then(
    () => verifier(true, `index ${nom} : message, pas de cartes`), () => verifier(false, `index ${nom} : message`))
  verifier(await cartes(page).count() === 0, `index ${nom} : aucune carte`)
  await ctx.close()
}
{
  const { ctx, page } = await ouvrir()
  await page.goto(app('/telechargements/n-existe-pas'))
  await page.getByRole('alert').waitFor({ timeout: 10000 })
  verifier(/n’existe pas/.test(await page.getByRole('alert').textContent()), 'fiche inconnue : message et lien vers la liste')
  await ctx.close()
}

console.log('Accessibilité (axe)')
for (const langue of ['fr', 'br']) for (const largeur of [360, 1280]) {
  const { ctx, page } = await ouvrir({ langue, largeur, regionale: langue === 'br' ? 'br' : undefined })
  for (const [nom, route, attente] of [
    ['liste', '/maths/fiches?mode=bi&classes=ce1&vue=cartes', 'article.carte'], ['liste en tableau', '/maths/fiches?vue=liste', 'table'],
    ['index', '/telechargements?vue=liste&classes=ps,ms,gs,cp,ce1,ce2,cm1,cm2', 'table'], ['index en cartes', '/telechargements?vue=cartes&classes=ps,ms,gs,cp,ce1,ce2,cm1,cm2', 'article.carte'], ['feuille', `/telechargements/${SLUG}`, '.apercu img'],
  ]) {
    await page.goto(app(route))
    await page.locator(attente).first().waitFor({ timeout: 10000 })
    await verifierAxe(page, `${nom} (${langue}, ${largeur})`, { inclure: [['main#contenu']] })
  }
  await ctx.close()
}

console.log('Liens directs : le filtre d\'usage et « toutes les classes » dans l\'adresse')
{
  const { ctx, page, erreurs } = await ouvrir()
  const pressed = nom => page.getByRole('button', { name: nom, exact: true }).getAttribute('aria-pressed')
  await page.goto(app('/maths/fiches?classes=ce1&usage=afficher'))
  await cartes(page).first().waitFor({ timeout: 10000 })
  verifier(await pressed(/À afficher/) === 'true' && (await cartes(page).locator('.badge', { hasText: /À afficher|Pour s/ }).allTextContents()).every(b => /À afficher/.test(b)), '?usage=afficher : le filtre est posé, seules les affiches sont montrées')
  await page.goto(app('/maths/fiches?classes=ce1&usage=sentrainer'))
  await cartes(page).first().waitFor({ timeout: 10000 })
  verifier(await pressed(/Pour s.entraîner/) === 'true', '?usage=sentrainer : le filtre « pour s’entraîner » est posé')
  await page.getByRole('button', { name: /^🌐 Tous$/ }).click()
  await page.waitForFunction(() => !location.search.includes('usage'))
  verifier(new URL(page.url()).searchParams.get('classes') === 'ce1', 'enlever le filtre retire le paramètre, la classe reste')
  await page.getByRole('button', { name: /À afficher/ }).click()
  await page.waitForFunction(() => location.search.includes('usage=afficher'))
  verifier(true, 'choisir « À afficher » l\'écrit dans l\'adresse (lien à partager)')
  await page.getByRole('button', { name: 'CE2', exact: true }).click()
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some(b => b.textContent.trim() === 'CE2' && b.getAttribute('aria-pressed') === 'true'))
  verifier(new URL(page.url()).searchParams.get('usage') === 'afficher', 'un changement de classe garde le filtre d\'usage dans l\'adresse')
  // toutes les matières : /telechargements, avec les mêmes paramètres
  await page.goto(app('/telechargements?toutes=oui&usage=afficher'))
  await page.locator('h1').waitFor()
  verifier(await pressed(/Toutes les classes/) === 'true' && await pressed(/À afficher/) === 'true', '/telechargements?toutes=oui&usage=afficher : toutes les matières, toutes les classes, affiches')
  await page.getByRole('button', { name: 'CE1', exact: true }).click()
  await page.waitForFunction(() => !location.search.includes('toutes'))
  verifier(true, 'choisir une classe retire « toutes les classes » de l\'adresse')
  verifier(!erreurs.length, `sans erreur JavaScript${erreurs.length ? ` (${erreurs[0]})` : ''}`)
  await ctx.close()
}

await nav.close()
process.exit(nbEchecs() ? 1 : 0)
