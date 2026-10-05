// Test de fumée de la page /dev/affiches (serveur de dev seulement : la route n'existe pas en production, donc ce test
// n'est pas dans tests/lancer.mjs) : le formulaire générique pilote les affiches d'exemple, sans erreur JavaScript, et
// l'aperçu suit les réglages (groupes, réglage conditionnel, langues sur la feuille, pages, hasard, titre, polices).
//   TEST_URL=http://localhost:5173/ecole-primaire/ node tests/dev-affiche.test.mjs
import { lancerNavigateur, contexte, surveiller, verifier, nbEchecs, app } from './outils.mjs'

const nav = await lancerNavigateur()
const page = await (await contexte(nav)).newPage()
const erreurs = surveiller(page)

const ouvrir = async url => {
  await page.goto('about:blank')
  await page.goto(app(url))
  await page.waitForSelector('iframe')
  await page.waitForLoadState('networkidle')
}
const doc = () => page.locator('iframe').evaluate(f => f.contentDocument?.documentElement?.innerHTML ?? '')
const texte = () => page.locator('iframe').evaluate(f => f.contentDocument?.body?.textContent ?? '')
const actif = cle => page.locator(`[data-reglage="${cle}"] .level-btn.active`).getAttribute('data-valeur')
const cliquer = (cle, valeur) => page.locator(`[data-reglage="${cle}"] [data-valeur="${valeur}"]`).click()
const nb = sel => page.locator(sel).count()
const attendre = async (condition, message) => {
  try { await page.waitForFunction(condition, null, { timeout: 4000 }); verifier(true, message) } catch { verifier(false, message) }
}
const dansApercu = (texte) => `document.querySelector('iframe')?.contentDocument?.documentElement?.innerHTML?.includes(${JSON.stringify(texte)})`

console.log('Bande numérique')
await ouvrir('/dev/affiches?affiche=exemple&variante=jusqua10')
verifier(await actif('variante') === 'jusqua10', 'le lien ouvre la variante demandée')
verifier(await nb('[data-valeur="jusqua10-completer"]') === 1, 'les variantes calculées sont proposées')
await attendre(new Function(`return ${dansApercu('La bande numérique')}`), 'l’aperçu montre le titre')
verifier(await nb('[data-groupe="repere"]') === 1, 'un groupe du formulaire a son titre et ses réglages')
// réglage conditionnel : la graine n'existe que pour une variante à page à compléter
verifier(await nb('[data-action="nouvelle"]') === 0, 'sans page à compléter, pas de graine')
verifier(!(await texte()).includes('Je complète'), 'une seule page')
await page.locator('[data-reglage="variante"] [data-valeur="jusqua10-completer"]').click()
await attendre(new Function(`return ${dansApercu('Je complète la bande')}`), 'la variante « à compléter » a une deuxième page')
verifier(await nb('[data-action="nouvelle"]') === 1, 'avec la page à compléter, le bouton « Nouvelle » apparaît')
const avant = await doc()
await page.locator('[data-action="nouvelle"]').click()
// on attend que l'aperçu ait changé (état), pas une durée fixe
const change = await page.waitForFunction(av => (document.querySelector('iframe')?.contentDocument?.documentElement?.innerHTML ?? '') !== av, avant, { timeout: 5000 }).then(() => true, () => false)
verifier(change && await doc() !== avant, '« Nouvelle » change les nombres à compléter')
// l'option « hors programme » est marquée, avec sa raison en infobulle
const marque = page.locator('[data-reglage="lettres"] [data-valeur="true"]')
verifier((await marque.textContent()).includes('hors programme') && !!(await marque.getAttribute('title')), 'valeur hors programme marquée, raison en infobulle')
await cliquer('lettres', 'true')
await attendre(new Function(`return ${dansApercu('neuf')}`), 'l’option « lettres » change l’aperçu')
// plusieurs langues sur la même feuille
await cliquer('langues', 'br')
await attendre(new Function(`return ${dansApercu('nav')}`), 'les deux langues sont sur la feuille (neuf et nav)')
await cliquer('langues', 'fr')
await attendre(new Function(`return !${dansApercu('neuf')} && ${dansApercu('nav')}`), 'le breton seul')
// changer de variante ne reporte pas une valeur hors programme
await page.locator('[data-reglage="variante"] [data-valeur="jusqua6"]').click()
verifier(await actif('lettres') === 'false', 'changer de variante ne garde pas la valeur hors programme')
verifier(await nb('[data-action="nouvelle"]') === 0, 'la graine disparaît avec la page à compléter')
// titre personnalisé, échappé
await page.locator('input[data-reglage="titre"]').fill('Ma <bande> & moi')
await attendre(new Function(`return ${dansApercu('Ma &lt;bande&gt; &amp; moi')}`), 'le titre personnalisé remplace le titre, échappé')
await cliquer('format', 'A3')
await attendre(new Function(`return ${dansApercu('size: A3')}`), 'le format A3 change la page')
verifier(await page.locator('.btn-primary:has-text("Imprimer")').isEnabled(), 'le bouton Imprimer est actif')

console.log('Jours de la semaine')
await ouvrir('/dev/affiches?affiche=exemple-jours')
verifier(await nb('[data-reglage="langue"]') === 1 && await nb('[data-reglage="langues"]') === 0, 'une langue par feuille (choix unique)')
verifier(await page.locator('.choix-police select').count() === 2, 'deux polices : une par type')
await page.locator('.choix-police select').nth(1).selectOption({ index: 1 }).catch(() => {})
await cliquer('langue', 'br')
await attendre(new Function(`return ${dansApercu('Deizioù ar sizhun')}`), 'la langue de la feuille change le titre')
verifier((await doc()).includes('Disul') || (await doc()).includes('Disadorn'), 'les jours viennent des données de la langue')
verifier(!erreurs.length, 'aucune erreur JavaScript')
await nav.close()
process.exit(nbEchecs() ? 1 : 0)
