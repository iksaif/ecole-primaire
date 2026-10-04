// Fiches et affiches toutes prêtes : rien ne sort de la feuille, et aucun bloc ne cache son contenu
// (texte coupé dans une boîte à overflow caché). Les affiches du programme sont aussi testées dans l'autre
// orientation et en A3, puisqu'on peut les choisir dans l'app.
import { lancerNavigateur, contexte, surveiller, verifier, URL_SITE } from './outils.mjs'

const nav = await lancerNavigateur()
const ctx = await contexte(nav)
const app = await ctx.newPage()
const erreurs = surveiller(app)
await app.goto(`${URL_SITE}?generation=1#/`)
await app.waitForFunction(() => window.__ecolePrimaire)
await app.evaluate(() => window.__ecolePrimaire.preparer())
const liste = await app.evaluate(() => window.__ecolePrimaire.catalogue(['fr', 'br']))
const rendu = await ctx.newPage()

// défauts de mise en page d'un document déjà chargé : éléments hors de leur page, contenu coupé
const defauts = () => rendu.evaluate(() => {
  const out = []
  for (const page of document.querySelectorAll('.page')) {
    const p = page.getBoundingClientRect()
    for (const e of page.querySelectorAll('*')) {
      const r = e.getBoundingClientRect()
      if (!r.width || !r.height) continue
      const nom = `${e.tagName.toLowerCase()}${e.className && typeof e.className === 'string' ? '.' + e.className.split(' ')[0] : ''}`
      if (r.right > p.right + 1 || r.bottom > p.bottom + 1 || r.left < p.left - 1 || r.top < p.top - 1) out.push(`${nom} sort de la page`)
      const s = getComputedStyle(e)
      if (s.overflow !== 'visible' && (e.scrollHeight > e.clientHeight + 2 || e.scrollWidth > e.clientWidth + 2)) out.push(`${nom} coupé « ${e.textContent.trim().slice(0, 25)} »`)
    }
  }
  return [...new Set(out)]
})

async function verifierDocument(nom, html) {
  await rendu.setContent(html, { waitUntil: 'load' })
  await rendu.evaluate(() => document.fonts.ready)
  const d = await defauts()
  if (d.length) verifier(false, `${nom} : ${d.slice(0, 3).join(' ; ')}`)
  return d.length === 0
}

console.log(`Mise en page (${liste.length} fiches et affiches)`)
let bons = 0, total = 0
for (const t of liste) {
  const r = await app.evaluate(slug => window.__ecolePrimaire.generer(slug), t.slug)
  total++; if (await verifierDocument(t.slug, r.html)) bons++
  if (t.type !== 'affiche') continue
  for (const reglages of [{ orientation: r.orientation === 'landscape' ? 'portrait' : 'landscape' }, { format: 'A3' }]) {
    const r2 = await app.evaluate(([slug, x]) => window.__ecolePrimaire.genererAvec(slug, x), [t.slug, reglages])
    total++; if (await verifierDocument(`${t.slug} (${Object.values(reglages)[0]})`, r2.html)) bons++
  }
}
verifier(bons === total, `${bons} / ${total} documents sans débordement`)
verifier(!erreurs.length, 'aucune erreur JavaScript')
await nav.close()
