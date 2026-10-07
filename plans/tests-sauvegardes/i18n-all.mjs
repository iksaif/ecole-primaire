import { chromium } from 'playwright-core'
const ROUTES = ['/', '/maths', '/francais', '/lecture', '/autres', '/imprimer', '/imprimer/ecriture', '/imprimer/alphabet', '/imprimer/nombres', '/imprimer/calcul',
  '/maternelle', '/maternelle/compter', '/maternelle/comparer', '/maternelle/ordonner', '/maternelle/lettres', '/maternelle/formes',
  '/maths/numeration', '/maths/calcul-mental', '/maths/calcul-pose', '/maths/tables', '/maths/fractions', '/maths/problemes',
  '/maths/heure', '/maths/monnaie', '/maths/mesures', '/maths/geometrie',
  '/francais/dictee', '/francais/orthographe', '/francais/grammaire', '/francais/conjugaison', '/francais/vocabulaire',
  '/about', '/parametres', '/mentions-legales']
// mots d'interface français typiques qui ne devraient plus apparaître en breton
const MOTS_FR = /\b(Commencer|Valider|Passer|Suivant|Quitter|Rejouer|Paramètres|Imprimer|Niveau|Nombre de|Question \d|Bravo|Bonne réponse|Ta réponse|Exercices?|Choisis|Clique|Combien|Écris|Bienvenue|Aperçu|Lettres|Calculs?)\b/
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
for (const langue of ['fr', 'br']) {
  const ctx = await b.newContext({ viewport: { width: 1100, height: 900 } })
  await ctx.addInitScript(l => { try { localStorage.setItem('ep_langue_interface', JSON.stringify(l)); localStorage.setItem('ep_avis_traduction_vu', 'true') } catch {} }, langue)
  const p = await ctx.newPage()
  const err = []; p.on('pageerror', e => err.push(String(e).slice(0, 120)))
  for (const r of ROUTES) {
    err.length = 0
    await p.goto('http://localhost:5173/ecole-primaire/#' + r); await p.waitForTimeout(400)
    let txt = await p.locator('main, .container').first().innerText({ timeout: 2000 }).catch(() => '')
    const start = p.getByRole('button', { name: /Commencer|Kregiñ/ })
    if (await start.count()) { await start.first().click({ timeout: 2000 }).catch(() => {}); await p.waitForTimeout(300); txt += '\n' + await p.locator('.container').first().innerText({ timeout: 2000 }).catch(() => '') }
    const fr = langue === 'br' ? [...new Set((txt.match(new RegExp(MOTS_FR, 'g')) || []))] : []
    process.stdout.write('.')
    if (err.length || fr.length) console.log('\n' +`[${langue}] ${r}`, err.length ? 'ERR ' + err.join(' | ') : '', fr.length ? 'FR: ' + fr.join(', ') : '')
  }
  await ctx.close()
}
console.log('fin')
await b.close()
