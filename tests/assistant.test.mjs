// Visite guidée de la première visite (src/shell/AssistantAccueil.vue) dans Chrome : quand elle s'ouvre (appareil neuf, sur
// l'accueil seulement, pas sur une adresse qui porte un réglage, pas si un profil est déjà mémorisé), fenêtre modale accessible
// (focus dedans, Tab qui tourne, Échap, reste du site inerte, axe), parcours parent et enseignant (halo sur le bon bouton de la
// barre, au téléphone sur le ☰), réglages faits depuis la fenêtre, « déjà vu » mémorisé, « Revoir » depuis les réglages,
// interface en breton et site skoolik. Les autres tests ne la voient pas : tests/outils.mjs (`contexte`) la marque comme vue.
//   TEST_URL=http://localhost:5173/ecole-primaire/ node tests/assistant.test.mjs
import { lancerNavigateur, contexte, surveiller, verifier, nbEchecs, app, appDev } from './outils.mjs'
import { verifierAxe } from './outils-axe.mjs'

const URL_SKOOLIK = process.env.TEST_URL_SKOOLIK && process.env.TEST_URL_SKOOLIK.replace(/\/?$/, '/')
const nav = await lancerNavigateur()
const FENETRE = '[data-assistant]'

/** Une page sur un appareil neuf (la visite guidée n'a jamais été vue). */
async function ouvrir({ route = '/', langue = 'fr', largeur = 1280, base = app, avant } = {}) {
  const ctx = await contexte(nav, { langue, viewport: { width: largeur, height: 860 }, assistant: true })
  if (avant) await ctx.addInitScript(avant)
  const page = await ctx.newPage()
  const erreurs = surveiller(page)
  await page.goto(base(route))
  await page.waitForSelector('header.nav')
  return { ctx, page, erreurs }
}
const ouverte = page => page.waitForSelector(FENETRE, { timeout: 5000 }).then(() => true).catch(() => false)
const titre = page => page.locator(`${FENETRE} h2`).textContent()
const suivant = page => page.locator(`${FENETRE} .btn-primary`).click()
/** Le repère de la barre entouré par le halo : celui dont le rectangle est au centre du halo. */
const repereEntoure = page => page.evaluate(() => {
  const halo = document.querySelector('.assistant .halo')?.getBoundingClientRect()
  if (!halo) return null
  const x = halo.left + halo.width / 2
  const y = halo.top + halo.height / 2
  const sous = [...document.querySelectorAll('[data-repere]')].find(el => {
    const r = el.getBoundingClientRect()
    return r.width > 0 && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
  })
  return sous?.getAttribute('data-repere') ?? null
})
const debordement = page => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
const memorise = (page, cle) => page.evaluate(c => localStorage.getItem(`ep_${c}`), cle)
/** La fenêtre a fini de bouger : le halo est mesuré après le rendu (nextTick), deux images plus tard il est en place */
const pose = page => page.evaluate(() => new Promise(fini => { requestAnimationFrame(() => requestAnimationFrame(() => fini())) }))

// ── 1. quand elle s'ouvre ──
console.log('Ouverture')
{
  const { ctx, page, erreurs } = await ouvrir()
  verifier(await ouverte(page), 'appareil neuf, accueil : la visite guidée s’ouvre')
  const etat = await page.evaluate(sel => {
    const f = document.querySelector(sel)
    return {
      role: f?.getAttribute('role'), modale: f?.getAttribute('aria-modal'),
      titre: document.getElementById(f?.getAttribute('aria-labelledby') ?? '')?.textContent ?? '',
      focusDedans: f?.contains(document.activeElement) ?? false, inerte: document.getElementById('app')?.inert ?? false,
    }
  }, FENETRE)
  verifier(etat.role === 'dialog' && etat.modale === 'true' && /Bienvenue/.test(etat.titre), `fenêtre modale titrée (« ${etat.titre} »)`)
  verifier(etat.focusDedans && etat.inerte, 'le focus est dans la fenêtre, le reste du site est inerte')
  // Tab tourne dans la fenêtre (aller et retour)
  let toujoursDedans = true
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press(i < 5 ? 'Tab' : 'Shift+Tab')
    toujoursDedans &&= await page.evaluate(sel => document.querySelector(sel).contains(document.activeElement), FENETRE)
  }
  verifier(toujoursDedans, 'Tab et Maj+Tab restent dans la fenêtre')
  await verifierAxe(page, 'visite guidée, étape 1 (fr, 1280)')
  await page.keyboard.press('Escape')
  verifier(await page.locator(FENETRE).count() === 0 && !await page.evaluate(() => document.getElementById('app').inert), 'Échap ferme la fenêtre et rend le site')
  verifier(await memorise(page, 'assistant_vu') === 'true', 'fermée : mémorisée comme vue')
  await page.reload()
  await page.waitForSelector('[data-page="accueil"]')
  verifier(!await ouverte(page), 'rechargée : elle ne s’ouvre plus')
  verifier(!erreurs.length, `sans erreur JavaScript${erreurs.length ? ` (${erreurs[0]})` : ''}`)
  await ctx.close()
}
for (const [nom, options] of [
  ['une autre page que l’accueil', { route: '/maths' }],
  ['une adresse qui porte un réglage (lien pour les familles)', { route: '/?classes=cm1' }],
  ['un profil déjà mémorisé', { avant: () => localStorage.setItem('ep_profil', '"parent"') }],
]) {
  const { ctx, page } = await ouvrir(options)
  await page.waitForSelector('main h1')
  verifier(!await ouverte(page), `pas de visite guidée sur ${nom}`)
  await ctx.close()
}

// ── 2. parcours parent, à 1280 et 390 px ──
for (const largeur of [1280, 390]) {
  console.log(`Parcours parent (${largeur} px)`)
  const { ctx, page, erreurs } = await ouvrir({ largeur })
  await ouverte(page)
  await page.locator(`${FENETRE} .option`, { hasText: 'Parent' }).click()
  await pose(page)
  verifier(await memorise(page, 'profil') === '"parent"', 'choisir « Parent » règle le profil')
  verifier(/classe de votre enfant/.test(await titre(page)) && await repereEntoure(page) === 'classe', 'étape 2 : la classe, halo sur le bouton « Classe »')
  verifier(await page.evaluate(sel => document.querySelector(sel).contains(document.activeElement), FENETRE), 'le focus suit l’étape (titre)')
  await page.locator(`${FENETRE} .pastille`, { hasText: /^CE2$/ }).click()
  await page.waitForFunction(() => localStorage.getItem('ep_classes')?.includes('ce2'))
  verifier(true, 'une classe choisie dans la fenêtre est mémorisée')
  verifier(await debordement(page) <= 0, 'aucun débordement horizontal')
  if (largeur === 390) await verifierAxe(page, 'visite guidée, étape classe (fr, 390)')
  await suivant(page)
  await pose(page)
  const attendu = largeur === 390 ? 'menu' : 'profil'
  verifier(/mode enfant/.test(await titre(page)) && await repereEntoure(page) === attendu, `étape 3 : le mode enfant, halo sur ${attendu === 'menu' ? 'le ☰' : 'la pastille de profil'}`)
  verifier(largeur === 1280 || await page.locator(`${FENETRE} .telephone`).count() === 1, 'au téléphone : la fenêtre dit que le réglage est dans le ☰')
  await suivant(page)
  verifier(/C’est parti/.test(await titre(page)), 'étape 4 : la fin')
  await page.locator(FENETRE).getByRole('button', { name: /mode enfant/ }).click()
  verifier(await page.locator(FENETRE).count() === 0 && await memorise(page, 'profil') === '"enfant"', '« Passer en mode enfant » ferme la fenêtre et passe en profil enfant')
  verifier(!erreurs.length, `sans erreur JavaScript${erreurs.length ? ` (${erreurs[0]})` : ''}`)
  await ctx.close()
}

// ── 3. parcours enseignant ──
for (const largeur of [1280, 390]) {
  console.log(`Parcours enseignant (${largeur} px)`)
  const { ctx, page, erreurs } = await ouvrir({ largeur })
  await ouverte(page)
  await page.locator(`${FENETRE} .option`, { hasText: 'Enseignant' }).click()
  await pose(page)
  verifier(/Vos classes/.test(await titre(page)) && await repereEntoure(page) === 'classe', 'étape 2 : les classes, halo sur « Classe »')
  await page.locator(`${FENETRE} .pastille`, { hasText: /^CE2$/ }).click()
  await page.waitForFunction(() => localStorage.getItem('ep_classes') === '["ce1","ce2"]')
  verifier(true, 'plusieurs classes choisies dans la fenêtre')
  await suivant(page)
  await pose(page)
  const langue = largeur === 390 ? 'menu' : 'langue'
  verifier(/breton/.test(await titre(page)) && await repereEntoure(page) === langue, `étape 3 : la langue régionale, halo sur ${langue}`)
  await page.locator(FENETRE).getByRole('button', { name: /Français \+ Brezhoneg/ }).click()
  await page.waitForFunction(() => localStorage.getItem('ep_mode') === '"bilingue"')
  verifier(true, 'le mode « Français + langue » se choisit dans la fenêtre')
  await suivant(page)
  await pose(page)
  const programme = largeur === 390 ? 'menu' : 'programme'
  verifier(/compétence précise/.test(await titre(page)) && await repereEntoure(page) === programme, `étape 4 : le Programme, halo sur ${programme}`)
  if (largeur === 1280) await verifierAxe(page, 'visite guidée, étape programme (fr, 1280)')
  await suivant(page)
  verifier(/5 sur 5|5 war 5/.test(await page.locator(`${FENETRE} .progression`).textContent()), 'cinq étapes pour un·e enseignant·e')
  await page.locator(FENETRE).getByRole('button', { name: /Ouvrir le programme/ }).click()
  await page.waitForSelector('[data-page="programme"]')
  verifier(await page.locator(FENETRE).count() === 0, '« Ouvrir le programme » ferme la fenêtre et mène au Programme')
  verifier(!erreurs.length, `sans erreur JavaScript${erreurs.length ? ` (${erreurs[0]})` : ''}`)
  await ctx.close()
}

// ── 4. revoir depuis les réglages ; « Passer » ──
console.log('Revoir, passer')
{
  const { ctx, page } = await ouvrir({ route: '/parametres', avant: () => localStorage.setItem('ep_assistant_vu', 'true') })
  await page.waitForSelector('[data-page="reglages"]')
  await page.getByRole('button', { name: /Revoir la visite guidée/ }).click()
  verifier(await ouverte(page) && new URL(page.url()).pathname.endsWith('/'), '« Revoir la visite guidée » ouvre la fenêtre sur l’accueil')
  await page.locator(FENETRE).getByRole('button', { name: 'Passer la visite' }).click()
  verifier(await page.locator(FENETRE).count() === 0, '« Passer la visite » la ferme')
  await ctx.close()
}
{
  // page /dev (site de développement seulement ; un site de production n'a pas cette page) : le lien rouvre la visite même déjà vue
  const { ctx, page } = await ouvrir({ route: '/dev', base: appDev, avant: () => localStorage.setItem('ep_assistant_vu', 'true') })
  await page.waitForSelector('main h1')
  const lien = page.getByRole('button', { name: /Visite guidée de l’accueil/ })
  if (await lien.count()) {
    await lien.click()
    verifier(await ouverte(page), '/dev : « Visite guidée de l’accueil » la rouvre, même déjà vue')
  } else console.log('  (pas de page /dev sur ce site : vérification ignorée)')
  await ctx.close()
}

// ── 5. interface en breton, téléphone étroit ──
console.log('Breton, 320 px')
{
  const { ctx, page, erreurs } = await ouvrir({ langue: 'br', largeur: 320 })
  verifier(await ouverte(page) && /Degemer/.test(await titre(page)), 'interface en breton : la fenêtre est en breton')
  await page.locator(`${FENETRE} .option`).first().click()
  await pose(page)
  verifier(await debordement(page) <= 0, 'à 320 px : aucun débordement horizontal')
  const dansLEcran = await page.evaluate(sel => { const r = document.querySelector(sel).getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth }, FENETRE)
  verifier(dansLEcran, 'à 320 px : la bulle tient dans la largeur de l’écran')
  verifier(!erreurs.length, `sans erreur JavaScript${erreurs.length ? ` (${erreurs[0]})` : ''}`)
  await ctx.close()
}

// ── 6. skoolik ──
if (URL_SKOOLIK) {
  console.log('skoolik')
  const { ctx, page, erreurs } = await ouvrir({ base: route => `${URL_SKOOLIK}${route.replace(/^\//, '')}` })
  verifier(await ouverte(page) && /Skoolik/.test(await titre(page)), 'skoolik : la visite guidée s’ouvre, au nom du site')
  await page.locator(`${FENETRE} .option`, { hasText: 'Enseignant' }).click()
  await suivant(page)
  await pose(page)
  verifier(/breton/.test(await titre(page)) && await page.locator(`${FENETRE} [aria-pressed="true"]`, { hasText: /Brezhoneg/ }).count() === 1, 'skoolik : étape de la langue, « Français + Brezhoneg » déjà actif')
  verifier(!erreurs.length, `sans erreur JavaScript${erreurs.length ? ` (${erreurs[0]})` : ''}`)
  await ctx.close()
}

await nav.close()
process.exit(nbEchecs() ? 1 : 0)
