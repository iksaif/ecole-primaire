// Pages de contenu dans Chrome : accueil (trois profils, classes, « Reprendre », copie du lien pour les familles, choix du profil),
// pages de matière (cartes / liste, repli des domaines et sa mémoire, classes en pastilles, adresse reconstruite à froid, état vide
// et domaines « à venir » en production), Le Monde, page de la langue régionale (active, inactive, langue seule), accessibilité (axe)
// à 360 et 1280 px en français et en breton.
// Les exemples (domaine « exemple », exercices et affiches) n'existent que dans le site de développement (TEST_URL_DEV : build
// VITE_AVEC_DEV, ou le serveur de dev) ; le site de production (TEST_URL) n'en a aucun : c'est l'état vide.
//   TEST_URL=http://localhost:5173/ecole-primaire/ node tests/pages-pages.test.mjs
import { lancerNavigateur, contexte, surveiller, verifier, nbEchecs, app, appDev, URL_SITE } from './outils.mjs'
import { verifierAxe } from './outils-axe.mjs'
import { REGIONALES } from '../src/langues/registre.ts'

// la langue régionale du registre et la langue source : les deux langues d'interface des vérifications d'accessibilité
const [REGIONALE] = REGIONALES
const LANGUES_TEST = ['fr', REGIONALE]

const URL_SKOOLIK = process.env.TEST_URL_SKOOLIK && process.env.TEST_URL_SKOOLIK.replace(/\/?$/, '/')
const BASE = new URL(URL_SITE).pathname
const ou = page => { const u = new URL(page.url()); return `${u.pathname.slice(BASE.length - 1)}${u.search}` }
const pret = page => page.waitForSelector('main#contenu h1', { timeout: 10000 })
const nav = await lancerNavigateur()
// la barre et le pied de page sont ceux du shell (tests/pages-shell.test.mjs)
const sansShell = { exclure: [['body > #app > nav'], ['body > #app > footer'], ['footer'], ['nav.nav']] }

async function ouvrir({ profil, largeur = 1280, langue = 'fr', stockage = {} } = {}) {
  const ctx = await contexte(nav, { langue, viewport: { width: largeur, height: 900 } })
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {})
  await ctx.addInitScript(([p, s]) => {
    try {
      if (p) localStorage.setItem('ep_profil', JSON.stringify(p))
      for (const [k, v] of Object.entries(s)) localStorage.setItem(`ep_${k}`, JSON.stringify(v))
    } catch {}
  }, [profil, stockage])
  const page = await ctx.newPage()
  return { ctx, page, erreurs: surveiller(page) }
}
const aller = async (page, url) => { await page.goto(url); await pret(page) }
const textes = (page, sel) => page.locator(sel).allTextContents().then(l => l.map(s => s.replace(/\s+/g, ' ').trim()))

console.log('Accueil : trois dispositions')
{
  const { ctx, page } = await ouvrir({ profil: 'enfant' })
  await aller(page, app('/'))
  verifier(await page.locator('h1').count() === 1 && (await page.locator('h1').textContent()).includes('Bonjour'), 'enfant : un seul h1, « Bonjour ! »')
  const tuiles = page.locator('.tuiles a')
  verifier(await tuiles.count() >= 3, 'enfant : tuiles des matières')
  const tailles = await tuiles.evaluateAll(l => l.map(a => a.getBoundingClientRect().height))
  verifier(tailles.every(h => h >= 150), `enfant : très grosses tuiles (${Math.round(Math.min(...tailles))} px au moins)`)
  verifier(await page.locator('main .verrou').count() === 1 && await page.locator('.choix-classes').count() === 0, 'enfant : classe verrouillée, pas de choix de classe')
  verifier(await page.getByRole('button', { name: /enfant/ }).getAttribute('aria-pressed') === 'true', 'le profil actuel est annoncé (aria-pressed)')
  await verifierAxe(page, 'accueil enfant (fr, 1280)', sansShell)
  await ctx.close()
}
{
  const { ctx, page, erreurs } = await ouvrir()
  await aller(page, app('/'))
  verifier(await page.locator('h1').count() === 1, 'parent : un seul h1')
  verifier(await page.locator('.choix-classes button').count() === 8 && await page.locator('.choix-classes button[aria-pressed="true"]').count() === 1, 'parent : une classe choisie parmi huit')
  await page.locator('.choix-classes button', { hasText: 'CE2' }).click()
  await page.waitForFunction(() => localStorage.getItem('ep_classes') === '["ce1","ce2"]')
  verifier((await textes(page, '.choix-classes button[aria-pressed="true"]')).join() === 'CE1,CE2', 'parent : choisir CE2 ajoute la classe (plusieurs enfants), mémorisée')
  // la ligne « Langue » sous le choix de classe : trois modes, branchés sur le contexte
  const langue = page.locator('.choix-langue')
  verifier(await langue.count() === 1 && await langue.locator('button').count() === 3 && await langue.locator('button[aria-pressed="true"]').count() === 1, 'parent : ligne « Langue » (Français / Français + langue / langue seule), un seul mode actif')
  await langue.getByRole('button', { name: /^Français \+ / }).click()
  await page.waitForFunction(() => localStorage.getItem('ep_mode') === '"bilingue"')
  verifier(await langue.getByRole('button', { name: /^Français \+ / }).getAttribute('aria-pressed') === 'true' && await page.locator('.tuiles a', { hasText: 'Brezhoneg' }).count() === 1, 'choisir « Français + langue » : mode actif et tuile de la langue apparaît')
  await langue.getByRole('button', { name: /^Français$/ }).click()
  await page.waitForFunction(() => localStorage.getItem('ep_mode') === '"fr"')
  await page.locator('.tuiles a', { hasText: 'Maths' }).click()
  await page.waitForSelector('[data-page="maths"]')
  verifier(ou(page) === '/maths' && /CE1.*CE2/.test((await textes(page, '.barre .classes strong'))[0]), `la matière s’ouvre sur les classes choisies (${ou(page)})`)
  await page.goBack()
  await page.waitForSelector('[data-page="accueil"]')
  const liens = await page.locator('.tuiles a').evaluateAll(l => l.map(a => new URL(a.href).pathname))
  verifier(liens.some(h => h.endsWith('/programme')) && liens.some(h => h.endsWith('/telechargements')), 'parent : accès au programme et aux fiches toutes prêtes')
  verifier(await page.locator('.reprendre').count() === 0, 'rien à reprendre : pas de section « Reprendre »')
  verifier(await page.getByRole('button', { name: /Copier le lien/ }).count() === 0, 'parent : pas de bouton pour les familles')
  verifier(!erreurs.length, `accueil parent : aucune erreur JavaScript${erreurs.length ? ` (${erreurs[0]})` : ''}`)
  await page.getByRole('button', { name: /enseignant/ }).click()
  await page.waitForSelector('.copier')
  // enseignant : titre gardé pour les lecteurs d'écran seulement, sans sous-titre
  verifier(await page.locator('h1.sr-only').count() === 1 && await page.locator('.sous-titre').count() === 0, 'le choix du profil en bas change la disposition')
  await ctx.close()
}
{
  const { ctx, page } = await ouvrir({ profil: 'enseignant' })
  await aller(page, app('/?classes=ce1'))
  await page.locator('.choix-classes button', { hasText: 'CE2' }).click()
  await page.waitForFunction(() => document.querySelectorAll('.choix-classes button[aria-pressed="true"]').length === 2)
  verifier(true, 'enseignant : plusieurs classes')
  await page.locator('.choix-classes button', { hasText: 'CE1' }).click()
  await page.locator('.choix-classes button', { hasText: 'CE2' }).click()
  verifier(await page.locator('.choix-classes button[aria-pressed="true"]').count() >= 1, 'jamais moins d’une classe')
  await page.locator('.choix-classes button', { hasText: 'CE1' }).click()
  await page.waitForFunction(() => document.querySelectorAll('.choix-classes button[aria-pressed="true"]').length === 2)
  const entete = await textes(page, '.etat')
  verifier(entete[0] === '' && await page.locator('.etat[role="status"][aria-live="polite"]').count() === 1, 'zone d’annonce présente (aria-live) avant la copie')
  await page.getByRole('button', { name: /Copier le lien/ }).click()
  await page.waitForFunction(() => document.querySelector('.etat')?.textContent.includes('Lien copié'))
  const copie = await page.evaluate(() => navigator.clipboard.readText())
  verifier(/^https?:\/\/.*\?.*classes=ce1(,|%2C)ce2/.test(copie), `le lien copié reconstruit les classes (${copie})`)
  verifier(!/profil/.test(copie), 'le profil n’est pas dans le lien')
  verifier((await textes(page, '.etat'))[0].includes('CE1 · CE2'), 'la confirmation est annoncée avec les classes (« CE1 · CE2 »)')
  verifier(await page.locator('.tuiles a', { hasText: 'Programme' }).count() === 1 && (await textes(page, '.tuiles'))[0].includes('compétences'), 'enseignant : l’entrée Programme décrit son outil')
  await verifierAxe(page, 'accueil enseignant (fr, 1280)', sansShell)
  // à froid : l'adresse reconstruit les classes
  const froid = await ouvrir()
  await froid.page.goto(copie)
  await pret(froid.page)
  verifier(await froid.page.locator('.choix-classes button[aria-pressed="true"]').count() === 2, 'le lien partagé, ouvert à froid, affiche les mêmes classes')
  await froid.ctx.close()
  await ctx.close()
}

console.log('Accueil : « Reprendre » (exemples, développement)')
{
  const { ctx, page } = await ouvrir({ stockage: { recents: [{ id: 'exercice:exemple', ouvert: Date.now() - 3 * 86_400_000 }, { id: 'exercice:disparu', ouvert: Date.now() }, 'x'] } })
  await aller(page, appDev('/?classes=ce1'))
  await page.waitForSelector('.reprendre')
  const el = await textes(page, '.reprendre .element')
  verifier(el.length === 1 && el[0].includes('CE1') && el[0].includes('il y a 3 jours'), `« Reprendre » : l’exemple, sa classe et son ancienneté, pas l’exercice disparu (${el.join(' | ')})`)
  await verifierAxe(page, 'accueil avec « Reprendre » (fr, 1280)', sansShell)
  await ctx.close()
}

console.log('Page de matière : cartes, liste, repli (exemples, développement)')
{
  const { ctx, page, erreurs } = await ouvrir()
  await aller(page, appDev('/maths?classes=ce1'))
  await page.waitForSelector('.groupe[data-domaine="exemple"] .carte')
  verifier(await page.locator('h1').count() === 1 && (await page.locator('h1').textContent()).trim() === '🔢 Maths', 'un seul h1, la matière de la route (nom court et emoji, comme la maquette)')
  const lienFiches = await page.locator('.fiches-pretes a').getAttribute('href')
  verifier(lienFiches?.endsWith('/maths/fiches') || lienFiches?.includes('/maths/fiches'), 'encart « fiches toutes prêtes » vers /maths/fiches')
  const groupe = page.locator('.groupe[data-domaine="exemple"]')
  verifier(await groupe.evaluate(e => e.open), 'domaine avec ressources pour la classe : ouvert')
  const ressource = page.locator('[data-ressource="exercice:exemple"]').first()
  // CP, CE1, CE2 se suivent : une seule pastille « CP → CE2 », lue « du CP au CE2 », en évidence car elle contient la classe choisie
  const pastilles = ressource.locator('.pastille')
  verifier(await pastilles.count() === 1 && (await pastilles.locator('[aria-hidden="true"]').textContent()).trim() === 'CP → CE2', 'classes qui se suivent : une pastille « CP → CE2 »')
  verifier((await pastilles.locator('.sr-only').allTextContents()).join(' ').replace(/\s+/g, ' ').trim() === 'du CP au CE2 (dont la classe choisie : CE1)', 'la plage est lue « du CP au CE2 », avec la classe choisie')
  verifier(await ressource.locator('.pastille.choisie').count() === 1, 'la plage qui contient la classe choisie est en évidence')
  verifier(await ressource.locator('.badge.jeu').count() === 1 && await ressource.locator('.badge.imprimable').count() === 1, 'les deux badges (en ligne, imprimable) sur la même carte')
  verifier(await page.locator('[data-ressource="exercice:exemple"]').count() === 1, 'une ressource une seule fois')
  verifier(await page.locator('.groupe h2').count() >= 1 && await page.locator('.groupe h3').count() >= 2 && await page.locator('.groupe h4').count() > 0, 'titres en cascade : domaine, usage, carte')
  await verifierAxe(page, 'maths en cartes (fr, 1280)', sansShell)
  // liste
  await page.getByRole('button', { name: /Liste/ }).click()
  await page.waitForSelector('.groupe .ligne')
  verifier(await page.evaluate(() => localStorage.getItem('ep_vue')) === '"liste"' && await page.locator('.carte').count() === 0 && await page.getByRole('button', { name: /Liste/ }).getAttribute('aria-pressed') === 'true', 'la liste est mémorisée et remplace les cartes')
  verifier(await page.locator('.ligne a.bouton').count() >= 2, 'lignes : actions Ouvrir et Imprimer')
  const imprimer = await page.locator('.ligne a[aria-label^="Imprimer"]').first().getAttribute('href')
  verifier(imprimer?.includes('mode=imprimer'), 'Imprimer mène à l’onglet d’impression de l’exercice')
  await verifierAxe(page, 'maths en liste (fr, 1280)', sansShell)
  const froide = await ouvrir()
  await aller(froide.page, appDev('/maths?classes=ce1&vue=liste'))
  await froide.page.waitForSelector('.ligne')
  verifier(await froide.page.locator('.carte').count() === 0, 'adresse reconstruite à froid : la liste')
  await froide.ctx.close()
  // repli : une classe qui n'a rien dans ce domaine
  await page.goto(appDev('/maths?classes=cm2')); await pret(page)
  const hors = page.locator('.groupe[data-domaine="exemple"]')
  await hors.waitFor()
  verifier(!(await hors.evaluate(e => e.open)), 'domaine sans ressource pour la classe : replié, jamais masqué')
  verifier((await hors.locator('summary .hors').textContent()).includes('Hors de la classe CM2'), '« Hors de la classe CM2 : n » annoncé')
  await hors.locator('summary').click()
  await page.waitForFunction(() => document.querySelector('.groupe[data-domaine="exemple"]').open)
  await page.waitForFunction(() => localStorage.getItem('ep_plis') === '{"exemple":true}', null, { timeout: 5000 }).catch(() => {})
  verifier(await page.evaluate(() => localStorage.getItem('ep_plis')) === '{"exemple":true}', 'le pli est mémorisé par domaine')
  await page.goto(appDev('/maths?classes=cm2')); await pret(page)
  await page.waitForSelector('.groupe[data-domaine="exemple"]')
  verifier(await page.locator('.groupe[data-domaine="exemple"]').evaluate(e => e.open), 'le domaine reste ouvert au retour')
  verifier(await page.locator('.groupe[data-domaine="exemple"] .rien').count() === 2, 'sections vides expliquées')
  // « Toutes les classes » : montre les ressources de toutes les classes sans changer la classe choisie
  const toutes = page.getByRole('button', { name: /Toutes les classes/ })
  verifier(await toutes.getAttribute('aria-pressed') === 'false', '« Toutes les classes » : bouton à bascule, éteint au départ')
  await toutes.click()
  await page.waitForFunction(() => document.querySelector('.groupe[data-domaine="exemple"] .carte, .groupe[data-domaine="exemple"] .ligne'))
  verifier(await toutes.getAttribute('aria-pressed') === 'true' && (await textes(page, '.barre .classes strong'))[0] === 'CM2', '« Toutes les classes » : les ressources des autres classes s’affichent, la classe choisie reste CM2')
  // pastilles de saut : seulement s'il y a plusieurs domaines affichés, et autant que de domaines
  const nbDomaines = await page.locator('.groupe[data-domaine]').count()
  verifier(nbDomaines > 1 ? await page.locator('nav.saut button').count() === nbDomaines : await page.locator('nav.saut').count() === 0, `pastilles de saut vers les domaines (${nbDomaines} domaine(s) affiché(s))`)
  if (nbDomaines > 1) {
    const derniere = page.locator('nav.saut button').last()
    const cible = await page.locator('.groupe[data-domaine]').last().getAttribute('data-domaine')
    await derniere.click()
    await page.waitForFunction(c => document.activeElement === document.querySelector(`#domaine-${c} summary`), cible)
    verifier(await page.locator(`#domaine-${cible}`).evaluate(e => e.open), 'une pastille de saut ouvre le domaine et y place le focus')
  }
  verifier(!erreurs.length, `aucune erreur JavaScript${erreurs.length ? ` (${erreurs[0]})` : ''}`)
  await ctx.close()
}
{
  // plusieurs classes (enseignant) : union, une ressource une seule fois
  const { ctx, page, erreurs } = await ouvrir({ profil: 'enseignant' })
  await aller(page, appDev('/maths?classes=ms,ce1'))
  await page.waitForSelector('.groupe[data-domaine="exemple"] .carte')
  verifier(await page.locator('[data-ressource="affiche:exemple"]').count() === 1 && await page.locator('[data-ressource="exercice:exemple"]').count() === 1, 'plusieurs classes : union, chaque ressource une fois')
  // la page de matière est celle des ressources à personnaliser : aucune fiche toute prête (elles ont /maths/fiches)
  verifier(await page.locator('main .carte a[href*="/telechargements/"]').count() === 0, 'page de matière : aucune carte de fiche toute prête, seulement des exercices et des affiches')
  verifier(await page.locator('[data-ressource="exercice:exemple"] .pastille.choisie').count() === 1, 'seules les classes choisies de chaque carte sont en évidence')
  verifier(!erreurs.length, `aucune erreur JavaScript${erreurs.length ? ` (${erreurs[0]})` : ''}`)
  await ctx.close()
}
{
  const { ctx, page } = await ouvrir({ largeur: 360 })
  await aller(page, appDev('/maths?classes=ce1'))
  await page.waitForSelector('.groupe .carte')
  verifier(await page.locator('.ligne').count() === 0, 'téléphone : les cartes, comme sur ordinateur')
  verifier(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'téléphone : pas de débordement horizontal')
  await page.getByRole('button', { name: /Liste/ }).click()
  await page.waitForSelector('.groupe .ligne')
  verifier(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'téléphone, liste : pas de débordement horizontal')
  await ctx.close()
}

console.log('Production : état vide, domaines « à venir »')
{
  const { ctx, page, erreurs } = await ouvrir()
  // les maths ne sont plus vides : le calcul mental, premier exercice reporté, est au CP, au CE1, au CE2, au CM1 et au CM2 (voir plus bas) ;
  // Le Monde non plus : le quiz à partir du CP, les affiches des jours et des mois en maternelle (« Se repérer dans le temps et l'espace »)
  await aller(page, app('/monde?classes=gs'))
  await page.waitForSelector('[data-ressource="affiche:jours"]')
  verifier(await page.locator('.groupe[data-domaine="temps-espace"] [data-ressource="affiche:jours"]').count() === 1 && await page.locator('.a-venir [data-domaine="vivant"]').count() === 1 && await page.locator('.a-venir [data-domaine="exemple"]').count() === 0,
    '/monde en GS : les jours dans « Se repérer dans le temps et l’espace », « vivant » à venir, aucun domaine inventé')
  // le français n'est plus vide en maternelle et au CP : l'affiche de l'alphabet (première affiche reportée) est en lecture
  await aller(page, app('/francais?classes=cp'))
  await page.waitForSelector('[data-ressource="affiche:alphabet"]')
  verifier(await page.locator('[data-ressource="affiche:alphabet"] .badge.imprimable').count() === 1 && await page.locator('[data-ressource="affiche:alphabet"] .badge.jeu').count() === 0 && await page.locator('.vide').count() === 0,
    '/francais au CP en production : l’affiche de l’alphabet, imprimable, dans « Lecture »')
  // au CE2 elle est hors classe : la lecture a une ressource (plus « à venir »), l'écriture n'en a pas encore
  await aller(page, app('/francais?classes=ce2'))
  await page.waitForSelector('[data-ressource="exercice:dictee"]')
  verifier(await page.locator('[data-ressource="affiche:alphabet"]').count() === 0 && await page.locator('.a-venir [data-domaine="ecriture"]').count() === 0 && await page.locator('[data-ressource="exercice:dictee"]').count() === 1 && await page.locator('.a-venir [data-domaine="exemple"]').count() === 0,
    '/francais au CE2 : l’alphabet est hors classe, « écriture » a la dictée, aucun domaine inventé')
  await aller(page, app('/maths?classes=cp'))
  await page.waitForSelector('[data-ressource="exercice:calcul-mental"]')
  verifier(await page.locator('[data-ressource="exercice:calcul-mental"] .badge.jeu').count() === 1 && await page.locator('[data-ressource="exercice:calcul-mental"] .badge.imprimable').count() === 1 && await page.locator('.vide').count() === 0,
    '/maths en production : le calcul mental, en ligne et imprimable, dans « Nombres et calcul »')
  await aller(page, app('/maths?classes=ms'))
  await page.waitForSelector('.groupe[data-domaine="nombres-calcul"]')
  verifier(await page.locator('[data-ressource="exercice:calcul-mental"]').count() === 0 && await page.locator('[data-ressource="exercice:compter"]').count() === 1,
    '/maths à la MS : le calcul mental est hors classe, les exercices de maternelle (compter) sont là')
  await aller(page, app('/monde?classes=ps'))
  await page.waitForSelector('.a-venir')
  const cycle1 = await page.locator('.a-venir [data-domaine]').count()
  // au CM2, le quiz est là (« plusieurs domaines ») et les domaines du programme restent à venir
  await aller(page, app('/monde?classes=cm2'))
  await page.waitForSelector('.a-venir')
  verifier(await page.locator('.a-venir [data-domaine="vivant"]').count() === 1 && cycle1 > 0, 'les domaines suivent le cycle de la classe')
  verifier(await page.locator('[data-ressource="exercice:quiz"]').count() >= 1, 'Le Monde : le quiz est une carte du catalogue, dans « Plusieurs domaines »')
  verifier(!erreurs.length, `aucune erreur JavaScript${erreurs.length ? ` (${erreurs[0]})` : ''}`)
  for (const largeur of [1280, 360]) for (const langue of LANGUES_TEST) {
    const o = await ouvrir({ largeur, langue })
    for (const route of ['/', '/maths', '/francais', '/monde', '/brezhoneg']) {
      await aller(o.page, app(route))
      await o.page.waitForFunction(() => !document.querySelector('[role="status"]:not(.etat)'), null, { timeout: 5000 }).catch(() => {})
      await verifierAxe(o.page, `${route} (${langue}, ${largeur})`, sansShell)
    }
    await o.ctx.close()
  }
  await ctx.close()
}

console.log('Page de la langue régionale')
{
  const { ctx, page, erreurs } = await ouvrir()
  await aller(page, app('/brezhoneg?mode=fr'))
  verifier(await page.locator('.vide').count() === 1 && await page.locator('.barre').count() === 0, 'mode « Français seul » : page inactive, rien n’est montré')
  verifier((await page.locator('h1').textContent()).trim().endsWith('Brezhoneg') && await page.locator('h1').count() === 1, 'le nom de la langue vient du registre')
  await page.locator('.vide button').click()
  await page.waitForSelector('.barre')
  verifier(await page.evaluate(() => localStorage.getItem('ep_mode')) === '"bilingue"', 'le bouton active français + langue')
  verifier(await page.locator('[data-page="langue-regionale"]').getAttribute('lang') !== null, 'attribut lang de la langue')
  verifier(await page.locator('.lettre, .mot, .nombres').count() === 0, 'plus d’alphabet, de nombres ni de mots en pleine page (ce seront des affiches et des fiches)')
  verifier((await page.locator('.fiches-pretes a').getAttribute('href') ?? '').endsWith('/brezhoneg/fiches'), 'encart « fiches toutes prêtes » vers la sous-page de la langue (/brezhoneg/fiches)')
  await page.locator('[data-domaine="regionale-oral"]').first().waitFor()
  verifier(await page.locator('[data-domaine="regionale-oral"]').count() >= 1 && await page.locator('.a-venir [data-domaine="regionale-culture"]').count() === 1,
    'la langue a ses domaines (programme de langues vivantes, repères de Rennes) : « comprendre et parler » présent, « comptines » à venir')
  verifier(await page.locator('.barre .toutes').count() === 1, 'comme une matière : barre de classe et « Toutes les classes »')
  await verifierAxe(page, 'brezhoneg actif (fr, 1280)', sansShell)
  await page.goto(app('/brezhoneg?mode=reg')); await pret(page)
  verifier(await page.locator('.barre').count() === 1, 'langue seule : page active')
  verifier(!erreurs.length, `aucune erreur JavaScript${erreurs.length ? ` (${erreurs[0]})` : ''}`)
  await ctx.close()
  if (URL_SKOOLIK) {
    const s = await ouvrir({ langue: REGIONALE })
    await aller(s.page, `${URL_SKOOLIK}brezhoneg`)
    verifier(await s.page.locator('.barre').count() === 1, 'skoolik : français + breton par défaut, page active')
    await s.page.goto(`${URL_SKOOLIK}`); await pret(s.page)
    verifier(await s.page.locator('.tuiles a', { hasText: 'Brezhoneg' }).count() === 1, 'skoolik : tuile de la langue régionale sur l’accueil')
    await s.ctx.close()
  }
  for (const largeur of [1280, 360]) for (const langue of LANGUES_TEST) {
    const o = await ouvrir({ largeur, langue })
    await aller(o.page, app('/brezhoneg?mode=bi'))
    await verifierAxe(o.page, `brezhoneg actif (${langue}, ${largeur})`, sansShell)
    await aller(o.page, appDev('/maths?classes=ce1'))
    await o.page.waitForSelector('.groupe .carte, .groupe .ligne')
    await verifierAxe(o.page, `maths avec exemples (${langue}, ${largeur})`, sansShell)
    await aller(o.page, appDev('/?classes=ce1'))
    await verifierAxe(o.page, `accueil (${langue}, ${largeur})`, sansShell)
    await o.ctx.close()
  }
}

console.log('Réglages : classe, profil et mode de langue passent par le contexte')
{
  const o = await ouvrir()
  await aller(o.page, app('/parametres?classes=ce1'))
  verifier(await o.page.getByRole('button', { name: 'CE1', exact: true }).getAttribute('aria-pressed') === 'true', 'la classe de l’adresse est celle des réglages')
  // un parent a parfois plusieurs enfants : cliquer une autre classe l'ajoute
  await o.page.getByRole('button', { name: 'CM2', exact: true }).click()
  await o.page.waitForFunction(() => document.querySelectorAll('button.pastille[aria-pressed=true]').length === 2)
  verifier(await o.page.getByRole('button', { name: 'CE1', exact: true }).getAttribute('aria-pressed') === 'true', 'parent : plusieurs classes (plusieurs enfants)')
  await o.page.getByRole('button', { name: 'CE1', exact: true }).click()
  await o.page.waitForFunction(() => document.querySelectorAll('button.pastille[aria-pressed=true]').length === 1)
  verifier(!ou(o.page).includes('classes=ce1'), 'retirer une classe la retire de l’adresse')
  await o.page.getByRole('button', { name: /Enseignant/ }).click()
  await o.page.getByRole('button', { name: 'CE2', exact: true }).click()
  verifier(await o.page.locator('button.pastille[aria-pressed=true]').count() === 2, 'profil enseignant : plusieurs classes')
  verifier(!o.erreurs.length, 'aucune erreur JavaScript')
  await o.ctx.close()
}

await nav.close()
process.exit(nbEchecs() ? 1 : 0)
