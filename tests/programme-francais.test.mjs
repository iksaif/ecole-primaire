// Programme officiel, français : les fiches générées à chaque niveau restent dans le programme de la classe
// (CONTRAINTES et COMPETENCES de src/data/programme.js). Chaque niveau est choisi, toutes ses options sont cochées,
// puis la fiche (srcdoc de l'aperçu) est analysée, pour plusieurs graines.
import { lancerNavigateur, contexte, surveiller, verifier, nbEchecs, URL_SITE } from './outils.mjs'
import CONJUGAISON from '../src/exercices/conjugaison/definition.js'
import GRAMMAIRE from '../src/exercices/grammaire/definition.js'
import VOCABULAIRE from '../src/exercices/vocabulaire/definition.js'
import ORTHOGRAPHE from '../src/exercices/orthographe/definition.js'
import DICTEE from '../src/exercices/dictee/definition.js'
import { valeursDe } from '../src/exercices/outils.js'

const fiche = (route, graine) => `${URL_SITE}?graine=${graine}#${route}?mode=imprimer`
const nav = await lancerNavigateur()

// ouvre la fiche d'un exercice, clique le niveau, coche toutes les options d'une famille de boutons
async function ouvrir(page, route, graine, niveau, options) {
  await page.goto('about:blank')
  await page.goto(fiche(route, graine))
  await page.locator('.cadre-exercice').waitFor({ timeout: 15000 })
  await page.locator('.cadre-exercice button', { hasText: new RegExp(`^${niveau.toUpperCase()}$`) }).first().click()
  await page.waitForTimeout(200)
  if (options) {
    const boutons = page.locator(`.cadre-exercice ${options}`)
    for (let i = 0; i < await boutons.count(); i++) {
      const b = boutons.nth(i)
      if (!(await b.getAttribute('class') ?? '').includes('active')) await b.click()
    }
  }
  await page.waitForTimeout(400)
  return page.locator('.cadre-exercice iframe').first().getAttribute('srcdoc')
}
const attributs = (html, nom) => [...html.matchAll(new RegExp(`data-${nom}="([^"]+)"`, 'g'))].map(m => m[1])

// ── Conjugaison : le programme est vérifié en node (tests/exercices.test.mjs : ecartsAuProgramme, ecartsFiche,
// manquesAuProgramme). Ici, seulement le rendu : la vue propose les verbes et temps de la définition, et l'aperçu
// montre une fiche, sans erreur JS.
console.log('Conjugaison (rendu)')
{
  const ctx = await contexte(nav, { graine: 1 })
  const page = await ctx.newPage()
  const erreurs = surveiller(page)
  for (const niveau of ['cp', 'cm2']) {
    erreurs.length = 0
    const ko = []
    const html = await ouvrir(page, '/francais/conjugaison', 1, niveau)
    const valeurs = reglage => page.locator(`.cadre-exercice [data-reglage="${reglage}"] [data-valeur]`).evaluateAll(l => l.map(b => b.dataset.valeur))
    for (const reglage of ['verbes', 'temps', 'mode']) {
      const attendues = valeursDe(CONJUGAISON, niveau, reglage).join(), vues = (await valeurs(reglage)).join()
      if (vues !== attendues) ko.push(`${reglage} : ${vues} ≠ ${attendues}`)
    }
    if (!attributs(html ?? '', 'verbe').length) ko.push('aucun tableau dans la fiche')
    if (erreurs.length) ko.push(erreurs[0])
    verifier(!ko.length, `${niveau.toUpperCase()} : réglages de la définition, fiche affichée${ko.length ? ' — ' + ko.join(' ; ') : ''}`)
  }
  await ctx.close()
}

// ── Grammaire, Vocabulaire, Orthographe, Dictée : le programme est vérifié en node (tests/exercices.test.mjs : types,
// natures, pluriels et accords, mots du corpus ; instantanés des fiches). Ici, seulement le rendu : la vue propose les
// réglages de la définition (valeurs de chaque niveau), marque le bonus / hors programme sans le cocher, et l'aperçu
// montre une fiche, sans erreur JS.
const ATTENDUS = [
  { route: '/francais/grammaire', nom: 'Grammaire', definition: GRAMMAIRE, reglages: ['types'], niveaux: ['ce1', 'ce2', 'cm1', 'cm2'] },
  { route: '/francais/vocabulaire', nom: 'Vocabulaire', definition: VOCABULAIRE, reglages: ['types'], niveaux: ['ce1', 'ce2'], bonus: { ce2: 'homonymes' } },
  { route: '/francais/orthographe', nom: 'Orthographe', definition: ORTHOGRAPHE, reglages: ['theme'], niveaux: ['cp', 'ce2', 'cm2'], horsProgramme: { ce2: 'homophones', cm2: 'homophones' } },
  { route: '/francais/dictee', nom: 'Dictée', definition: DICTEE, reglages: ['cats', 'mode'], niveaux: ['cp', 'ce1', 'ce2', 'cm1', 'cm2'] },
]
for (const { route, nom, definition, reglages, niveaux, bonus = {}, horsProgramme = {} } of ATTENDUS) {
  console.log(`${nom} (rendu)`)
  const ctx = await contexte(nav, { graine: 1 })
  const page = await ctx.newPage()
  const erreurs = surveiller(page)
  for (const niveau of niveaux) {
    erreurs.length = 0
    const ko = []
    const html = await ouvrir(page, route, 1, niveau)
    const valeurs = reglage => page.locator(`.cadre-exercice [data-reglage="${reglage}"] [data-valeur]`).evaluateAll(l => l.map(b => b.dataset.valeur))
    for (const reglage of reglages) {
      const attendues = valeursDe(definition, niveau, reglage).join(), vues = (await valeurs(reglage)).join()
      if (vues !== attendues) ko.push(`${reglage} : ${vues} ≠ ${attendues}`)
    }
    // bonus et hors programme : marqués, jamais cochés par défaut
    const marque = bonus[niveau] ?? horsProgramme[niveau]
    if (marque) {
      const b = page.locator(`.cadre-exercice [data-valeur="${marque}"]`)
      const texte = await b.innerText(), actif = (await b.getAttribute('class')).includes('active')
      if (!/\(/.test(texte)) ko.push(`${marque} non marqué : ${texte}`)
      if (actif) ko.push(`${marque} coché par défaut`)
    }
    if (!/<section class="corrige/.test(html ?? '')) ko.push('pas de fiche')
    if (erreurs.length) ko.push(erreurs[0])
    verifier(!ko.length, `${niveau.toUpperCase()} : réglages de la définition, fiche affichée${ko.length ? ' — ' + ko.join(' ; ') : ''}`)
  }
  if (nom === 'Orthographe') {
    // « CP → CM2 » : homophones par défaut, titre de la fiche publiée inchangé
    erreurs.length = 0
    await page.goto('about:blank')
    await page.goto(fiche(route, 1))
    await page.locator('.cadre-exercice').waitFor({ timeout: 15000 })
    await page.locator('.cadre-exercice button', { hasText: /^CP → CM2$/ }).first().click()
    await page.waitForTimeout(400)
    const html = await page.locator('.cadre-exercice iframe').first().getAttribute('srcdoc') ?? ''
    verifier(/<h1>Orthographe — Homophones<\/h1>/.test(html) && /class="paire"/.test(html) && !erreurs.length,
      `CP → CM2 : homophones, titre « Orthographe — Homophones »${erreurs.length ? ' — ' + erreurs[0] : ''}`)
  }
  await ctx.close()
}

await nav.close()

// code de sortie lu par tests/lancer.mjs
process.exit(nbEchecs() ? 1 : 0)
