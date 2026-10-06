// L'enveloppe du site dans Chrome : barre de navigation (1280, 360 et 320 px : rien ne déborde, axe sans violation critique ou
// sérieuse, menus ouverts compris), sélecteurs au clavier, cadenas de la classe de l'enfant (appui long de 2 s, souris et
// clavier), modes de langue (adresse, titre, onglets), profils (nombre de classes, entrées de la barre), « Retour en français »,
// pied de page. La barre et le pied de page sont seuls analysés par axe (le contenu des pages a ses propres tests).
//   TEST_URL=http://localhost:5173/ecole-primaire/ node tests/pages-shell.test.mjs
import { lancerNavigateur, contexte, surveiller, verifier, nbEchecs, app } from './outils.mjs'
import { verifierAxe } from './outils-axe.mjs'

const URL_SKOOLIK = process.env.TEST_URL_SKOOLIK && process.env.TEST_URL_SKOOLIK.replace(/\/?$/, '/')
const ENVELOPPE = { inclure: [['header.nav'], ['footer.pied']] }
const nav = await lancerNavigateur()

/** Une page ouverte sur `route` avec une langue d'interface, une largeur et un profil d'appareil. */
async function ouvrir({ route = '/maths', langue = 'fr', largeur = 1280, profil, base = app } = {}) {
  const ctx = await contexte(nav, { langue, viewport: { width: largeur, height: 800 } })
  if (profil) await ctx.addInitScript(p => localStorage.setItem('ep_profil', JSON.stringify(p)), profil)
  const page = await ctx.newPage()
  const erreurs = surveiller(page)
  await page.goto(base(route))
  await page.waitForSelector('header.nav')
  await page.waitForFunction(() => /—/.test(document.title))   // titre du document posé par le routeur
  return { ctx, page, erreurs }
}
// les classes choisies deviennent le réglage mémorisé : l'adresse n'écrit que l'écart, on lit donc le libellé de la barre
const attendreClasses = (page, libelle) => page.waitForFunction(l => /Classe|Klas/.test(document.querySelector('header.nav .nbtn.classe')?.getAttribute('aria-label') ?? '') && document.querySelector('header.nav .nbtn.classe').getAttribute('aria-label').endsWith(l), libelle)
const debordement = page => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
const enBarre = page => page.evaluate(() => [...document.querySelectorAll('header.nav a, header.nav button')].filter(e => e.offsetParent).map(e => (e.getAttribute('aria-label') ?? e.textContent).trim()))

// ── 1. barre : débordement et accessibilité, aux trois largeurs, en français et en breton, menus ouverts ──
for (const largeur of [1280, 360, 320]) {
  for (const langue of ['fr', 'br']) {
    console.log(`Barre à ${largeur} px, interface ${langue}`)
    for (const profil of ['parent', 'enseignant', 'enfant']) {
      const { ctx, page, erreurs } = await ouvrir({ largeur, langue, profil, route: '/maths?mode=bi' })
      const nom = `${profil} (${langue}, ${largeur})`
      verifier(await debordement(page) <= 0, `${nom} : aucun débordement horizontal`)
      if (langue === 'fr' || largeur === 360) await verifierAxe(page, `${nom} : barre et pied`, ENVELOPPE)
      // chaque menu ouvert : pas de débordement ni de violation
      for (const nomMenu of [/^(Langue|Yezh) :/, /^(Classe|Klas) :|Classe verrouillée|Klas prennet/, /^(Profil) :/, /^(Ouvrir le menu|Digeriñ al lañser)$/]) {
        const bouton = page.locator('header.nav button[aria-expanded]:visible').and(page.getByRole('button', { name: nomMenu }))
        if (!await bouton.count()) continue
        await bouton.click()
        verifier(await debordement(page) <= 0, `${nom} : menu ${nomMenu} ouvert sans débordement`)
        if (langue === 'fr') await verifierAxe(page, `${nom} : menu ${nomMenu} ouvert`, ENVELOPPE)
        await page.keyboard.press('Escape')
      }
      verifier(!erreurs.length, `${nom} : sans erreur JavaScript${erreurs.length ? ` (${erreurs[0]})` : ''}`)
      await ctx.close()
    }
  }
}

// ── 2. pied de page ──
console.log('Pied de page')
{
  const { ctx, page } = await ouvrir({ route: '/' })
  const liens = await page.locator('footer.pied a').evaluateAll(l => l.map(a => a.getAttribute('href') ?? ''))
  verifier(['programme', 'telechargements', 'nouveautes', 'about', 'issues/new', 'github.com'].every(m => liens.some(h => h.includes(m))), `liens du pied de page : ${liens.length}`)
  await ctx.close()
}

// ── 3. barre à 1280 px : contenu selon le profil ──
console.log('Profils : entrées de la barre et nombre de classes')
{
  const { ctx, page } = await ouvrir({ largeur: 1280, route: '/maths' })
  const rubriques = () => page.locator('nav.rubriques a').allTextContents().then(l => l.map(t => t.trim()))
  verifier(!(await rubriques()).some(t => /Programme/.test(t)), 'parent : pas de « Programme » dans la barre')
  verifier(await page.locator('nav.rubriques a.router-link-active').count() === 1, 'parent : un seul lien allumé (Maths) sur /maths')
  verifier((await page.locator('nav.rubriques a.router-link-active').textContent()).includes('Maths'), 'le lien actif est « Maths »')
  // parent : une classe à la fois
  await page.getByRole('button', { name: /^Classe :/ }).click()
  await page.getByRole('button', { name: 'CE2', exact: true }).click()
  await attendreClasses(page, 'CE2')
  await page.getByRole('button', { name: 'CM1', exact: true }).click()
  await attendreClasses(page, 'CM1')
  verifier(await page.locator('.menu-panneau .pastille[aria-pressed="true"]').count() === 1, 'parent : une seule classe choisie')
  await page.keyboard.press('Escape')
  // enseignant : plusieurs classes, Programme dans la barre
  await page.getByRole('button', { name: /^Profil :/ }).click()
  await page.getByRole('button', { name: /Enseignant/ }).click()
  await page.waitForSelector('nav.rubriques a[href$="/programme"]')
  verifier(true, 'enseignant : « Programme » dans la barre')
  await page.getByRole('button', { name: /^Classe :/ }).click()
  await page.getByRole('button', { name: 'CM2', exact: true }).click()
  await attendreClasses(page, 'CM1 · CM2')
  verifier(await page.locator('.menu-panneau .pastille[aria-pressed="true"]').count() === 2, 'enseignant : deux classes choisies')
  verifier((await page.getByRole('button', { name: /^Classe :/ }).getAttribute('aria-label')).includes('CM1 · CM2'), 'libellé « CM1 · CM2 » dans la barre')
  await page.getByRole('button', { name: 'CM1', exact: true }).click()
  await page.getByRole('button', { name: 'CM2', exact: true }).click()
  await attendreClasses(page, 'CM2')
  verifier(await page.locator('.menu-panneau .pastille[aria-pressed="true"]').count() === 1, 'enseignant : la dernière classe ne se retire pas')
  await page.locator('.menu-panneau').getByRole('button', { name: 'Toutes les classes' }).click()
  await attendreClasses(page, 'PS–CM2')
  verifier((await page.getByRole('button', { name: /^Classe :/ }).getAttribute('aria-label')).includes('PS–CM2'), 'libellé « PS–CM2 » pour toutes les classes')
  await page.keyboard.press('Escape')
  // retour à parent : une seule classe
  await page.getByRole('button', { name: /^Profil :/ }).click()
  await page.getByRole('button', { name: /Parent/ }).click()
  await page.getByRole('button', { name: /^Classe :/ }).click()
  await page.getByRole('button', { name: 'CP', exact: true }).click()
  await attendreClasses(page, 'CP')
  verifier(!(await rubriques()).some(t => /Programme/.test(t)), 'retour parent : « Programme » disparaît de la barre')
  // enfant : barre minimale, classe verrouillée
  await page.getByRole('button', { name: /^Profil :/ }).click()
  await page.getByRole('button', { name: /Enfant/ }).click()
  await page.waitForSelector('header.nav.enfant')
  const entrees = await enBarre(page)
  verifier(entrees.length === 3 && !await page.locator('nav.rubriques').count(), `enfant : logo, classe verrouillée, profil (${entrees.join(' | ')})`)
  verifier(await page.locator('header.nav .nbtn.verrou').count() === 1, 'enfant : le bouton de classe est un cadenas')
  await ctx.close()
}

// ── 4. cadenas : appui long de 2 s ──
console.log('Cadenas de la classe (enfant)')
{
  const { ctx, page } = await ouvrir({ largeur: 360, profil: 'enfant', route: '/maths?classes=ce1' })
  const avancement = () => page.evaluate(() => { const a = document.querySelector('.cadenas .anneau'); return a ? 1 - Number(a.getAttribute('stroke-dashoffset')) / 163.4 : -1 })
  const progres = seuil => page.waitForFunction(s => { const a = document.querySelector('.cadenas .anneau'); return a && 1 - Number(a.getAttribute('stroke-dashoffset')) / 163.4 >= s }, seuil)
  await page.locator('header.nav .nbtn.verrou').click()
  const appui = page.locator('.cadenas .appui')
  await appui.waitFor()
  const boite = await appui.boundingBox()
  verifier(!!boite && boite.width >= 44 && boite.height >= 44, 'le bouton de maintien fait au moins 44 px')
  const centre = { x: boite.x + boite.width / 2, y: boite.y + boite.height / 2 }
  // souris : relâcher à mi-parcours (1 s) ne déverrouille pas
  await page.mouse.move(centre.x, centre.y)
  await page.mouse.down()
  await progres(0.5)
  verifier(await avancement() < 1, 'à mi-parcours l’anneau est à moitié rempli, pas plein')
  await page.mouse.up()
  verifier(await avancement() === 0, 'relâcher remet l’anneau à zéro')
  verifier(await page.locator('.menu-panneau .pastille').count() === 0 && await page.locator('header.nav .nbtn.verrou').count() === 1, 'relâché à 1 s : la classe reste verrouillée')
  verifier(/trop tôt/.test(await page.locator('.cadenas [role=status]').textContent()), 'annonce aria-live : relâché trop tôt')
  // souris : maintenir jusqu'au bout
  await page.mouse.down()
  await page.waitForSelector('.menu-panneau .pastille', { timeout: 5000 })
  verifier(await page.locator('header.nav .nbtn.verrou').count() === 0, 'maintenu 2 s : le cadenas s’ouvre, la classe se choisit')
  await page.getByRole('button', { name: 'CE2', exact: true }).click()
  await attendreClasses(page, 'CE2')
  verifier(true, 'la classe change une fois déverrouillé')
  await ctx.close()
}
{
  // clavier : maintenir la barre d'espace
  const { ctx, page } = await ouvrir({ largeur: 1280, profil: 'enfant', route: '/maths?classes=ce1' })
  await page.locator('header.nav .nbtn.verrou').focus()
  await page.keyboard.press('Enter')
  await page.waitForSelector('.cadenas .appui:focus')
  verifier(true, 'clavier : le bouton de maintien reçoit le focus à l’ouverture')
  await page.keyboard.down('Space')
  await page.waitForFunction(() => { const a = document.querySelector('.cadenas .anneau'); return a && 1 - Number(a.getAttribute('stroke-dashoffset')) / 163.4 >= 0.4 })
  await page.keyboard.up('Space')
  verifier(await page.locator('.menu-panneau .pastille').count() === 0, 'clavier : espace relâché à 0,8 s, toujours verrouillé')
  await page.keyboard.down('Space')
  await page.waitForSelector('.menu-panneau .pastille', { timeout: 5000 })
  verifier(true, 'clavier : espace maintenu 2 s, le cadenas s’ouvre')
  await ctx.close()
}

// ── 5. sélecteurs au clavier ──
console.log('Sélecteurs au clavier')
{
  const { ctx, page } = await ouvrir({ largeur: 1280, route: '/maths' })
  const langue = page.getByRole('button', { name: /^Langue :/ })
  await langue.focus()
  await page.keyboard.press('Enter')
  verifier(await langue.getAttribute('aria-expanded') === 'true', 'Entrée ouvre le menu Langue')
  await page.keyboard.press('Escape')
  verifier(await langue.getAttribute('aria-expanded') === 'false' && await langue.evaluate(b => b === document.activeElement), 'Échap ferme le menu et rend le focus au bouton')
  await page.keyboard.press('Space')
  verifier(await langue.getAttribute('aria-expanded') === 'true', 'espace ouvre le menu Langue')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')
  await page.waitForSelector('nav.rubriques a[href$="/brezhoneg"]')
  verifier(true, 'Tab puis Entrée : « Français + Brezhoneg » (l’onglet Brezhoneg apparaît)')
  const classe = page.getByRole('button', { name: /^Classe :/ })
  await classe.focus(); await page.keyboard.press('Enter')
  verifier(await classe.getAttribute('aria-expanded') === 'true' && await langue.getAttribute('aria-expanded') === 'false', 'un seul menu ouvert à la fois')
  await page.mouse.click(5, 400)
  verifier(await classe.getAttribute('aria-expanded') === 'false', 'un clic ailleurs ferme le menu')
  await ctx.close()
}

// ── 6. modes de langue : adresse, titre, onglets ──
console.log('Modes de langue')
{
  const { ctx, page } = await ouvrir({ largeur: 1280, route: '/maths' })
  const onglets = () => page.locator('nav.rubriques a').allTextContents().then(l => l.map(t => t.trim()))
  const titreFr = await page.title()
  verifier(!(await onglets()).some(t => /Brezhoneg/i.test(t)), 'français seul : pas d’onglet Brezhoneg')
  verifier(await page.locator('.nbtn.retour').count() === 0, 'français seul : pas de « Retour en français »')
  await page.getByRole('button', { name: /^Langue :/ }).click()
  verifier(await page.locator('.menu-panneau .option').count() === 3, 'trois modes proposés')
  verifier(await page.locator('.menu-panneau .option[aria-pressed="true"]').count() === 1, 'un seul mode actif')
  await page.locator('.menu-panneau').getByRole('button', { name: /Français \+ Brezhoneg/ }).click()
  await page.waitForSelector('nav.rubriques a[href$="/brezhoneg"]')
  verifier(await page.evaluate(() => localStorage.getItem('ep_mode')) === '"bilingue"', 'le choix est mémorisé sur l’appareil (l’adresse n’écrit que l’écart au réglage)')
  verifier((await onglets()).some(t => /Brezhoneg/i.test(t)), 'bilingue : onglet Brezhoneg')
  verifier(await page.title() === titreFr, 'bilingue : le titre reste en français')
  verifier(await page.evaluate(() => document.documentElement.lang) === 'fr-FR', 'bilingue : interface en français')
  await page.getByRole('button', { name: /^Langue :/ }).click()
  await page.getByRole('button', { name: /^Brezhoneg/ }).click()
  await page.waitForFunction(() => document.documentElement.lang.startsWith('br'))
  verifier(await page.title() !== titreFr, `langue régionale seule : titre en breton (« ${await page.title()} »)`)
  verifier((await onglets()).some(t => /Brezhoneg/i.test(t)), 'langue régionale seule : onglet Brezhoneg')
  const retour = page.locator('.nbtn.retour')
  verifier(await retour.isVisible() && /Retour en français/.test(await retour.textContent()), '« Retour en français » visible, écrit en français')
  await retour.click()
  await page.waitForFunction(() => document.documentElement.lang.startsWith('fr'))
  verifier(await page.locator('.nbtn.retour').count() === 0, '« Retour en français » : le mode français revient, le bouton disparaît')
  verifier(await page.title() === titreFr, 'retour : le titre est de nouveau en français')
  await ctx.close()
}
{
  // l'adresse décide : ?mode=bi et ?mode=reg
  const { ctx, page } = await ouvrir({ largeur: 1280, route: '/maths?mode=bi' })
  await page.waitForSelector('nav.rubriques a[href$="/brezhoneg"]')
  verifier(true, '?mode=bi : onglet Brezhoneg')
  verifier(/Français \+ Brezhoneg/.test(await page.getByRole('button', { name: /^Langue :/ }).getAttribute('aria-label')), '?mode=bi : le bouton Langue dit « Français + Brezhoneg »')
  await page.goto(app('/maths?mode=reg'))
  await page.waitForFunction(() => document.documentElement.lang.startsWith('br'))
  verifier(await page.locator('.nbtn.retour').isVisible(), '?mode=reg : interface en breton et « Retour en français »')
  await ctx.close()
}
{
  // au téléphone, immersion : le bouton de retour est visible dans la barre, à 320 px aussi
  for (const largeur of [360, 320]) {
    const { ctx, page } = await ouvrir({ largeur, route: '/maths?mode=reg' })
    const retour = page.locator('.nbtn.retour')
    const b = await retour.boundingBox()
    verifier(!!b && b.x >= 0 && b.x + b.width <= largeur && b.height >= 44, `${largeur} px, immersion : « Retour en français » visible et assez grand`)
    verifier(await debordement(page) <= 0, `${largeur} px, immersion : aucun débordement`)
    await verifierAxe(page, `${largeur} px, immersion : barre`, ENVELOPPE)
    await ctx.close()
  }
}

// ── 7. téléphone : cibles tactiles et menu ☰ ──
console.log('Téléphone')
{
  const { ctx, page } = await ouvrir({ largeur: 360, route: '/maths?mode=bi' })
  const petites = await page.evaluate(() => [...document.querySelectorAll('header.nav a, header.nav button')].filter(e => e.offsetParent)
    .map(e => ({ n: (e.getAttribute('aria-label') ?? e.textContent).trim(), r: e.getBoundingClientRect() })).filter(({ r }) => r.height < 43.5 || r.width < 43.5).map(({ n }) => n))
  verifier(!petites.length, `cibles de la barre ≥ 44 px${petites.length ? ` (trop petites : ${petites.join(', ')})` : ''}`)
  verifier((await enBarre(page)).length === 4, `barre : logo, recherche, classe, ☰ (${(await enBarre(page)).join(' | ')})`)
  await page.getByRole('button', { name: 'Ouvrir le menu' }).click()
  const panneau = page.locator('#menu-telephone')
  verifier(await panneau.locator('a', { hasText: 'Maths' }).count() === 1 && await panneau.locator('a', { hasText: 'Brezhoneg' }).count() === 1, 'le menu ☰ porte les rubriques (dont Brezhoneg en bilingue)')
  verifier(await panneau.locator('.option').count() === 6, 'le menu ☰ porte la langue (3) et le profil (3)')
  const hauteurs = await panneau.locator('a, button').evaluateAll(l => l.map(e => e.getBoundingClientRect().height))
  verifier(hauteurs.every(h => h >= 43.5), 'entrées du menu ☰ ≥ 44 px')
  await panneau.locator('a', { hasText: 'Français' }).click()
  await page.waitForURL(/\/francais/)
  verifier(await page.locator('#menu-telephone').count() === 0, 'changer de page referme le menu ☰')
  await ctx.close()
}

// ── 8. skoolik : breton par défaut ──
if (URL_SKOOLIK) {
  console.log('skoolik')
  const { ctx, page } = await ouvrir({ largeur: 1280, route: '/maths', langue: 'br', base: r => `${URL_SKOOLIK}${r.replace(/^\//, '')}` })
  verifier((await page.locator('nav.rubriques a').allTextContents()).some(t => /Brezhoneg/i.test(t)), 'skoolik : onglet Brezhoneg par défaut (bilingue)')
  await verifierAxe(page, 'skoolik : barre et pied', ENVELOPPE)
  await ctx.close()
}

await nav.close()
process.exit(nbEchecs() ? 1 : 0)
