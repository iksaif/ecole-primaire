// Les fiches et affiches toutes prêtes, telles que le build les envoie à Chrome pour en faire des PDF (scripts/build/fiches/) :
// rien ne sort de la feuille et aucun bloc ne cache son contenu (texte coupé dans une boîte à overflow caché). Chaque fiche est
// rendue dans chacun de ses formats et sens (A4/A3, portrait/paysage), en impression, à la taille de la feuille. Reprend
// tests/ancien/affiches.test.mjs pour TOUTES les fiches de la base (exercices et affiches), pas seulement celles d'une affiche.
//   - affiche (et toute fiche à `.page`) : chaque élément reste dans sa `.page` ;
//   - fiche d'exercice (le texte s'écoule sur plusieurs pages) : rien n'est plus large que la zone imprimable ;
//   - dans tous les cas : pas de défilement horizontal, rien de coupé dans une boîte à overflow caché.
// Sans serveur : le HTML est produit par node (comme au build des PDF) puis chargé dans Chrome.
//   node tests/fiches-debordement.test.mjs
import { lancerNavigateur, contexte, verifier, nbEchecs } from './outils.mjs'
import { fichesDesRegistres } from '../scripts/build/fiches/registres.ts'
import { installerPolices } from '../scripts/build/fiches/polices.ts'
import { FORMATS } from '../src/utils/page.ts'

const PARALLELE = 6
installerPolices()
const fiches = await fichesDesRegistres({ avecExemples: true })
const nav = await lancerNavigateur()
const ctx = await contexte(nav)

// éléments hors de leur page ou de la zone imprimable, contenu coupé dans une boîte à overflow caché
const defauts = page => page.evaluate(() => {
  const out = []
  const nom = e => `${e.tagName.toLowerCase()}${e.className && typeof e.className === 'string' ? '.' + e.className.split(' ')[0] : ''}`
  const feuilles = [...document.querySelectorAll('.page')]
  const zone = document.documentElement.clientWidth
  if (document.documentElement.scrollWidth > zone + 1) out.push(`défilement horizontal (${document.documentElement.scrollWidth} > ${zone})`)
  for (const feuille of feuilles) {
    const p = feuille.getBoundingClientRect()
    for (const e of feuille.querySelectorAll('*')) {
      const r = e.getBoundingClientRect()
      if (!r.width || !r.height) continue
      // la boîte d'un texte SVG englobe toute la hauteur de la police (ascendantes, descendantes, interligne ; jusqu'à plus d'un corps
      // de marge avec Playwrite FR Trad) : le dessin des lettres reste dans la page. On ne mesure donc que l'horizontale d'un texte SVG
      // (c'est elle qui coupe les mots) ; la verticale est contrôlée par tests/affiches-modele.test.mjs (zone de dessin, mesure réelle)
      const marge = e.tagName === 'text' ? Infinity : 1
      if (r.right > p.right + 1 || r.left < p.left - 1 || r.bottom > p.bottom + marge || r.top < p.top - marge) out.push(`${nom(e)} sort de la page`)
    }
  }
  for (const e of document.querySelectorAll('body *')) {
    const r = e.getBoundingClientRect()
    if (!r.width || !r.height) continue
    if (!feuilles.length && (r.right > zone + 1 || r.left < -1)) out.push(`${nom(e)} sort de la zone imprimable`)
    const s = getComputedStyle(e)
    // texte coupé : à l'horizontale, dès 2 px ; à la verticale, au-delà de l'interligne (30 % du corps du texte) : une ligne un peu
    // plus haute que sa boîte ne coupe pas les lettres, une ligne qui déborde de plus d'un interligne les coupe
    // le corps du texte est le plus grand de la boîte (un grand chiffre dans une ligne de petit texte)
    const corps = Math.max(parseFloat(s.fontSize), ...[...e.querySelectorAll('*')].map(c => parseFloat(getComputedStyle(c).fontSize) || 0))
    const interligne = Math.max(2, 0.3 * corps)
    if (s.overflow !== 'visible' && (e.scrollWidth > e.clientWidth + 2 || e.scrollHeight > e.clientHeight + interligne)) out.push(`${nom(e)} coupé « ${e.textContent.trim().replace(/\s+/g, ' ').slice(0, 25)} »`)
  }
  return [...new Set(out)]
})

// la taille de la feuille, en pixels CSS (96 ppp ; FORMATS est en millimètres) : le format, tourné si le sens est paysage
const px = mm => Math.round(mm * 96 / 25.4)
const taille = ({ format, orientation }) => {
  const { w, h } = FORMATS[format] ?? FORMATS.A4
  const [petit, grand] = [px(Math.min(w, h)), px(Math.max(w, h))]
  return orientation === 'landscape' ? { width: grand, height: petit } : { width: petit, height: grand }
}

// la première fiche (exemplaire) de chaque entrée, dans tous ses formats et sens
const documents = fiches.flatMap(f => (f.documents[0]?.formats ?? []).map(d => ({ slug: f.meta.slug, genre: f.meta.genre, ...d })))

console.log(`Mise en page des fiches (${fiches.length} fiches, ${documents.length} documents)`)
const mauvaises = []
const file = [...documents]
const pages = await Promise.all(Array.from({ length: PARALLELE }, () => ctx.newPage()))
await Promise.all(pages.map(async page => {
  await page.emulateMedia({ media: 'print' })
  for (let d = file.shift(); d !== undefined; d = file.shift()) {
    await page.setViewportSize(taille(d))
    await page.setContent(d.html, { waitUntil: 'load' })
    await page.evaluate(() => document.fonts.ready)
    const m = await defauts(page)
    if (m.length) mauvaises.push(`${d.slug} (${d.format} ${d.orientation}) : ${m.slice(0, 2).join(' ; ')}`)
  }
}))
verifier(!mauvaises.length, `${documents.length - mauvaises.length} / ${documents.length} documents sans débordement${mauvaises.length ? ` — ${mauvaises.slice(0, 3).join(' | ')}${mauvaises.length > 3 ? ` (+${mauvaises.length - 3})` : ''}` : ''}`)

console.log('Le détecteur voit un débordement')
{
  const page = pages[0]
  await page.setViewportSize({ width: 794, height: 1123 })
  await page.setContent('<body><div class="page" style="width:300px;height:200px"><div style="width:500px;height:20px;background:#ccc"></div></div></body>')
  verifier((await defauts(page)).some(d => d.includes('sort de la page')), 'un bloc plus large que sa page est vu')
  await page.setContent('<body><p style="width:2000px">trop large pour la feuille</p></body>')
  verifier((await defauts(page)).length > 0, 'un texte plus large que la zone imprimable est vu')
}
await nav.close()
process.exit(nbEchecs() ? 1 : 0)
