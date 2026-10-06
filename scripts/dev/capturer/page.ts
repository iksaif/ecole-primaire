// Piloter Chrome pour capturer la fiche d'une vue : ouvrir la vue en mode impression avec la graine et les réglages du cas,
// attendre que la fiche soit stable, relever son HTML.
//   - Graine : ?graine=N avant le #, et Math.random remplacé par mulberry32(N) (comme le build et tests/outils.mjs).
//   - HTML capturé : celui que la vue donne au cadre (avant les options prénom/corrigé), relevé à l'entrée de
//     appliquerOptionsFiche (DOMParser) ; à défaut, le srcdoc de l'aperçu.
//   - Rapide : la page n'est pas rechargée entre deux cas : la vue est démontée (route légère) puis remontée, avec la graine et
//     les réglages du cas. `recharger` : un chargement complet par cas (plus lent, si une vue garde un état entre deux montages).
import type { Browser, BrowserContext, Page } from 'playwright-core'
import type { Cas } from './cas.ts'

/** Route légère : on y passe pour démonter la vue entre deux cas. */
const ROUTE_NEUTRE = '/mentions-legales'

/** Ce que l'init script pose sur `window`, lu dans les callbacks exécutés dans la page. */
type Fenetre = Window & { __graine: (graine: number) => void, __ficheBrute?: string | null }

export interface Capture { ctx: BrowserContext, page: Page }

export interface OptionsCapture {
  /** adresse du site servi, avec barre finale */
  base: string
  route: string
  recharger: boolean
}

/** Un contexte (localStorage à soi) et une page, avec la graine et le relevé de la fiche installés avant tout script de l'app. */
export async function preparer(navigateur: Browser, base: string, langue: string, erreurs: string[]): Promise<Capture> {
  const ctx = await navigateur.newContext({ viewport: { width: 1100, height: 900 } })
  await ctx.addInitScript((l: string) => {
    // graine du lien, et __graine(n) pour repartir d'une autre sans recharger
    let s = Number(new URLSearchParams(location.search).get('graine')) | 0
    Math.random = () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
    ;(window as unknown as Fenetre).__graine = (g: number) => { s = g | 0 }
    // HTML de la fiche tel que la vue le donne au cadre (appliquerOptionsFiche le relit avec DOMParser)
    const lire = DOMParser.prototype.parseFromString
    DOMParser.prototype.parseFromString = function (this: DOMParser, html: string, type: Parameters<DOMParser['parseFromString']>[1]) {
      if (type === 'text/html' && /^<!DOCTYPE html>/i.test(html)) (window as unknown as Fenetre).__ficheBrute = html
      return lire.call(this, html, type)
    }
    try { if (!localStorage.getItem('ep_langue_interface')) { localStorage.setItem('ep_langue_interface', JSON.stringify(l)); localStorage.setItem('ep_avis_traduction_vu', 'true') } } catch {}
  }, langue)
  const page = await ctx.newPage()
  page.on('pageerror', e => erreurs.push(String(e).slice(0, 200)))
  await page.goto(`${base}#${ROUTE_NEUTRE}`)
  return { ctx, page }
}

// localStorage du cas : rien d'autre que la langue et les réglages du cas
const poserStockage = (page: Page, langue: string, stockage: Cas['stockage']): Promise<void> =>
  page.evaluate(({ l, entrees }: { l: string, entrees: [string, string][] }) => {
    localStorage.clear()
    localStorage.setItem('ep_langue_interface', JSON.stringify(l))
    localStorage.setItem('ep_avis_traduction_vu', 'true')
    for (const [k, v] of entrees) localStorage.setItem(`ep_${k}`, v)
  }, { l: langue, entrees: Object.entries(stockage).map(([k, v]): [string, string] => [k, JSON.stringify(v)]) })

// une image + une tâche : le temps que Vue applique un changement (pas d'attente fixe)
const tic = (page: Page): Promise<void> => page.evaluate(() => new Promise<void>(r => requestAnimationFrame(() => setTimeout(r))))
const lireFiche = (page: Page): Promise<string | null | undefined> =>
  page.evaluate(() => (window as unknown as Fenetre).__ficheBrute ?? document.querySelector('.cadre-exercice iframe')?.getAttribute('srcdoc'))

/** Le HTML de la fiche du cas. */
export async function capturer(page: Page, c: Cas, { base, route, recharger }: OptionsCapture): Promise<string> {
  if (recharger) {
    await poserStockage(page, c.langue, c.stockage)
    const url = `${base}?graine=${c.graine}#${route}?mode=imprimer`
    if (page.url() === url) await page.reload(); else await page.goto(url)
  } else {
    // démonter la vue (route légère), poser les réglages, puis la remonter avec la graine du cas
    await page.evaluate(r => { location.hash = `#${r}` }, ROUTE_NEUTRE)
    await page.waitForFunction(() => !document.querySelector('.cadre-exercice'))
    await poserStockage(page, c.langue, c.stockage)
    await page.evaluate(({ g, r }: { g: number, r: string }) => {
      history.replaceState(history.state, '', `${location.pathname}?graine=${g}${location.hash}`)
      ;(window as unknown as Fenetre).__ficheBrute = null
      ;(window as unknown as Fenetre).__graine(g)
      location.hash = `#${r}?mode=imprimer`
    }, { g: c.graine, r: route })
  }
  await page.waitForFunction(() => document.querySelector('.cadre-exercice iframe')?.getAttribute('srcdoc'), null, { timeout: 15000 })
  for (const re of c.clics) {
    await page.locator('.cadre-exercice button', { hasText: new RegExp(re) }).first().click()
    await tic(page)
  }
  // fiche stable : la même après une image de plus
  let html = await lireFiche(page)
  for (let i = 0; i < 10; i++) { await tic(page); const encore = await lireFiche(page); if (encore === html) break; html = encore }
  return html ?? ''
}
