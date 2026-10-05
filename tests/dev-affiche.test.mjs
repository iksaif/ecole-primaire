// Test de fumée de la page /dev/affiches (serveur de dev seulement : la route n'existe pas en production, donc ce test
// n'est pas dans tests/lancer.mjs) : le formulaire générique pilote l'affiche d'exemple, sans erreur JavaScript, et
// l'aperçu suit les réglages.
//   TEST_URL=http://localhost:5173/ecole-primaire/ node tests/dev-affiche.test.mjs
import { lancerNavigateur, contexte, surveiller, verifier, nbEchecs, app } from './outils.mjs'

const nav = await lancerNavigateur()
const page = await (await contexte(nav)).newPage()
const erreurs = surveiller(page)
await page.goto(app('/dev/affiches?affiche=exemple&variante=jusqua10'))
await page.waitForSelector('iframe')
await page.waitForLoadState('networkidle')

const apercu = () => page.locator('iframe').evaluate(f => f.contentDocument?.body.textContent ?? '')
const actif = cle => page.locator(`[data-reglage="${cle}"] .level-btn.active`).getAttribute('data-valeur')
const cliquer = (cle, valeur) => page.locator(`[data-reglage="${cle}"] [data-valeur="${valeur}"]`).click()
const attendre = async (condition, message) => {
  try { await page.waitForFunction(condition, null, { timeout: 4000 }); verifier(true, message) } catch { verifier(false, message) }
}

verifier(await actif('variante') === 'jusqua10', 'le lien ouvre la variante demandée')
await attendre(() => document.querySelector('iframe')?.contentDocument?.body?.textContent?.includes('La bande numérique'), 'l’aperçu montre le titre')
verifier(!(await apercu()).includes('neuf'), 'sans l’option, pas de nombres en lettres')
// l'option « hors programme » est marquée, avec sa raison en infobulle
const marque = page.locator('[data-reglage="lettres"] [data-valeur="true"]')
verifier((await marque.textContent()).includes('hors programme') && !!(await marque.getAttribute('title')), 'valeur hors programme marquée, raison en infobulle')
await cliquer('lettres', 'true')
await attendre(() => document.querySelector('iframe')?.contentDocument?.body?.textContent?.includes('neuf'), 'l’option « lettres » change l’aperçu')
// changer de variante ne reporte pas une valeur hors programme
await page.locator('[data-reglage="variante"] [data-valeur="jusqua6"]').click()
verifier(await actif('lettres') === 'false', 'changer de variante ne garde pas la valeur hors programme')
await cliquer('langue', 'br')
await attendre(() => document.querySelector('iframe')?.contentDocument?.body?.textContent?.includes('niveroù'), 'la langue de l’affiche change le titre')
await cliquer('format', 'A3')
await attendre(() => document.querySelector('iframe')?.contentDocument?.documentElement?.innerHTML?.includes('size: A3'), 'le format A3 change la page')
verifier(!erreurs.length, 'aucune erreur JavaScript')
await nav.close()
process.exit(nbEchecs() ? 1 : 0)
