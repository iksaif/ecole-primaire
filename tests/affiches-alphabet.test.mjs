// L'affiche de l'alphabet dans Chrome, avec les vraies polices (Andika, Playwrite FR Trad) : le document de chaque fiche publiée
// (18 entrées : variantes × français, breton, les deux) dans chaque format et chaque sens ne dépasse pas de la feuille, et
// aucun texte ne sort de sa carte. Le test node (affiches-modele) fait le même contrôle avec la mesure ESTIMÉE ; celui-ci
// vérifie qu'elle ne se trompe pas assez pour déborder (l'attaché, la police la plus irrégulière).
// Sans serveur : le HTML est produit par node (comme au build des PDF) puis chargé dans Chrome.
import { lancerNavigateur, contexte, verifier, nbEchecs } from './outils.mjs'
import { REGISTRE } from '../src/affiches/index.ts'
import { genererAffiche } from '../src/affiches/generer.ts'
import { entreesDe } from '../src/affiches/catalogue.ts'
import { reglagesDe } from '../src/affiches/outils.ts'
import { installerPolices } from '../scripts/build/fiches/polices.ts'

installerPolices()
const module = REGISTRE.find(m => m.definition.id === 'alphabet')
const nav = await lancerNavigateur()
const page = await (await contexte(nav)).newPage()

// pour chaque page : texte et trait qui sortent de la carte qui les contient (les cartes précèdent leurs textes dans le SVG)
const defauts = () => page.evaluate(() => {
  const out = []
  document.querySelectorAll('.page').forEach((feuille, n) => {
    const p = feuille.getBoundingClientRect()
    const svg = feuille.querySelector('svg')
    const s = svg.getBoundingClientRect()
    if (s.right > p.right + 1 || s.bottom > p.bottom + 1 || s.left < p.left - 1 || s.top < p.top - 1) out.push(`page ${n + 1} : le dessin sort de la feuille`)
    let carte = null
    for (const e of svg.children) {
      const r = e.getBoundingClientRect()
      if (e.tagName === 'rect') { carte = r; continue }
      if (!carte || e.tagName !== 'text') continue
      // horizontalement, la largeur réelle du texte doit tenir dans la carte ; 1 px de tolérance. (Pas de contrôle vertical : la boîte
      // d'un texte est celle de la police, plus haute que ses lettres ; la hauteur est réglée par les proportions de la police.)
      if (r.left < carte.left - 1 || r.right > carte.right + 1) out.push(`page ${n + 1} : « ${e.textContent} » dépasse de sa carte`)
    }
  })
  return [...new Set(out)]
})

let total = 0, bons = 0
for (const e of entreesDe(module)) {
  for (const [format, orientation] of [['A4', 'landscape'], ['A4', 'portrait'], ['A3', 'landscape'], ['A3', 'portrait']]) {
    const { html } = genererAffiche(module, reglagesDe(module.definition, { ...e.config, format, orientation }))
    await page.setContent(html, { waitUntil: 'load' })
    await page.evaluate(() => document.fonts.ready)
    const d = await defauts()
    total++
    if (d.length) verifier(false, `${e.slug} ${format} ${orientation} : ${d.slice(0, 3).join(' ; ')}`); else bons++
  }
}
verifier(total === 72 && bons === total, `${bons} / ${total} documents sans débordement (18 fiches × 4 feuilles)`)

// toutes les écritures ensemble, et l'attaché seul avec ses lignes, dans les deux langues sur une même feuille
let ok = true
for (const styles of [['script-maj', 'script-min', 'attache-maj', 'attache-min'], ['attache-maj', 'attache-min'], ['attache-min']]) {
  for (const serie of ['alphabet', 'speciales']) {
    const { html } = genererAffiche(module, { variante: 'a4-portrait', styles, serie, langues: ['fr', 'br'], lignes: true })
    await page.setContent(html, { waitUntil: 'load' })
    await page.evaluate(() => document.fonts.ready)
    const d = await defauts()
    if (d.length) { ok = false; verifier(false, `${styles} ${serie} : ${d.slice(0, 3).join(' ; ')}`) }
  }
}
verifier(ok, 'les écritures seules, avec lignes, fr + br, alphabet et lettres spéciales : sans débordement')

await nav.close()
process.exit(nbEchecs() ? 1 : 0)
