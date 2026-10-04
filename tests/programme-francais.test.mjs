// Programme officiel, français : les fiches générées à chaque niveau restent dans le programme de la classe
// (CONTRAINTES et COMPETENCES de src/data/programme.js). Chaque niveau est choisi, toutes ses options sont cochées,
// puis la fiche (srcdoc de l'aperçu) est analysée, pour plusieurs graines.
import { lancerNavigateur, contexte, surveiller, verifier, URL_SITE } from './outils.mjs'
import { contraintesDe, competenceDe } from '../src/data/programme.js'
import { VERBES, AUTRES_VERBES, TITRES_TEMPS } from '../src/data/conjugaison.js'

const GRAINES = [1, 2, 3]
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

// ── Conjugaison : verbes (groupes et irréguliers) et temps du niveau
const TOUS_VERBES = { ...VERBES, ...AUTRES_VERBES }
const GROUPE = { auxiliaire: 'etre-avoir', '1er groupe': '1er-groupe', '2e groupe': '2e-groupe' }
const verbeAuProgramme = (cle, c) => {
  const v = TOUS_VERBES[cle]
  if (!v) return false
  return v.groupe === '3e groupe' ? c.irreguliers.includes(cle) : c.groupes.includes(GROUPE[v.groupe])
}
const TEMPS_DE_LIBELLE = Object.fromEntries(Object.entries(TITRES_TEMPS).map(([id, l]) => [l, id]))
const CLE_DE_INF = Object.fromEntries(Object.entries(TOUS_VERBES).map(([k, v]) => [v.inf, k]))

console.log('Conjugaison')
{
  const ctx = await contexte(nav, { graine: 1 })
  const page = await ctx.newPage()
  const erreurs = surveiller(page)
  for (const niveau of ['cp', 'ce1', 'ce2', 'cm1', 'cm2']) {
    const c = contraintesDe(niveau).conjugaison
    const ko = []
    for (const g of GRAINES) {
      erreurs.length = 0
      const html = await ouvrir(page, '/francais/conjugaison', g, niveau)
      // options proposées par le formulaire : rien hors programme, et tout le programme
      const verbes = (await page.locator('.cadre-exercice .verbe-btn').allInnerTexts()).map(x => CLE_DE_INF[x.trim().split(/\s/)[0]])
      const temps = (await page.locator('.cadre-exercice .btn-group .level-btn').allInnerTexts()).map(x => TEMPS_DE_LIBELLE[x.trim()]).filter(Boolean)
      if (g === GRAINES[0]) {
        const horsVerbes = verbes.filter(v => !verbeAuProgramme(v, c))
        if (horsVerbes.length) ko.push(`verbes proposés hors programme : ${horsVerbes}`)
        const horsTemps = temps.filter(x => !c.temps.includes(x))
        if (horsTemps.length) ko.push(`temps proposés hors programme : ${horsTemps}`)
        const manquants = c.temps.filter(x => !temps.includes(x))
        if (manquants.length) ko.push(`temps du programme absents : ${manquants}`)
        const groupes = new Set(verbes.map(v => TOUS_VERBES[v]?.groupe === '3e groupe' ? 'irreguliers' : GROUPE[TOUS_VERBES[v]?.groupe]))
        const gManquants = [...c.groupes, ...(c.irreguliers.length ? ['irreguliers'] : [])].filter(x => !groupes.has(x))
        if (gManquants.length) ko.push(`groupes du programme absents : ${gManquants}`)
      }
      // fiche : chaque tableau est au programme (tout est coché par défaut au changement de niveau)
      const vs = attributs(html ?? '', 'verbe'), ts = attributs(html ?? '', 'temps')
      if (!vs.length) ko.push(`graine ${g} : aucun tableau`)
      const hv = vs.filter(v => !verbeAuProgramme(v, c)), ht = ts.filter(x => !c.temps.includes(x))
      if (hv.length || ht.length) ko.push(`graine ${g} : fiche hors programme (${[...hv, ...ht]})`)
      if (!c.temps.includes('passe-simple') && /Passé simple/.test(html)) ko.push(`graine ${g} : passé simple`)
      if (erreurs.length) ko.push(erreurs[0])
    }
    verifier(!ko.length, `${niveau.toUpperCase()} : ${c.temps.length} temps, verbes ${[...c.groupes, ...(c.irreguliers.length ? ['8 irréguliers'] : [])].join(', ')}${ko.length ? ' — ' + ko.join(' ; ') : ''}`)
  }
  await ctx.close()
}

// ── Grammaire : exercices du niveau (compléments circonstanciels au cycle 3, phrase complexe au CM2)
// type → niveaux où il est au programme ; les autres types sont au programme dès le CE1
const niveauxDe = id => competenceDe(id).niveaux
const RESERVE = {
  cplt: niveauxDe('complements'),        // groupes circonstanciels : CM1 (cycle 2 : compléments non distingués)
  cpltNature: niveauxDe('complements'),  // complément d'objet / circonstanciel : CM1
  cpltQ: ['cm2'],                        // CC de temps, de lieu : CM2 (source de la compétence « complements »)
  complexe: ['cm2'],                     // phrase simple / complexe : CM2 (programme du cycle 3, p. 19)
  gnNoyau: ['cm1', 'cm2'],               // nom noyau : CM1 (programme du cycle 3, p. 18)
}
console.log('Grammaire')
{
  const ctx = await contexte(nav, { graine: 1 })
  const page = await ctx.newPage()
  const erreurs = surveiller(page)
  for (const niveau of ['ce1', 'ce2', 'cm1', 'cm2']) {
    const ko = []
    erreurs.length = 0
    // 15 questions, tous les exercices du niveau
    await page.goto('about:blank')
    await page.goto(fiche('/francais/grammaire', 1))
    await page.locator('.cadre-exercice').waitFor({ timeout: 15000 })
    await page.locator('.cadre-exercice button', { hasText: /^15$/ }).first().click()
    const html = await ouvrir(page, '/francais/grammaire', 1, niveau, '.theme-btn')
    const types = attributs(html ?? '', 'type')
    if (!types.length) ko.push('aucun exercice')
    const hors = types.filter(ty => RESERVE[ty] && !RESERVE[ty].includes(niveau))
    if (hors.length) ko.push(`hors programme : ${hors}`)
    if (erreurs.length) ko.push(erreurs[0])
    verifier(!ko.length, `${niveau.toUpperCase()} : ${types.length} exercices (${types.join(', ')})${ko.length ? ' — ' + ko.join(' ; ') : ''}`)
  }
  // CE1 : pluriel des noms en -s seulement (pluriels en -x au CE2)
  {
    await page.goto('about:blank')
    await page.goto(fiche('/francais/grammaire', 1))
    await page.locator('.cadre-exercice').waitFor({ timeout: 15000 })
    await page.locator('.cadre-exercice button', { hasText: /^CE1$/ }).first().click()
    const pluriel = page.locator('.cadre-exercice .theme-btn', { hasText: /Mettre au pluriel/ }).first()
    if (!(await pluriel.getAttribute('class') ?? '').includes('active')) await pluriel.click()
    // ne garder que « Mettre au pluriel »
    const actifs = page.locator('.cadre-exercice .theme-btn.active')
    for (let i = await actifs.count() - 1; i >= 0; i--) {
      const b = actifs.nth(i)
      if (!/Mettre au pluriel/.test(await b.innerText())) await b.click()
    }
    await page.locator('.cadre-exercice button', { hasText: /^15$/ }).first().click()
    await page.waitForTimeout(400)
    const html = await page.locator('.cadre-exercice iframe').first().getAttribute('srcdoc') ?? ''
    const corrige = html.slice(html.indexOf('class="corrige"'))
    const enX = [...new Set(corrige.match(/[a-zâêéèûô]+(?:eaux|eux)\b/g) ?? [])]
    verifier(/data-type="pluriel"/.test(html) && !enX.length, `CE1 : pluriels en -s seulement${enX.length ? ' — ' + enX.join(', ') : ''}`)
  }
  await ctx.close()
}

await nav.close()
