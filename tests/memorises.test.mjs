// Réglages mémorisés abîmés (ancienne version, valeur incomplète, mauvais type) : aucune page ne doit bloquer.
// Avant chaque chargement, toutes les clés de réglages connues reçoivent la même valeur corrompue.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { lancerNavigateur, contexte, surveiller, verifier, nbEchecs, app, ROUTES, EXERCICES } from './outils.mjs'

// Clés de réglages présentes dans les sources : 'xxx_config', 'xxx_fiche' (stockées sous ep_xxx_…), et les polices
const src = join(dirname(fileURLToPath(import.meta.url)), '..', 'src')
const sources = d => readdirSync(d).flatMap(f => statSync(join(d, f)).isDirectory() ? sources(join(d, f)) : /\.(js|ts|vue)$/.test(f) ? [join(d, f)] : [])
const CLES = [...new Set(sources(src).flatMap(f => [...readFileSync(f, 'utf8').matchAll(/['"]([a-z_]+_(?:config|fiche))['"]/g)].map(m => m[1]))), 'polices']

const CORROMPUES = ['{}', '{"niveau":42}', '"x"', '[]']
const routes = [...new Set([...ROUTES, ...EXERCICES])]

console.log(`Réglages mémorisés abîmés (${CLES.length} clés)`)
const nav = await lancerNavigateur()
for (const valeur of CORROMPUES) {
  const ctx = await contexte(nav)
  await ctx.addInitScript(([cles, v]) => {
    try { for (const c of cles) localStorage.setItem('ep_' + c, v) } catch {}
  }, [CLES, valeur])
  const page = await ctx.newPage()
  const erreurs = surveiller(page)
  // une erreur dans le rendu d'un composant est seulement écrite dans la console par Vue
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) erreurs.push(m.text().slice(0, 200)) })
  const ko = []
  const essayer = async (route, attendre) => {
    erreurs.length = 0
    await page.goto('about:blank') // rechargement complet : les réglages sont réabîmés à chaque page
    await page.goto(app(route))
    const ok = await attendre().then(() => true).catch(() => false)
    if (!ok || erreurs.length) ko.push(`${route}${ok ? '' : ' (page vide)'}${erreurs.length ? ' — ' + erreurs[0] : ''}`)
  }
  for (const r of routes) {
    await essayer(r, async () => {
      await page.locator('.container').first().waitFor({ timeout: 5000 })
      await page.waitForTimeout(300)
      const go = page.getByRole('button', { name: /Commencer|Kregiñ/ })
      if (await go.count()) { await go.first().click({ timeout: 2000 }); await page.waitForTimeout(200) }
    })
  }
  for (const r of EXERCICES) {
    await essayer(`${r}?mode=imprimer`, async () => {
      await page.locator('.cadre-exercice iframe').first().waitFor({ timeout: 8000 })
      await page.waitForTimeout(200)
    })
  }
  verifier(!ko.length, `valeur ${valeur} : ${routes.length} pages et ${EXERCICES.length} fiches${ko.length ? ' — ' + ko.join(' ; ') : ''}`)
  await ctx.close()
}
await nav.close()

// code de sortie lu par tests/lancer.mjs
process.exit(nbEchecs() ? 1 : 0)
