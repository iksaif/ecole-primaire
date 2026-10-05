// HTML → PDF et images, avec un seul navigateur (Chrome sans interface, playwright-core) et un petit groupe d'onglets
// qui travaillent en parallèle. Aucune attente fixe : on attend le chargement du document puis `document.fonts.ready`.
//   const rendu = await ouvrirRendu()
//   const r = await rendu.rendre(document)       // PDF par format + aperçu de chaque page
//   const m = await rendu.reduire(r.pages[0].octets, 300)
//   await rendu.fermer()
import { existsSync } from 'node:fs'
import { availableParallelism } from 'node:os'
import { chromium } from 'playwright-core'
import type { Browser, Page } from 'playwright-core'
import type { DocumentRendu, DocumentSource } from './types.ts'

/** Chrome installé : CHROME_PATH, sinon les emplacements usuels. */
export function trouverChrome(): string {
  const candidats = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  ].filter((c): c is string => !!c)
  const chrome = candidats.find(p => existsSync(p))
  if (!chrome) throw new Error('Chrome introuvable : définir CHROME_PATH')
  return chrome
}

/** Largeur et hauteur d'un JPEG, lues dans son en-tête (pas besoin de le décoder). */
export function dimensionsJpeg(octets: Uint8Array): { largeur: number, hauteur: number } {
  let i = 2
  while (i + 9 < octets.length) {
    if (octets[i] !== 0xff) { i++; continue }
    const marqueur = octets[i + 1]
    // SOF0 à SOF15 sauf DHT (c4), JPG (c8) et DAC (cc) : l'image commence ici
    if (marqueur >= 0xc0 && marqueur <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marqueur)) {
      return { hauteur: (octets[i + 5] << 8) | octets[i + 6], largeur: (octets[i + 7] << 8) | octets[i + 8] }
    }
    i += 2 + ((octets[i + 2] << 8) | octets[i + 3])
  }
  throw new Error('JPEG illisible')
}

/** Pages d'un PDF produit par Chrome : les objets `/Type /Page` (pas `/Pages`). */
export const nbPagesPdf = (octets: Uint8Array): number => (Buffer.from(octets).toString('latin1').match(/\/Type\s*\/Page(?![s\w])/g) ?? []).length

// Assez large pour une page A3 paysage ; une fiche qui s'écoule est rendue en largeur A4 pour l'aperçu
const VUE_LARGE = { width: 1700, height: 1300 }
const VUE_A4 = { width: 794, height: 1123 }
const QUALITE_PAGE = 78

export interface Rendu {
  rendre(document: DocumentSource): Promise<DocumentRendu>
  /** JPEG réduit à `largeur` pixels (hauteur proportionnelle) */
  reduire(jpeg: Uint8Array, largeur: number): Promise<Uint8Array>
  fermer(): Promise<void>
}

export async function ouvrirRendu({ travailleurs = Math.min(availableParallelism(), 8) }: { travailleurs?: number } = {}): Promise<Rendu> {
  const navigateur: Browser = await chromium.launch({ executablePath: trouverChrome() })
  const pages: Page[] = await Promise.all(Array.from({ length: Math.max(1, travailleurs) }, () => navigateur.newPage({ deviceScaleFactor: 1 })))
  const libres = [...pages]
  const attente: ((p: Page) => void)[] = []
  const prendre = (): Promise<Page> => {
    const p = libres.pop()
    return p ? Promise.resolve(p) : new Promise(ok => attente.push(ok))
  }
  const rendre = (p: Page): void => {
    const suivant = attente.shift()
    if (suivant) suivant(p)
    else libres.push(p)
  }
  const outils = await navigateur.newPage()

  async function rendreDocument(page: Page, { formats }: DocumentSource): Promise<DocumentRendu> {
    const res: DocumentRendu = { pdfs: [], pages: [] }
    for (const [i, { format, html }] of formats.entries()) {
      await page.setViewportSize(VUE_LARGE)
      await page.setContent(html, { waitUntil: 'load' })
      await page.evaluate(() => document.fonts.ready)
      await page.emulateMedia({ media: 'print' })
      // `format` : le papier des fiches qui ne déclarent pas de @page ; un @page de la feuille l'emporte (preferCSSPageSize)
      const pdf = await page.pdf({ format, preferCSSPageSize: true, printBackground: true })
      await page.emulateMedia({ media: 'screen' })
      const feuilles = page.locator('.page')
      const nbFeuilles = await feuilles.count()
      res.pdfs.push({ format, octets: pdf, nbPages: nbPagesPdf(pdf) || nbFeuilles || 1 })
      if (i > 0) continue
      // aperçus au premier format : chaque feuille des documents « à pages », sinon le haut de la première page
      if (nbFeuilles) {
        for (let k = 0; k < nbFeuilles; k++) {
          const octets = await feuilles.nth(k).screenshot({ type: 'jpeg', quality: QUALITE_PAGE })
          res.pages.push({ octets, ...dimensionsJpeg(octets) })
        }
      } else {
        await page.setViewportSize(VUE_A4)
        await page.evaluate(() => { document.body.style.background = 'white' })
        const octets = await page.screenshot({ type: 'jpeg', quality: QUALITE_PAGE, clip: { x: 0, y: 0, ...VUE_A4 } })
        res.pages.push({ octets, ...dimensionsJpeg(octets) })
      }
    }
    return res
  }

  return {
    async rendre(document) {
      const page = await prendre()
      try { return await rendreDocument(page, document) } finally { rendre(page) }
    },
    async reduire(jpeg, largeur) {
      const donnees = await outils.evaluate(async ([b64, w]) => {
        const img = new Image()
        img.src = `data:image/jpeg;base64,${b64}`
        await img.decode()
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = Math.round(img.naturalHeight * w / img.naturalWidth)
        const ctx = canvas.getContext('2d')!
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        return canvas.toDataURL('image/jpeg', 0.8).split(',')[1]
      }, [Buffer.from(jpeg).toString('base64'), largeur] as const)
      return Buffer.from(donnees, 'base64')
    },
    async fermer() { await navigateur.close() },
  }
}

