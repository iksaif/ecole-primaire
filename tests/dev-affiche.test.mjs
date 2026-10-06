// Test de fumée de la page /dev/affiches (pages de développement : tests/lancer.mjs en construit un site, TEST_URL_DEV ;
// sur le serveur de dev, le site lui-même) : le formulaire générique pilote les affiches d'exemple, sans erreur JavaScript, et
// l'aperçu suit les réglages (groupes, réglage conditionnel, langues sur la feuille, pages, hasard, titre, polices).
//   TEST_URL=http://localhost:5173/ecole-primaire/ node tests/dev-affiche.test.mjs
import { lancerNavigateur, contexte, surveiller, verifier, nbEchecs, appDev } from './outils.mjs'

const nav = await lancerNavigateur()
const page = await (await contexte(nav)).newPage()
const erreurs = surveiller(page)

const ouvrir = async url => {
  await page.goto('about:blank')
  await page.goto(appDev(url))
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

console.log('Lien ↔ formulaire (variante et langues)')
await ouvrir('/dev/affiches?affiche=exemple&variante=jusqua6-completer&langues=fr,br')
verifier(await actif('variante') === 'jusqua6-completer', 'le lien ouvre la variante demandée (variante calculée)')
verifier(await nb('[data-reglage="langues"] .level-btn.active') === 2, 'le lien ouvre les deux langues (&langues=fr,br)')
await ouvrir('/dev/affiches?affiche=exemple&langues=br')
verifier(await page.locator('[data-reglage="langues"] .level-btn.active').getAttribute('data-valeur') === 'br', '&langues=br : le breton seul')
await ouvrir('/dev/affiches?affiche=exemple-jours&langue=br')
verifier(await actif('langue') === 'br', 'l’ancien paramètre &langue=br est lu aussi')

console.log('Langue du formulaire : celle de l’interface')
// interface française, feuille en breton : le formulaire reste en français, seul l’aperçu est en breton
await ouvrir('/dev/affiches?affiche=exemple-jours&langue=br')
verifier((await page.locator('.config-box').textContent()).includes('Police des mots') && !(await page.locator('.config-box').textContent()).includes('Nodrezh ar gerioù'), 'interface en français : les titres du formulaire sont en français')
await attendre(new Function(`return ${dansApercu('Deizioù ar sizhun')}`), 'l’aperçu est en breton')

console.log('Exemple riche')
await ouvrir('/dev/affiches?affiche=exemple-riche')
verifier(await nb('[data-reglage="format"]') === 0 && await nb('[data-reglage="orientation"]') === 0, 'format et orientation fixes : non proposés')
verifier(await nb('[data-reglage="prereglage"] [data-valeur]') === 3, 'trois préréglages')
verifier(await nb('input[data-reglage="mot"]') === 0 && await nb('[data-reglage="lettres"]') === 1, 'série « lettres » : pas de champ mot, les lettres sont proposées')
verifier(await nb('[data-reglage="lettres"] [data-valeur="c\'h"]') === 0, 'les lettres du français : pas de c’h')
// préréglage : il pré-remplit, puis reste modifiable
await page.locator('[data-reglage="prereglage"] [data-valeur="mon-prenom"]').click()
await attendre(new Function(`return ${dansApercu('Léa')}`), 'le préréglage « mon prénom » écrit Léa')
verifier(await page.locator('input[data-reglage="mot"]').inputValue() === 'Léa', 'le champ texte est pré-rempli')
await page.locator('input[data-reglage="mot"]').fill('Zoé')
await attendre(new Function(`return ${dansApercu('Zoé')}`), 'le champ texte reste modifiable')
verifier(await page.locator('[data-reglage="prereglage"] .level-btn.active').count() === 0, 'le préréglage n’est plus actif après modification')
// le texte libre est échappé
await page.locator('input[data-reglage="mot"]').fill('<b>x</b> & "y"')
await attendre(new Function(`return ${dansApercu('&lt;b&gt;x&lt;/b&gt; &amp; "y"')}`), 'le texte libre est échappé dans l’aperçu')
verifier(await page.locator('iframe').evaluate(f => !f.contentDocument.querySelector('svg b')), 'aucune balise injectée par le texte libre')
// champs nombres : visibles pour les nombres seulement, bornés
await cliquer('serie', 'nombres')
await page.locator('input[data-reglage="de"]').fill('3'); await page.locator('input[data-reglage="de"]').blur()
await page.locator('input[data-reglage="a"]').fill('5'); await page.locator('input[data-reglage="a"]').blur()
await attendre(new Function(`return ${dansApercu('3 4 5')}`), 'des nombres de 3 à 5')
await page.locator('input[data-reglage="a"]').fill('500'); await page.locator('input[data-reglage="a"]').blur()
await attendre(new Function("return document.querySelector('input[data-reglage=a]')?.value === '99'"), 'un nombre hors bornes est ramené à 99')
verifier(await nb('input[data-reglage="mot"]') === 0, 'le champ texte disparaît avec la série « nombres »')
// polices : une par type d’écriture choisi
await cliquer('serie', 'mot')
verifier(await page.locator('.choix-police select').count() === 2, 'script et attaché : deux polices')
await cliquer('styles', 'attache')
await attendre(new Function("return document.querySelectorAll('.choix-police select').length === 1"), 'sans attaché, la police de l’attaché disparaît')
// les lettres suivent la langue de la feuille
await cliquer('serie', 'alphabet')
await cliquer('langue', 'br')
await attendre(new Function("return !!document.querySelector('[data-reglage=lettres] [data-valeur=\"c\\'h\"]')"), 'en breton : la lettre c’h est proposée')
// un champ a une étiquette liée (accessibilité)
await cliquer('serie', 'mot')
verifier(await page.locator('label[for]').count() >= 1 && await page.locator('input[data-reglage="mot"]').evaluate(i => !!i.labels?.length), 'le champ texte a une étiquette liée')

// L'affiche de l'alphabet est dans le registre réel : sa page est /imprimer/affiches (pas /dev), le formulaire est le même
console.log('Alphabet (registre réel)')
const pages = () => page.locator('iframe').evaluate(f => f.contentDocument.querySelectorAll('.page').length)
await ouvrir('/imprimer/affiches?affiche=alphabet&variante=cursive')
verifier(await actif('variante') === 'cursive', 'le lien ouvre la fiche « alphabet en attaché »')
verifier(await nb('[data-reglage="variante"] [data-valeur]') === 6, 'une variante par fiche publiée, et les lettres spéciales')
verifier(await nb('[data-reglage="styles"] .level-btn.active') === 2 && await actif('serie') === 'alphabet', 'la fiche en attaché : deux écritures, tout l’alphabet')
verifier(await nb('[data-reglage="lignes"]') === 1 && await page.locator('.choix-police select').count() === 2, 'écriture attachée : lignes d’écriture et deux polices (script, attaché)')
verifier(await nb('[data-reglage="langues"] .level-btn.active') === 1 && await nb('[data-reglage="langues"] [data-valeur]') === 2, 'une langue sur la feuille, au choix parmi deux')
await cliquer('styles', 'script-maj')
await cliquer('styles', 'attache-maj'); await cliquer('styles', 'attache-min')
await attendre(new Function("return document.querySelectorAll('.choix-police select').length === 1 && !document.querySelector('[data-reglage=lignes]')"), 'sans attaché : plus de lignes d’écriture ni de police de l’attaché')
verifier(await nb('[data-reglage="styles"] .level-btn.active') === 1, 'au moins une écriture reste cochée')
// les deux langues sur la même feuille : une page par langue, chacune avec son alphabet et son titre
await cliquer('langues', 'br')
await attendre(new Function(`return ${dansApercu('Al lizherenneg')} && ${dansApercu('L’alphabet')}`), 'français et breton : un titre par langue')
verifier(await pages() === 2, 'deux langues : deux pages')
await cliquer('langues', 'fr')
await attendre(new Function(`return ${dansApercu('C\'h')} || ${dansApercu('Ch')}`), 'le breton seul : ses digrammes (ch, c’h)')
verifier(await pages() === 1, 'le breton seul : une page')
// une lettre par page
await ouvrir('/imprimer/affiches?affiche=alphabet&variante=une-lettre-par-page')
await attendre(new Function("return document.querySelector('iframe')?.contentDocument?.querySelectorAll('.page').length === 26"), 'une lettre par page : 26 pages')
// la fiche A3 s'ouvre en A3, les lettres spéciales ont leurs lettres
await ouvrir('/imprimer/affiches?affiche=alphabet&variante=a3-paysage')
verifier(await actif('format') === 'A3' && await actif('orientation') === 'landscape', 'la fiche A3 s’ouvre en A3 paysage')
await ouvrir('/imprimer/affiches?affiche=alphabet&variante=lettres-speciales')
await attendre(new Function(`return ${dansApercu('>œ<')} && ${dansApercu('>Ç<')}`), 'les lettres spéciales : œ et Ç')
await cliquer('serie', 'alphabet')
await attendre(new Function(`return !${dansApercu('>œ<')} && ${dansApercu('>Z<')}`), 'la série se change dans le formulaire')
// l'ancienne adresse mène à l'affiche
await ouvrir('/imprimer/alphabet?preset=affiche-alphabet-cursive')
verifier(page.url().includes('/imprimer/affiches') && page.url().includes('affiche=alphabet'), '/imprimer/alphabet redirige vers l’affiche')

verifier(!erreurs.length, 'aucune erreur JavaScript')
await nav.close()
process.exit(nbEchecs() ? 1 : 0)
