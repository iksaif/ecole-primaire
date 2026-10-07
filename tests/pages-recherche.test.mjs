// Palette de recherche (Chrome) : ouverture par Ctrl+K, ⌘K, « / » (jamais dans un champ de saisie), résultats groupés par type,
// filtre de classe et « toutes les classes », clavier complet (flèches, Entrée, Échap), focus piégé puis rendu, contexte gardé
// à l'ouverture d'une ressource, plein écran sur téléphone, accessibilité (axe-core) à 360 et 1280 px en français et en breton.
// Les exemples (exercice, affiche) n'existent que sur un site avec les pages de développement (TEST_URL_DEV) ou le serveur de dev :
//   TEST_URL=http://localhost:5173/ecole-primaire/ node tests/pages-recherche.test.mjs
import { createRequire } from 'node:module'
import { CODES, LANGUE_SOURCE } from '../src/langues/registre.ts'
import { lancerNavigateur, contexte, surveiller, verifier, nbEchecs, appDev } from './outils.mjs'

const AXE = createRequire(import.meta.url).resolve('axe-core/axe.min.js')
const GRAVES = new Set(['critical', 'serious'])
const FENETRE = '[role=dialog][aria-modal=true]'
const pret = page => page.waitForSelector('main#contenu h1', { timeout: 10000 })
const champ = page => page.locator(`${FENETRE} [role=combobox]`)
const ouverte = page => page.locator(FENETRE).isVisible()
const options = page => page.locator(`${FENETRE} [role=option]`)
const titres = page => options(page).locator('strong').allTextContents()
/** Ouvre une page, attend qu'elle soit prête et que le catalogue ait chargé ses registres (le test cherche ensuite dans l'index). */
async function aller(page, route) { await page.goto(appDev(route)); await pret(page) }
/** Une option attendue dans les résultats (l'index se complète quand les registres arrivent). */
const attendreOption = async (page, requete) => { await champ(page).fill(requete); await options(page).first().waitFor({ timeout: 8000 }) }

const nav = await lancerNavigateur()

console.log('Ouverture par les raccourcis')
{
  const ctx = await contexte(nav)
  const page = await ctx.newPage()
  const erreurs = surveiller(page)
  await aller(page, '/')
  verifier(!await ouverte(page), 'fermée au départ')
  await page.keyboard.press('Control+k')
  await page.locator(FENETRE).waitFor()
  verifier(await ouverte(page), 'Ctrl+K ouvre')
  verifier(await champ(page).evaluate(el => el === document.activeElement), 'le focus est dans le champ')
  const attributs = await page.locator(FENETRE).evaluate(el => ({ modal: el.getAttribute('aria-modal'), nom: el.getAttribute('aria-label') }))
  verifier(attributs.modal === 'true' && !!attributs.nom, 'role=dialog, aria-modal, nom accessible')
  verifier(await champ(page).getAttribute('aria-autocomplete') === 'list', 'champ combiné : aria-autocomplete')
  await page.keyboard.press('Escape')
  verifier(!await ouverte(page), 'Échap ferme')
  await page.keyboard.press('Meta+k')
  await page.locator(FENETRE).waitFor()
  verifier(await ouverte(page), '⌘K ouvre')
  await page.keyboard.press('Escape')
  await page.keyboard.press('/')
  await page.locator(FENETRE).waitFor()
  verifier(await ouverte(page), '« / » ouvre')
  verifier(await champ(page).inputValue() === '', 'la barre oblique n’est pas écrite dans le champ')
  await page.keyboard.type('a/b')
  verifier(await champ(page).inputValue() === 'a/b' && await ouverte(page), '« / » dans le champ de la palette : écrit, rien ne se passe')
  await page.keyboard.press('Escape')
  const select = page.locator('select').first()
  if (await select.count()) {
    await select.focus()
    await page.keyboard.press('/')
    verifier(!await ouverte(page), '« / » dans une liste déroulante : n’ouvre pas')
  }
  await aller(page, '/parametres')
  const saisie = page.locator('main input[type=text]:visible, main input[type=number]:visible, main textarea:visible').first()   // un champ visible : celui d'un <details> fermé ne prend pas le focus
  if (await saisie.count()) {
    await saisie.focus()
    await page.keyboard.press('/')
    verifier(!await ouverte(page), '« / » dans un champ de la page : n’ouvre pas')
  }
  verifier(!erreurs.length, `aucune erreur JavaScript${erreurs.length ? ` (${erreurs[0]})` : ''}`)
  await ctx.close()
}

console.log('Bouton de la barre')
{
  const ctx = await contexte(nav)
  const page = await ctx.newPage()
  await aller(page, '/')
  const bouton = page.getByRole('button', { name: 'Rechercher' })
  verifier(await bouton.count() === 1, 'la barre a un bouton « Rechercher »')
  if (await bouton.count()) {
    await bouton.click()
    await page.locator(FENETRE).waitFor()
    verifier(await ouverte(page), 'le bouton 🔍 ouvre la palette')
    await page.keyboard.press('Escape')
    verifier(await bouton.evaluate(el => el === document.activeElement), 'le focus revient au bouton')
  }
  await ctx.close()
}

console.log('Résultats groupés, filtre de classe')
{
  const ctx = await contexte(nav)
  const page = await ctx.newPage()
  await aller(page, '/?classes=cp')
  await page.keyboard.press('Control+k')
  await attendreOption(page, 'nombres')
  const groupes = await page.locator(`${FENETRE} [role=group]`).evaluateAll(gs => gs.map(g => ({ nom: document.getElementById(g.getAttribute('aria-labelledby'))?.textContent?.trim(), n: g.querySelectorAll('[role=option]').length })))
  verifier(groupes.length >= 1 && groupes.every(g => g.nom && g.n > 0), `résultats groupés par type, chaque groupe nommé et non vide (${groupes.map(g => g.nom).join(' | ')})`)
  const ordre = ['🎮', '📘', '📄', '🎯', '🧭']
  const emojis = groupes.map(g => ordre.findIndex(e => g.nom.startsWith(e)))
  verifier(emojis.every(i => i >= 0) && emojis.every((e, i) => i === 0 || e > emojis[i - 1]), 'types dans l’ordre exercices, affiches, fiches, compétences, pages, avec leur emoji')
  const marques = await options(page).locator('strong mark').allTextContents()
  verifier(marques.length > 0 && marques.every(m => /nombre/i.test(m)), `le mot trouvé est surligné par <mark> dans les titres (${marques.length})`)
  verifier((await titres(page)).every(t => !/<mark|&lt;/.test(t)), 'le texte des résultats reste du texte (aucun HTML injecté)')
  verifier(groupes.length >= 2, `plusieurs types de résultats pour « nombres » en CP (${groupes.length})`)
  verifier((await page.locator(`${FENETRE} .contexte`).innerText()).includes('CP'), 'la classe courante est affichée')
  await page.keyboard.press('Escape')
  await aller(page, '/?classes=cm2')
  await page.keyboard.press('Control+k')
  await attendreOption(page, 'nombres')
  const bouton = page.locator(`${FENETRE} .contexte button`)
  verifier(await bouton.getAttribute('aria-pressed') === 'false', '« Toutes les classes » : aria-pressed=false au départ')
  verifier(/🎒/.test(await page.locator(`${FENETRE} .contexte span`).first().innerText()), '« Classe : … » porte son emoji')
  const annonce = await page.locator(`${FENETRE} [role=status]`).innerText()
  verifier(/résultat/.test(annonce), `le nombre de résultats est annoncé (« ${annonce} »)`)

  // une ressource qui n'existe qu'en CP–CE2 : masquée en CM2, montrée avec « toutes les classes »
  await champ(page).fill('suites exemple')
  await page.waitForFunction(() => /autres classes/.test(document.querySelector('[role=dialog] .contexte')?.textContent ?? '') || document.querySelector('[role=dialog] .vide'))
  verifier(/\d+ résultats? masqués? \(autres classes\)/.test(await page.locator(`${FENETRE} .contexte`).innerText()), 'libellé « 1 résultat masqué (autres classes) »')
  verifier(!(await titres(page)).includes('Suites de nombres'), 'filtrée par la classe : l’exercice de CP–CE2 est masqué en CM2')
  verifier(/autres classes/.test(await page.locator(`${FENETRE} .contexte`).innerText()), 'le décompte des résultats masqués est affiché')
  verifier(/Aucun résultat pour/.test(await page.locator(`${FENETRE} .vide`).innerText()) && /classes/.test(await page.locator(`${FENETRE} .vide button`).innerText()), '« aucun résultat » propose de chercher dans toutes les classes')
  await page.locator(`${FENETRE} .vide button`).click()
  await options(page).first().waitFor()
  verifier((await titres(page)).includes('Suites de nombres') && await bouton.getAttribute('aria-pressed') === 'true', '« toutes les classes » : le résultat apparaît, bouton enfoncé')
  verifier(!/autres classes/.test(await page.locator(`${FENETRE} .contexte`).innerText()), 'plus rien de masqué')
  await bouton.click()
  verifier(await bouton.getAttribute('aria-pressed') === 'false', 'le bouton se relâche')
  await page.keyboard.press('Escape')
  await page.keyboard.press('Control+k')
  verifier(await champ(page).inputValue() === '' && await page.locator(`${FENETRE} .contexte button`).getAttribute('aria-pressed') === 'false', 'à la réouverture : champ vide, classe courante seulement')
  await champ(page).fill('zzzzqq')
  await page.locator(`${FENETRE} .vide`).waitFor()
  verifier(!await page.locator(`${FENETRE} [role=listbox]`).count() && await champ(page).getAttribute('aria-expanded') === 'false', 'aucun résultat : pas de liste, champ replié')
  await ctx.close()
}

console.log('Clavier, contexte gardé, focus')
{
  const ctx = await contexte(nav)
  const page = await ctx.newPage()
  const erreurs = surveiller(page)
  await aller(page, '/?classes=ce1')
  const declencheur = page.locator('nav a').first()
  await declencheur.focus()
  await page.keyboard.press('Control+k')
  await attendreOption(page, 'programme')
  const ids = async () => ({ actif: await champ(page).getAttribute('aria-activedescendant'), selectionnes: await page.locator(`${FENETRE} [aria-selected=true]`).evaluateAll(l => l.map(e => e.id)) })
  const n = await options(page).count()
  let etat = await ids()
  verifier(etat.actif && etat.selectionnes.join() === etat.actif, 'la première option est active (aria-activedescendant = option sélectionnée)')
  const premier = etat.actif
  if (n > 1) {
    await page.keyboard.press('ArrowDown')
    etat = await ids()
    verifier(etat.actif !== premier && etat.selectionnes.join() === etat.actif, '↓ : option suivante')
    await page.keyboard.press('ArrowUp')
    verifier((await ids()).actif === premier, '↑ : option précédente')
  }
  await page.keyboard.press('ArrowUp')
  verifier((await ids()).actif === await options(page).last().getAttribute('id'), '↑ depuis la première : boucle sur la dernière')
  await page.keyboard.press('ArrowDown')
  // Tab piégé : tous les éléments focalisés restent dans la fenêtre, dans les deux sens
  let dehors = 0
  for (let i = 0; i < 8; i++) { await page.keyboard.press('Tab'); if (!await page.evaluate(sel => document.querySelector(sel).contains(document.activeElement), FENETRE)) dehors++ }
  for (let i = 0; i < 8; i++) { await page.keyboard.press('Shift+Tab'); if (!await page.evaluate(sel => document.querySelector(sel).contains(document.activeElement), FENETRE)) dehors++ }
  verifier(dehors === 0, 'Tab et Maj+Tab restent dans la fenêtre')
  await champ(page).focus()
  await page.keyboard.press('Escape')
  verifier(!await ouverte(page) && await declencheur.evaluate(el => el === document.activeElement), 'Échap : fermée, focus rendu au déclencheur')
  // Entrée ouvre la ressource, le contexte de l'adresse est gardé
  await page.keyboard.press('Control+k')
  await attendreOption(page, 'programme')
  await page.waitForFunction(() => [...document.querySelectorAll('[role=dialog] [role=option] strong')].some(e => /^programme$/i.test(e.textContent.trim())) || document.querySelectorAll('[role=dialog] [role=option]').length > 0)
  const cible = options(page).filter({ hasText: /^.*Le programme.*$/ }).first()
  const route = await page.evaluate(() => location.pathname)
  if (await cible.count()) {
    await cible.hover()
    await page.keyboard.press('Enter')
    await page.waitForURL(u => u.pathname !== route)
    const adresse = new URL(page.url())
    verifier(adresse.pathname.endsWith('/programme') && adresse.searchParams.get('classes') === 'ce1', 'Entrée ouvre la page, la classe de l’adresse est gardée')
    verifier(!await ouverte(page), 'la palette se ferme à l’ouverture')
    await page.waitForFunction(() => document.activeElement?.id === 'contenu')
    verifier(true, 'le focus est sur le contenu de la nouvelle page')
  } else verifier(false, 'la page « Le programme » est trouvée par la recherche « programme »')
  // clic sur une option
  await page.keyboard.press('Control+k')
  await attendreOption(page, 'programme')
  const avant = new URL(page.url()).pathname
  await champ(page).fill('mathematiques')
  await page.locator(FENETRE).getByRole('option', { name: 'Mathématiques', exact: true }).click()
  await page.waitForURL(u => u.pathname !== avant)
  verifier(new URL(page.url()).searchParams.get('classes') === 'ce1' && !await ouverte(page), 'un clic ouvre aussi, contexte gardé')
  await page.goBack()
  verifier(!await ouverte(page), 'la palette n’est pas rouverte par « précédent »')
  verifier(!erreurs.length, `aucune erreur JavaScript${erreurs.length ? ` (${erreurs[0]})` : ''}`)
  await ctx.close()
}

console.log('Plein écran sur téléphone, accessibilité')
for (const largeur of [1280, 360]) {
  for (const langue of CODES) {
    const ctx = await contexte(nav, { langue, viewport: { width: largeur, height: 740 } })
    const page = await ctx.newPage()
    await aller(page, '/?classes=cp')
    await page.keyboard.press('Control+k')
    await attendreOption(page, langue === LANGUE_SOURCE ? 'nombres' : 'niver')
    const nom = `${largeur} px, ${langue}`
    const boite = await page.locator(FENETRE).boundingBox()
    if (largeur === 360 && langue === LANGUE_SOURCE) {
      verifier(boite.x === 0 && boite.y === 0 && boite.width === 360 && boite.height === 740, `${nom} : plein écran`)
      verifier(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${nom} : aucun débordement horizontal`)
      const cibles = await page.locator(`${FENETRE} button, ${FENETRE} [role=option]`).evaluateAll(es => es.map(e => e.getBoundingClientRect()).filter(r => r.height < 44 || r.width < 44).length)
      verifier(cibles === 0, `${nom} : cibles d’au moins 44 px`)
    }
    if (largeur === 1280 && langue === LANGUE_SOURCE) verifier(boite.width <= 700 && boite.x > 100, `${nom} : fenêtre centrée`)
    if (langue !== LANGUE_SOURCE) verifier(/\S/.test(await champ(page).getAttribute('placeholder')) && await champ(page).getAttribute('placeholder') !== 'Chercher un exercice, une fiche, une compétence…', `${nom} : interface en breton`)
    await page.addScriptTag({ path: AXE })
    const { violations } = await page.evaluate(() => globalThis.axe.run({ include: [['[role=dialog]']] }, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } }))
    const graves = violations.filter(v => GRAVES.has(v.impact))
    verifier(!graves.length, `${nom} : aucune violation axe critique ou sérieuse${graves.length ? ' (' + graves.map(v => `${v.id} x${v.nodes.length} ${v.nodes[0].target.join(' ')}`).join(', ') + ')' : ''}`)
    // et sans résultat
    await champ(page).fill('zzzzqq')
    await page.locator(`${FENETRE} .vide`).waitFor()
    const vides = (await page.evaluate(() => globalThis.axe.run({ include: [['[role=dialog]']] }, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } }))).violations.filter(v => GRAVES.has(v.impact))
    verifier(!vides.length, `${nom} : sans résultat, aucune violation axe${vides.length ? ' (' + vides.map(v => v.id).join(', ') + ')' : ''}`)
    await ctx.close()
  }
}

await nav.close()
process.exit(nbEchecs() ? 1 : 0)
