// Pages de téléchargement : filtres, recherche, langue régionale, visionneuse ; vie privée (cookies, tiers)
import { lancerNavigateur, contexte, surveiller, verifier, URL_SITE, app } from './outils.mjs'

const nav = await lancerNavigateur()
const visibles = p => p.locator('.carte:not([hidden])').count()

console.log('Index des fiches')
for (const regionale of ['', 'br']) {
  const ctx = await contexte(nav, { regionale })
  const p = await ctx.newPage()
  const erreurs = surveiller(p)
  await p.goto(`${URL_SITE}telechargements/`)
  await p.waitForTimeout(400)
  const total = await visibles(p)
  await p.keyboard.press('/'); await p.keyboard.type('alphabet'); await p.waitForTimeout(200)
  const recherche = await visibles(p)
  await p.keyboard.press('Escape')
  await p.locator('.filtre[data-filtre=classe] button', { hasText: 'CE1' }).click()
  const ce1 = await visibles(p)
  const filtreLangue = await p.locator('.filtre[data-filtre=langue]').isVisible()
  verifier(total > 0 && recherche > 0 && recherche < total && ce1 > 0 && ce1 < total && !erreurs.length,
    `langue régionale « ${regionale || 'aucune'} » : ${total} fiches, « alphabet » ${recherche}, CE1 ${ce1}`)
  verifier(filtreLangue === (regionale === 'br'), `filtre de langue ${regionale === 'br' ? 'visible' : 'masqué'}`)
  await ctx.close()
}

console.log('Index des fiches : domaines du programme')
{
  const ctx = await contexte(nav)
  const p = await ctx.newPage()
  await p.goto(`${URL_SITE}telechargements/`)
  // fiches.json : toutes les fiches du build (calcul compris), avec domaine et genre
  const fiches = await (await p.request.get(`${URL_SITE}telechargements/fiches.json`)).json()
  const { DOMAINES } = await import('../src/data/programme.js')
  const ids = new Set(DOMAINES.map(d => d.id))
  const fautives = fiches.filter(f => !['affiche', 'fiche', 'exercice'].includes(f.genre) || !(ids.has(f.domaine) || (f.genre === 'exercice' && f.domaine === null)))
  verifier(fiches.length > 100 && !fautives.length, `fiches.json : ${fiches.length} fiches, domaine et genre connus${fautives.length ? ` (${fautives.slice(0, 3).map(f => f.slug).join(', ')})` : ''}`)
  verifier(fiches.every(f => f.usage === (f.genre === 'affiche' ? 'apprendre' : 'exercice')), 'usage : affiches pour apprendre, fiches et exercices pour s\'entraîner')
  const sections = await p.locator('section.domaine').evaluateAll(s => s.map(x => x.dataset.domaine))
  verifier(sections[0] === 'nombres-calcul' && sections.includes('ecriture') && new Set(sections).size === sections.length, `sections : ${sections.join(', ')}`)
  await p.locator('.filtre[data-filtre=usage] button[data-v=apprendre]').click()
  const exercicesVisibles = await p.locator('.carte.exercice:not([hidden])').count()
  verifier(exercicesVisibles === 0 && (await visibles(p)) > 0, 'filtre « pour apprendre » : seulement des affiches')
  await p.goto(`${URL_SITE}telechargements/affiche-horloge-heures-entieres/`)
  const fil = await p.locator('.fil').innerText()
  const lien = await p.locator('.infos a[target=_blank]').first().getAttribute('href').catch(() => '')
  verifier(/Grandeurs et mesures/.test(fil) && /^https:\/\/www\.education\.gouv\.fr\//.test(lien), `page d'une fiche : domaine (${fil.split('›').at(-1).trim()}) et lien vers le programme`)
  await ctx.close()
}

console.log('Visionneuse de pages')
{
  const ctx = await contexte(nav)
  const p = await ctx.newPage()
  await p.goto(`${URL_SITE}telechargements/cartes-alphabet-une-lettre-par-page/`)
  const pos = await p.locator('.pager .position').innerText().catch(() => '')
  await p.locator('.fleche[data-pas="1"]').click().catch(() => {})
  verifier(/1 \/ 26/.test(pos) && (await p.locator('#apercu').getAttribute('src')) === 'apercu-p2.jpg', `${pos.trim()} → page 2`)
  await ctx.close()
}

console.log('Liens : une affiche ne mène jamais à un exercice')
{
  const ctx = await contexte(nav)
  const p = await ctx.newPage()
  const erreurs = surveiller(p)
  await p.goto(app('/imprimer')); await p.waitForTimeout(500)
  // une section par domaine ; dans chacune, « pour apprendre » (affiches) puis « pour s'entraîner » (fiches, exercices)
  const hrefs = sel => p.locator(`section.domaine ${sel} a.card`).evaluateAll(a => a.map(x => x.getAttribute('href')))
  const [affiches, fiches] = [await hrefs('.card-grid.apprendre'), await hrefs('.card-grid.entrainer')]
  const versFiche = /mode=fiche|\/ecriture|mode=imprimer/
  verifier(affiches.length >= 8 && affiches.every(h => !versFiche.test(h)), `« pour apprendre » : ${affiches.length} liens, aucun vers une fiche ou un exercice`)
  verifier(fiches.length >= 2 && fiches.every(h => versFiche.test(h)), `« pour s'entraîner » : ${fiches.length} liens, aucun vers une affiche`)
  const ordre = await p.locator('section.domaine').evaluateAll(s => s.map(x => x.dataset.domaine))
  verifier(ordre[0] === 'nombres-calcul' && ordre.indexOf('grammaire') > ordre.indexOf('espace-geometrie') && ordre.at(-1) === 'hors-programme',
    `sections par domaine, maths puis français : ${ordre.join(', ')}`)
  const programme = await p.locator('section.domaine a.programme').evaluateAll(a => a.map(x => x.getAttribute('href')))
  verifier(programme.length >= 5 && programme.every(h => /^https:\/\/www\.education\.gouv\.fr\//.test(h)), `liens « programme officiel » : ${programme.length}`)
  // les affiches du programme restent accessibles depuis leur domaine (plus de carte à part)
  verifier(affiches.some(h => /affiches\?affiche=horloge/.test(h)) && !affiches.some(h => /\/imprimer\/affiches$/.test(h)), 'affiches du programme : une carte par famille, dans son domaine')
  await p.goto(app('/maths')); await p.waitForTimeout(300)
  const liensAffiches = await p.locator('.affiches-domaine a').evaluateAll(a => a.map(x => x.getAttribute('href')))
  verifier(liensAffiches.length >= 4 && liensAffiches.every(h => /\/imprimer\//.test(h)), `page Maths : ${liensAffiches.length} liens vers les affiches des domaines`)
  const actifs = async () => (await p.locator('.level-btn.active').allInnerTexts()).join(' | ')
  // le mode demandé par le lien l'emporte sur le dernier réglage enregistré (même composant, navigation seulement)
  await p.goto(app('/imprimer/calcul?mode=fiche')); await p.waitForTimeout(500)
  const modeFiche = await actifs()
  await p.goto(app('/imprimer/calcul?mode=affiche')); await p.waitForTimeout(500)
  const modeAffiche = await actifs()
  verifier(/Fiche d'exercices/.test(modeFiche) && /Affiche des tables/.test(modeAffiche), `calcul : ?mode=fiche → fiche, ?mode=affiche → affiche (${modeAffiche.split(' | ')[0]})`)
  await p.goto(app('/imprimer/nombres?mise=fiche')); await p.waitForTimeout(400)
  const nFiche = await actifs()
  await p.goto(app('/imprimer/nombres?mise=affiches')); await p.waitForTimeout(400)
  verifier(nFiche !== (await actifs()), 'nombres : ?mise= change la mise en page')
  await p.goto(app('/imprimer/affiches?affiche=conjugaison&verbe=aller')); await p.waitForTimeout(500)
  const aff = await actifs()
  verifier(/Conjugaison/.test(aff) && /aller/.test(aff), `affiches du programme : le lien ouvre la bonne affiche (${aff})`)
  // pages de téléchargement : « Personnaliser » garde le genre
  const perso = async slug => { await p.goto(`${URL_SITE}telechargements/${slug}/`); return p.locator('a.btn-perso').first().getAttribute('href') }
  verifier(/mode=affiche/.test(await perso('affiche-tables-de-multiplication-a4')), 'page d\'une affiche de tables → Personnaliser ouvre le mode affiche')
  verifier(/mode=fiche/.test(await perso('fiche-table-de-multiplication-7')), 'page d\'une fiche de calcul → Personnaliser ouvre le mode fiche')
  verifier(/affiche=conjugaison&verbe=aller/.test(await perso('affiche-conjugaison-aller')), 'page d\'une affiche de conjugaison → Personnaliser ouvre ce verbe')
  verifier(!erreurs.length, 'aucune erreur JavaScript')
  await ctx.close()
}

console.log('Vie privée')
{
  const ctx = await contexte(nav)
  const p = await ctx.newPage()
  const hote = new URL(URL_SITE).host, tiers = new Set()
  p.on('request', r => { const h = new URL(r.url()).host; if (h !== hote && !r.url().startsWith('data:')) tiers.add(h) })
  for (const r of ['/', '/parametres', '/maths/calcul-mental?mode=imprimer', '/imprimer/ecriture']) { await p.goto(app(r)); await p.waitForTimeout(600) }
  await p.goto(`${URL_SITE}telechargements/`)
  verifier((await ctx.cookies()).length === 0, 'aucun cookie')
  verifier(tiers.size === 0, `aucune requête vers un autre site${tiers.size ? ' : ' + [...tiers].join(', ') : ''}`)
  await ctx.close()
}
await nav.close()
