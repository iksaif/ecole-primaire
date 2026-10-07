import { chromium } from 'playwright-core'
const R = ['/maths/calcul-mental', '/maths/calcul-pose', '/maths/tables', '/maths/numeration', '/maths/problemes', '/maths/fractions',
  '/maths/heure', '/maths/monnaie', '/maths/mesures', '/maths/geometrie', '/francais/grammaire', '/francais/vocabulaire',
  '/francais/conjugaison', '/francais/dictee', '/francais/orthographe', '/lecture', '/autres',
  '/maternelle/compter', '/maternelle/comparer', '/maternelle/ordonner', '/maternelle/lettres', '/maternelle/formes']
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
for (const l of ['fr', 'br']) {
  const ctx = await b.newContext({ viewport: { width: 1100, height: 1000 } })
  await ctx.addInitScript(l => { try { localStorage.setItem('ep_langue_interface', JSON.stringify(l)); localStorage.setItem('ep_avis_traduction_vu', 'true') } catch {} }, l)
  const p = await ctx.newPage()
  const err = []; p.on('pageerror', e => err.push(String(e).slice(0, 100)))
  let popups = 0; p.on('popup', () => popups++)
  for (const r of R) {
    err.length = 0
    const t0 = Date.now()
    await p.goto(`http://localhost:5173/ecole-primaire/#${r}?mode=imprimer`)
    const ok = await p.locator('iframe').first().waitFor({ timeout: 8000 }).then(() => true).catch(() => false)
    const ms = Date.now() - t0
    let regen = '-'
    if (ok) {
      const a = await p.locator('iframe').first().getAttribute('srcdoc')
      const btn = p.getByRole('button', { name: /Nouvelle fiche|Fichenn nevez/ })
      if (await btn.count()) { await btn.click(); await p.waitForTimeout(300); regen = a !== await p.locator('iframe').first().getAttribute('srcdoc') ? 'ok' : 'IDENTIQUE' }
    }
    await p.getByRole('tab').first().click({ timeout: 2000 }).catch(() => {})
    await p.waitForTimeout(250)
    const go = p.getByRole('button', { name: /Commencer|Kregiñ/ })
    const jeu = await go.count() ? await go.first().click({ timeout: 2000 }).then(() => 'ok').catch(() => 'désactivé?') : 'ABSENT'
    await p.waitForTimeout(300)
    const flag = !ok || regen === 'IDENTIQUE' || jeu !== 'ok' || err.length || ms > 3000
    console.log(`${flag ? '⚠️ ' : '✓ '}[${l}] ${r.padEnd(22)} aperçu=${ok ? ms + 'ms' : 'ABSENT'} regen=${regen} jeu=${jeu}${err.length ? ' ERR ' + err.join(' | ') : ''}`)
  }
  console.log(`[${l}] fenêtres ouvertes : ${popups}`)
  await ctx.close()
}
await b.close()
