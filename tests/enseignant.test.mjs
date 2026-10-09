// Le mode « enseignant », caché par défaut (idée en construction, pas encore validée) : absent du choix du profil, de l'accueil et de la barre
// tant que l'appareil ne l'a pas activé par l'adresse spéciale `?enseignant=oui` ; `?enseignant=non` le cache de nouveau. Un bandeau confirme.
//   TEST_URL=http://localhost:5173/ecole-primaire/ node tests/enseignant.test.mjs
import { lancerNavigateur, contexte, surveiller, verifier, nbEchecs, app } from './outils.mjs'
import { verifierAxe } from './outils-axe.mjs'

const nav = await lancerNavigateur()

async function ouvrir(route, { avant } = {}) {
  const ctx = await contexte(nav, { langue: 'fr', viewport: { width: 1280, height: 800 } })
  if (avant) await ctx.addInitScript(avant)
  const page = await ctx.newPage()
  const erreurs = surveiller(page)
  await page.goto(app(route))
  await page.waitForSelector('header.nav')
  return { ctx, page, erreurs }
}
const optionsProfil = async page => {
  await page.getByRole('button', { name: /^Profil :/ }).click()
  const noms = await page.locator('#menu-profil .option strong').allTextContents()
  await page.keyboard.press('Escape')
  return noms
}
const memorise = (page, cle) => page.evaluate(c => localStorage.getItem(`ep_${c}`), cle)
const rubriques = page => page.locator('nav.rubriques a').allTextContents()

// ── 1. appareil neuf : le mode enseignant n'existe pas ──
{
  console.log('Appareil neuf')
  const { ctx, page, erreurs } = await ouvrir('/')
  verifier((await optionsProfil(page)).join() === 'Enfant,Parent', 'le menu du profil ne propose que Enfant et Parent')
  verifier(await page.getByRole('button', { name: /^enseignant$/ }).count() === 0 && await page.locator('.profil .choix').count() === 2, 'le choix du profil de l\'accueil ne propose pas « enseignant »')
  verifier(await page.locator('[data-bandeau-enseignant]').count() === 0, 'aucun bandeau')
  verifier(!erreurs.length, 'sans erreur JavaScript')
  await ctx.close()
}

// ── 2. un profil « enseignant » mémorisé, mode caché : on retombe sur le parent ──
{
  console.log('Profil enseignant mémorisé, mode caché')
  const { ctx, page } = await ouvrir('/', { avant: () => localStorage.setItem('ep_profil', '"enseignant"') })
  verifier((await page.getByRole('button', { name: /^Profil :/ }).getAttribute('aria-label')).includes('Parent'), 'le profil appliqué est « Parent »')
  verifier(!(await rubriques(page)).some(t => /Programme/.test(t)), 'pas d\'entrée « Programme » dans la barre')
  verifier(await memorise(page, 'profil') === '"enseignant"', 'le profil mémorisé n\'est pas effacé (il revient si le mode est activé)')
  await ctx.close()
}

// ── 3. l'adresse spéciale active le mode ──
{
  console.log('Adresse spéciale ?enseignant=oui')
  const { ctx, page, erreurs } = await ouvrir('/maths?enseignant=oui')
  await page.waitForFunction(() => !location.search.includes('enseignant'))
  const adresse = new URL(page.url())
  verifier(!adresse.searchParams.has('enseignant') && adresse.pathname.endsWith('/maths'), `le paramètre est retiré de l'adresse (${adresse.pathname}${adresse.search})`)
  const bandeau = page.locator('[data-bandeau-enseignant]')
  await bandeau.waitFor()
  const texte = await bandeau.innerText()
  verifier(/activé/.test(texte) && /idée en construction/.test(texte) && /relus avec des enseignants/.test(texte), 'le bandeau dit que c\'est une idée en construction à relire')
  verifier(await memorise(page, 'enseignant') === 'true', 'réglage mémorisé sur l\'appareil')
  await verifierAxe(page, 'bandeau du mode enseignant')
  const noms = await optionsProfil(page)
  verifier(noms.join() === 'Enfant,Parent,Enseignant', 'le menu du profil propose maintenant Enseignant')
  await page.getByRole('button', { name: /^Profil :/ }).click()
  const description = await page.locator('#menu-profil .option', { hasText: 'Enseignant' }).innerText()
  verifier(/en construction/.test(description), 'l\'option dit que c\'est une idée en construction')
  await page.locator('#menu-profil .option', { hasText: 'Enseignant' }).click()
  await page.waitForSelector('nav.rubriques a[href$="/programme"]')
  verifier(true, 'le profil Enseignant est choisissable : entrée « Programme » dans la barre')
  await bandeau.getByRole('button', { name: 'J’ai compris' }).click()
  verifier(await bandeau.count() === 0, 'le bandeau se ferme')
  // les notices : pastille « bêta » sur le profil, bandeau « en construction » sur les pages de l'enseignant
  verifier((await page.locator('header.nav .beta').innerText()).toLowerCase() === 'bêta', 'la pastille « bêta » est sur le profil')
  verifier(/en construction/.test(await page.getByRole('button', { name: /^Profil :/ }).getAttribute('aria-label')), 'le nom accessible du profil dit que c\'est une idée en construction')
  await page.goto(app('/programme'))
  await page.waitForSelector('[data-page="programme"]')
  verifier(/pas encore validée ni relue/.test(await page.locator('[data-construction]').innerText()) && await page.locator('[data-construction] a[href^="mailto:"]').count() === 1, 'la page Programme rappelle « idée en construction », avec un lien pour donner un avis')
  await page.goto(app('/'))
  await page.waitForSelector('[data-page="accueil"]')
  verifier(await page.locator('[data-construction]').count() === 1, 'l\'accueil de l\'enseignant a le rappel aussi')
  await page.reload()
  await page.waitForSelector('header.nav')
  verifier(await page.locator('[data-bandeau-enseignant]').count() === 0 && (await optionsProfil(page)).includes('Enseignant'), 'au rechargement : mode toujours actif, sans bandeau')
  verifier(!erreurs.length, `sans erreur JavaScript${erreurs.length ? ` (${erreurs[0]})` : ''}`)

  // ── 4. le désactiver ──
  console.log('Adresse spéciale ?enseignant=non')
  await page.goto(app('/?enseignant=non'))
  await page.waitForSelector('[data-bandeau-enseignant]')
  verifier(/désactivé/.test(await page.locator('[data-bandeau-enseignant]').innerText()), 'le bandeau confirme la désactivation')
  verifier((await optionsProfil(page)).join() === 'Enfant,Parent' && await memorise(page, 'enseignant') === 'false', 'le mode est caché de nouveau')
  verifier((await page.getByRole('button', { name: /^Profil :/ }).getAttribute('aria-label')).includes('Parent') && !(await rubriques(page)).some(t => /Programme/.test(t)), 'le profil enseignant mémorisé retombe sur « Parent »')
  await ctx.close()
}

// ── 4b. la page des réglages : une section pour l'afficher ou le cacher, avec l'explication ──
{
  console.log('Page des réglages')
  const { ctx, page } = await ouvrir('/parametres?onglet=moi')
  const section = page.locator('[data-section="enseignant"]')
  verifier(/idée en construction/.test(await section.innerText()) && /relus avec des enseignants/.test(await section.innerText()), 'la section explique que c\'est une idée en construction')
  const case_ = section.locator('input[type="checkbox"]')
  verifier(!await case_.isChecked() && (await optionsProfil(page)).join() === 'Enfant,Parent', 'appareil neuf : case décochée, pas de profil Enseignant')
  await case_.check()
  verifier(await memorise(page, 'enseignant') === 'true' && (await optionsProfil(page)).join() === 'Enfant,Parent,Enseignant', 'cocher la case propose le profil Enseignant')
  await case_.uncheck()
  verifier(await memorise(page, 'enseignant') === 'false' && (await optionsProfil(page)).join() === 'Enfant,Parent', 'décocher le cache de nouveau')
  await verifierAxe(page, 'réglages avec la section du mode enseignant', { inclure: [['[data-section="enseignant"]']] })
  await ctx.close()
}

// ── 5. une valeur inconnue ne change rien ──
{
  const { ctx, page } = await ouvrir('/?enseignant=peutetre')
  verifier(await page.locator('[data-bandeau-enseignant]').count() === 0 && (await optionsProfil(page)).join() === 'Enfant,Parent' && await memorise(page, 'enseignant') === null, '?enseignant=<autre chose> : rien ne change')
  await ctx.close()
}

await nav.close()
process.exit(nbEchecs() ? 1 : 0)
