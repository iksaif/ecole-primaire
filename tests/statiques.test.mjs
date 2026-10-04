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
  const hrefs = i => p.locator('.container > .card-grid').nth(i).locator('a.card').evaluateAll(a => a.map(x => x.getAttribute('href')))
  const [affiches, fiches] = [await hrefs(0), await hrefs(1)]
  verifier(affiches.length >= 4 && affiches.every(h => !/mode=fiche|\/ecriture/.test(h)), `rubrique « affiches » : ${affiches.length} liens, aucun vers une fiche`)
  verifier(fiches.length >= 2 && fiches.every(h => /mode=fiche|\/ecriture/.test(h)), `rubrique « fiches » : ${fiches.length} liens, aucun vers une affiche`)
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
