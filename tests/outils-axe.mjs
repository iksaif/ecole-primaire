// Mesure d'accessibilité avec axe-core (WCAG 2.x A et AA, plus 2.2 AA) dans une page Chrome, partagée par les tests de pages.
//   import { verifierAxe } from './outils-axe.mjs'
//   await verifierAxe(page, 'accueil (fr, 1280)')
//   await verifierAxe(page, '/dev', { exclure: [['footer.pied']], reserves: ['region'] })
// Échoue (via `verifier`, tests/outils.mjs) s'il reste une violation « critique » ou « sérieuse » ; les autres sont listées
// avec AXE_DETAIL=1. Retourne les violations retenues (toutes gravités) pour un contrôle plus fin.
import { createRequire } from 'node:module'
import { verifier, ecrire } from './outils.mjs'

const require = createRequire(import.meta.url)
const AXE = require.resolve('axe-core/axe.min.js')
const GRAVES = new Set(['critical', 'serious'])
const ETIQUETTES = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

/**
 * Attend que les transitions et animations CSS finies (opacité, couleur…) soient terminées, et les polices chargées : axe mesure
 * le contraste sur les couleurs CALCULÉES, qui sont intermédiaires pendant une transition (sous charge, la mesure arrivait en
 * plein fondu : `color-contrast` x1 intermittent sur la question de numération et de suites). Les animations sans fin
 * (indicateurs d'attente) sont ignorées. Au bout de 5 s on mesure quand même : la violation éventuelle sera alors réelle.
 */
export async function attendreFinDesTransitions(page) {
  await page.waitForFunction(async () => {
    await document.fonts?.ready
    return document.getAnimations().every(a => a.effect?.getComputedTiming().endTime === Infinity || (a.playState !== 'running' && a.playState !== 'pending'))
  }, undefined, { timeout: 5000 }).catch(() => {})
}

/**
 * @param page page Playwright déjà chargée
 * @param nom  libellé de la vérification
 * @param options.inclure  sélecteurs (tableaux de sélecteurs axe) à analyser seuls : la barre, le pied de page…
 * @param options.exclure  sélecteurs (tableaux de sélecteurs axe) à ne pas analyser
 * @param options.reserves identifiants de règles à ignorer (ex. règles de page entière quand on teste un composant)
 * @param options.detail   lister aussi les violations moyennes et mineures (défaut : AXE_DETAIL=1)
 */
export async function verifierAxe(page, nom, { inclure = [], exclure = [], reserves = [], detail = !!process.env.AXE_DETAIL } = {}) {
  await attendreFinDesTransitions(page)
  await page.addScriptTag({ path: AXE })
  const ignorees = new Set(reserves)
  const contexte = inclure.length || exclure.length ? { ...(inclure.length && { include: inclure }), ...(exclure.length && { exclude: exclure }) } : null
  const { violations } = await page.evaluate(([c, etiquettes]) => globalThis.axe.run(c ?? document, { runOnly: { type: 'tag', values: etiquettes } }), [contexte, ETIQUETTES])
  const retenues = violations.filter(v => !ignorees.has(v.id))
  const graves = retenues.filter(v => GRAVES.has(v.impact))
  verifier(!graves.length, `${nom} : aucune violation critique ou sérieuse${graves.length ? ' (' + graves.map(v => `${v.id} x${v.nodes.length}`).join(', ') + ')' : ''}`)
  if (detail || graves.length) {
    for (const v of retenues) ecrire(`      [${v.impact}] ${v.id} x${v.nodes.length} : ${v.nodes.slice(0, 2).map(n => n.target.join(' ')).join(' | ')}`)
  }
  return retenues
}
