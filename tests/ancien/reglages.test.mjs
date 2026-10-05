// Mode impression : chaque réglage visible doit changer la fiche (hasard reproductible). Lent : npm run test:complet
import { lancerNavigateur, contexte, verifier, nbEchecs, URL_SITE, EXERCICES } from '../outils.mjs'

const SEL = '.cadre-exercice button:not([role=tab]), .cadre-exercice input[type=checkbox]'
const nav = await lancerNavigateur()
const ctx = await contexte(nav, { graine: 1 })
const page = await ctx.newPage()
const fiche = async () => (await page.locator('.cadre-exercice iframe').first().getAttribute('srcdoc').catch(() => '')) || ''
const etat = async el => (await el.getAttribute('class').catch(() => '')) + '|' + (await el.isChecked().catch(() => ''))
async function charger(r) {
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem('ep_avis_traduction_vu', 'true') }).catch(() => {})
  await page.goto(`${URL_SITE}?r=${Math.random()}#${r}?mode=imprimer`)
  await page.locator('.cadre-exercice').first().waitFor({ timeout: 8000 }).catch(() => {})
  await page.locator('.cadre-exercice iframe').first().waitFor({ timeout: 8000 }).catch(() => {})
}
console.log('Effet de chaque réglage sur la fiche')
await page.goto(URL_SITE)
for (const r of EXERCICES) {
  await charger(r)
  const n = await page.locator(SEL).count()
  const sansEffet = []
  for (let i = 0; i < n; i++) {
    if (i) await charger(r)
    const el = page.locator(SEL).nth(i)
    if (!(await el.isVisible().catch(() => false)) || await el.isDisabled().catch(() => true)) continue
    const lib = ((await el.innerText().catch(() => '')) || (await el.evaluate(e => e.parentElement?.innerText).catch(() => '')) || '').trim().replace(/\s+/g, ' ').slice(0, 40)
    if (/Nouvelle fiche|Imprimer|Fichenn nevez|Moullañ|Signaler/.test(lib)) continue
    const e0 = await etat(el)
    await page.evaluate(() => window.__reset())
    await el.click({ timeout: 1500 }).catch(() => {}); await page.waitForTimeout(500)
    const e1 = await etat(el), apres = await fiche()
    await page.evaluate(() => window.__reset())
    await el.click({ timeout: 1500 }).catch(() => {}); await page.waitForTimeout(500)
    const avant = await fiche(), e2 = await etat(el)
    if (e0 !== e1 && e2 === e0 && apres === avant) sansEffet.push(lib)
  }
  verifier(n > 0 && !sansEffet.length, `${r} (${n} réglages)${sansEffet.length ? ' — sans effet : ' + sansEffet.join(' · ') : ''}`)
}
await nav.close()

// code de sortie lu par tests/lancer.mjs
process.exit(nbEchecs() ? 1 : 0)
