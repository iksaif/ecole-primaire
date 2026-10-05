// Programme officiel, français : les fiches générées à chaque niveau restent dans le programme de la classe
// (CONTRAINTES et COMPETENCES de src/data/programme.js). Chaque niveau est choisi, toutes ses options sont cochées,
// puis la fiche (srcdoc de l'aperçu) est analysée, pour plusieurs graines.
import { lancerNavigateur, contexte, surveiller, verifier, nbEchecs, URL_SITE } from './outils.mjs'
import { contraintesDe, competenceDe, HORS_PROGRAMME } from '../src/data/programme.js'
import CONJUGAISON from '../src/exercices/conjugaison/definition.js'
import { valeursDe } from '../src/exercices/outils.js'

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
// début du corrigé (le cadre ajoute ses classes : « corrige sur-page »)
const debutCorrige = html => html.search(/class="corrige[ "]/)
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
    const corrige = html.slice(debutCorrige(html))
    const enX = [...new Set(corrige.match(/[a-zâêéèûô]+(?:eaux|eux)\b/g) ?? [])]
    verifier(/data-type="pluriel"/.test(html) && debutCorrige(html) > 0 && !enX.length, `CE1 : pluriels en -s seulement${enX.length ? ' — ' + enX.join(', ') : ''}`)
  }
  // CE1 : « Accorder l'adjectif » seulement en -e et -s (beaux, blanche, gentille… au CE2)
  {
    const ko = []
    for (const g of GRAINES) {
      await page.goto('about:blank')
      await page.goto(fiche('/francais/grammaire', g))
      await page.locator('.cadre-exercice').waitFor({ timeout: 15000 })
      await page.locator('.cadre-exercice button', { hasText: /^CE1$/ }).first().click()
      const accord = page.locator('.cadre-exercice .theme-btn', { hasText: /Accorder l'adjectif/ }).first()
      if (!(await accord.getAttribute('class') ?? '').includes('active')) await accord.click()
      const actifs = page.locator('.cadre-exercice .theme-btn.active')
      for (let i = await actifs.count() - 1; i >= 0; i--) {
        const b = actifs.nth(i)
        if (!/Accorder l'adjectif/.test(await b.innerText())) await b.click()
      }
      await page.locator('.cadre-exercice button', { hasText: /^15$/ }).first().click()
      await page.waitForTimeout(400)
      const html = await page.locator('.cadre-exercice iframe').first().getAttribute('srcdoc') ?? ''
      const i = debutCorrige(html)
      const adjs = [...html.slice(0, i).matchAll(/<em>\(([^)<]+)\)<\/em>/g)].map(m => m[1])
      const formes = [...html.slice(i).matchAll(/<strong>([^<]+)<\/strong>/g)].map(m => m[1])
      if (!adjs.length || adjs.length !== formes.length) { ko.push(`graine ${g} : ${adjs.length} adjectifs, ${formes.length} réponses`); continue }
      const reguliere = (a, f) => {
        const fem = a.endsWith('e') ? a : a + 'e'
        return [a, fem, a.endsWith('s') ? a : a + 's', fem + 's'].includes(f)
      }
      const irr = formes.filter((f, k) => !reguliere(adjs[k], f))
      if (irr.length) ko.push(`graine ${g} : ${irr.join(', ')}`)
    }
    verifier(!ko.length, `CE1 : accord de l'adjectif en -e et -s seulement${ko.length ? ' — ' + ko.join(' ; ') : ''}`)
  }
  await ctx.close()
}

// ── Orthographe : niveaux ; homophones « pour aller plus loin » du CE2 au CM2 (HORS_PROGRAMME) ; accords selon
// CONTRAINTES.pluriels et feminins ; « CP → CM2 » garde la fiche publiée (homophones)
console.log('Orthographe')
{
  const homophones = HORS_PROGRAMME.find(h => h.id === 'homophones-grammaticaux').niveaux
  const ctx = await contexte(nav, { graine: 1 })
  const page = await ctx.newPage()
  const erreurs = surveiller(page)
  const textes = async sel => (await page.locator(`.cadre-exercice ${sel}`).allInnerTexts()).map(x => x.trim())
  for (const niveau of ['cp', 'ce1', 'ce2', 'cm1', 'cm2']) {
    const c = contraintesDe(niveau)
    const ko = []
    erreurs.length = 0
    await ouvrir(page, '/francais/orthographe', 1, niveau)
    const themes = await textes('.theme-grid:not(.bonus) .theme-label')
    const bonus = await textes('.theme-grid.bonus .theme-label')
    const actif = await textes('.theme-btn.active .theme-label')
    if (themes.some(x => /Homophones/.test(x))) ko.push('homophones parmi les thèmes du programme')
    if (homophones.includes(niveau) !== bonus.some(x => /Homophones/.test(x))) ko.push(`homophones « pour aller plus loin » : ${bonus.length ? 'proposés' : 'absents'}`)
    if (actif.length !== 1 || !themes.includes(actif[0])) ko.push(`thème par défaut hors programme : ${actif}`)
    // accords : 15 questions, 3 graines ; la réponse est la forme de base, +e, +s ou +es, sauf si le niveau a les
    // pluriels en -x / -al-aux et les féminins qui s'entendent
    for (const g of GRAINES) {
      await ouvrir(page, '/francais/orthographe', g, niveau)
      await page.locator('.cadre-exercice .theme-btn', { hasText: /Accords/ }).first().click()
      await page.locator('.cadre-exercice button', { hasText: /^15$/ }).first().click()
      await page.waitForTimeout(400)
      const html = await page.locator('.cadre-exercice iframe').first().getAttribute('srcdoc') ?? ''
      const i = debutCorrige(html)
      const paires = html.slice(0, i).split('<div class="q">').slice(1)
        .map(q => [...q.matchAll(/class="choix">([^<]+)</g)].map(x => x[1])).filter(l => l.length)
      const reponses = [...html.slice(i).matchAll(/<b>([^<]+)<\/b>/g)].map(m => m[1])
      if (!paires.length || paires.length !== reponses.length) { ko.push(`graine ${g} : ${paires.length} questions, ${reponses.length} réponses`); continue }
      const prefixe = l => l.reduce((p, w) => { while (!w.startsWith(p)) p = p.slice(0, -1); return p })
      const hors = reponses.filter((r, k) => {
        const ch = paires[k], base = [...ch].sort((a, b) => a.length - b.length)[0], p = prefixe(ch)
        const reguliere = r === base || ['', 'e', 's', 'es'].some(f => r === p + f)
        if (reguliere) return false
        if (/(x|aux)$/.test(r)) return !c.pluriels.includes('x')
        return !c.feminins.includes('audible')
      })
      if (hors.length) ko.push(`graine ${g} : hors programme ${[...new Set(hors)].join(', ')}`)
    }
    if (erreurs.length) ko.push(erreurs[0])
    verifier(!ko.length, `${niveau.toUpperCase()} : thèmes ${themes.join(', ')}${bonus.length ? ` ; plus loin : ${bonus.join(', ')}` : ''}${ko.length ? ' — ' + ko.join(' ; ') : ''}`)
  }
  // « CP → CM2 » : homophones par défaut, titre de la fiche publiée inchangé
  {
    erreurs.length = 0
    await page.goto('about:blank')
    await page.goto(fiche('/francais/orthographe', 1))
    await page.locator('.cadre-exercice').waitFor({ timeout: 15000 })
    await page.locator('.cadre-exercice button', { hasText: /^CP → CM2$/ }).first().click()
    await page.waitForTimeout(400)
    const html = await page.locator('.cadre-exercice iframe').first().getAttribute('srcdoc') ?? ''
    verifier(/<h1>Orthographe — Homophones<\/h1>/.test(html) && /class="paire"/.test(html) && !erreurs.length,
      `CP → CM2 : homophones, titre « Orthographe — Homophones »${erreurs.length ? ' — ' + erreurs[0] : ''}`)
  }
  await ctx.close()
}

// ── Dictée : « Verbes courants » (il fait, il dit…) au CE2, avec la conjugaison des 8 irréguliers, plus au CE1
console.log('Dictée')
{
  const ctx = await contexte(nav, { graine: 1 })
  const page = await ctx.newPage()
  const erreurs = surveiller(page)
  const FORMES = /\bil (fait|va|dit|voit|vient|prend|peut|veut|doit|sait|tient)\b/
  for (const niveau of ['ce1', 'ce2']) {
    erreurs.length = 0
    const html = await ouvrir(page, '/francais/dictee', 1, niveau) ?? ''
    const cats = (await page.locator('.cadre-exercice .cat-btn').allInnerTexts()).map(x => x.trim())
    const verbes = cats.find(x => /^Verbes courants/.test(x))
    const ok = niveau === 'ce1' ? !verbes && !FORMES.test(html) : verbes === 'Verbes courants (8)'
    verifier(ok && !erreurs.length, `${niveau.toUpperCase()} : « Verbes courants » ${verbes ? 'proposé' : 'absent'}${erreurs.length ? ' — ' + erreurs[0] : ''}`)
  }
  await ctx.close()
}

// ── Vocabulaire : « Mots qui se disent pareil » (homonymes, cycle 3) seulement au CE2, « pour aller plus loin »
console.log('Vocabulaire')
{
  const ctx = await contexte(nav, { graine: 1 })
  const page = await ctx.newPage()
  const erreurs = surveiller(page)
  for (const niveau of ['ce1', 'ce2']) {
    erreurs.length = 0
    await ouvrir(page, '/francais/vocabulaire', 1, niveau)
    const types = (await page.locator('.cadre-exercice .theme-btn').allInnerTexts()).map(x => x.trim())
    const actifs = (await page.locator('.cadre-exercice .theme-btn.active').allInnerTexts()).join(' ')
    const homonymes = types.find(x => /se disent pareil/.test(x))
    const ok = !types.some(x => /Homonymes/.test(x)) && !/se disent pareil/.test(actifs)
      && (niveau === 'ce2' ? /pour aller plus loin/.test(homonymes ?? '') : !homonymes)
    verifier(ok && !erreurs.length, `${niveau.toUpperCase()} : homonymes ${homonymes ? '« pour aller plus loin »' : 'absents'}, jamais par défaut${erreurs.length ? ' — ' + erreurs[0] : ''}`)
  }
  await ctx.close()
}

await nav.close()

// code de sortie lu par tests/lancer.mjs
process.exit(nbEchecs() ? 1 : 0)
