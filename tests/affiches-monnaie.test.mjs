// L'affiche « Pièces et billets » dans Chrome : chaque fiche publiée (4 variantes × français, breton) dans chaque format et chaque
// sens ne dépasse pas de la feuille, rien n'est coupé dans sa boîte, et la planche à découper est À LA TAILLE RÉELLE (chaque pièce
// et chaque billet mesure ses millimètres sur la feuille). Le test node (affiches-modele) contrôle le dessin avec la mesure estimée ;
// celui-ci contrôle la mise en page réelle (reprend tests/ancien/affiches.test.mjs pour cette affiche).
// Sans serveur : le HTML est produit par node (comme au build des PDF) puis chargé dans Chrome.
import { lancerNavigateur, contexte, verifier, nbEchecs } from './outils.mjs'
import { REGISTRE } from '../src/affiches/index.ts'
import { genererAffiche } from '../src/affiches/generer.ts'
import { entreesDe } from '../src/affiches/catalogue.ts'
import { reglagesDe } from '../src/affiches/outils.ts'
import { installerPolices } from '../scripts/build/fiches/polices.ts'
import { VALEURS_BILLETS, VALEURS_PIECES, tailleReelle } from '../src/dessins/argent.ts'

installerPolices()
const module = REGISTRE.find(m => m.definition.id === 'monnaie')
const nav = await lancerNavigateur()
const page = await (await contexte(nav)).newPage()

// éléments hors de leur page, contenu coupé dans une boîte à overflow caché
const defauts = () => page.evaluate(() => {
  const out = []
  for (const feuille of document.querySelectorAll('.page')) {
    const p = feuille.getBoundingClientRect()
    for (const e of feuille.querySelectorAll('*')) {
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
const charger = async html => { await page.setContent(html, { waitUntil: 'load' }); await page.evaluate(() => document.fonts.ready) }

console.log('Mise en page (fiches publiées × formats × sens)')
let total = 0
let bons = 0
for (const e of entreesDe(module)) {
  for (const [format, orientation] of [['A4', 'landscape'], ['A4', 'portrait'], ['A3', 'landscape'], ['A3', 'portrait']]) {
    await charger(genererAffiche(module, reglagesDe(module.definition, { ...e.config, format, orientation })).html)
    const d = await defauts()
    total++
    if (d.length) verifier(false, `${e.slug} ${format} ${orientation} : ${d.slice(0, 3).join(' ; ')}`); else bons++
  }
}
verifier(total === 32 && bons === total, `${bons} / ${total} documents sans débordement (8 fiches × 4 feuilles)`)

console.log('Planche à découper : taille réelle et réduite')
// largeurs et hauteurs réelles (mm) de toutes les pièces et de tous les billets
const reelles = [...VALEURS_PIECES, ...VALEURS_BILLETS].map(v => tailleReelle(v))
for (const variante of ['planche-euros', 'planche-centimes']) {
  for (const [format, orientation, tp, tb] of [['A4', 'landscape', 100, 100], ['A4', 'portrait', 100, 100], ['A3', 'landscape', 100, 100], ['A4', 'landscape', 75, 75], ['A4', 'portrait', 50, 50], ['A4', 'landscape', 50, 100], ['A4', 'portrait', 100, 75]]) {
    const cas = `${variante} ${format} ${orientation} pièces ${tp} % billets ${tb} %`
    await charger(genererAffiche(module, reglagesDe(module.definition, { variante, format, orientation, taillePieces: tp, tailleBillets: tb })).html)
    // le SVG de la page est à l'échelle 1 (largeur en mm = largeur du viewBox : 1 unité = 1 mm) et chaque pièce ou billet y est dessiné
    // à ses millimètres × l'échelle (largeur et hauteur du <svg> imbriqué, sans unité). (La boîte à l'écran d'un <svg> imbriqué est celle de
    // son contenu, un peu plus petite que sa taille nominale : on lit donc les attributs, et on contrôle l'échelle sur le SVG de la page.)
    const lu = await page.evaluate(() => [...document.querySelectorAll('.page')].map(feuille => {
      const racine = feuille.querySelector('svg')
      const [, , vw, vh] = racine.getAttribute('viewBox').split(' ').map(Number)
      const r = racine.getBoundingClientRect()
      return {
        echelle: racine.getAttribute('width') === `${vw}mm` && racine.getAttribute('height') === `${vh}mm`,
        mm: r.width / vw * 25.4 / 96 / (feuille.getBoundingClientRect().width / (feuille.offsetWidth || 1)),   // px par mm de la feuille, rapporté à 1
        articles: [...racine.querySelectorAll('svg')].map(s => [Number(s.getAttribute('width')), Number(s.getAttribute('height'))]),
        consigne: feuille.querySelector('.consigne')?.textContent ?? '',
      }
    }))
    const tailles = lu.flatMap(l => l.articles)
    verifier(lu.every(l => l.echelle && Math.abs(l.mm - 1) < 0.01), `${cas} : le SVG de chaque page est à l'échelle 1 (1 unité = 1 mm)`)
    const faux = tailles.filter(([w, h]) => ![tp, tb].some(e => reelles.some(t => Math.abs(t.w * e / 100 - w) < 0.01 && Math.abs(t.h * e / 100 - h) < 0.01)))
    verifier(tailles.length > 0 && !faux.length, `${cas} : ${tailles.length} pièces et billets, tous à la taille réelle ou à ${tp} % (pièces) / ${tb} % (billets)${faux.length ? ` (faux : ${faux[0].map(x => x.toFixed(1)).join(' × ')} mm)` : ''}`)
    verifier(lu.every(l => (tp !== tb ? new RegExp(`Pièces à ${tp} % et billets à ${tb} %`) : tp === 100 ? /Taille réelle/ : new RegExp(`${tp} %`)).test(l.consigne)), `${cas} : la consigne dit la taille`)
  }
}
// des pages qui ne se chevauchent pas : une pièce ou un billet n'en couvre jamais un autre
await charger(genererAffiche(module, reglagesDe(module.definition, { variante: 'planche-centimes', taillePieces: 75, tailleBillets: 75 })).html)
const chevauche = await page.evaluate(() => {
  const pbs = []
  for (const feuille of document.querySelectorAll('.page')) {
    const r = [...feuille.querySelectorAll('svg svg')].map(s => s.getBoundingClientRect())
    for (let i = 0; i < r.length; i++) for (let j = i + 1; j < r.length; j++) {
      if (r[i].left < r[j].right - 1 && r[j].left < r[i].right - 1 && r[i].top < r[j].bottom - 1 && r[j].top < r[i].bottom - 1) pbs.push(`${i}/${j}`)
    }
  }
  return pbs
})
verifier(!chevauche.length, `planche : aucune pièce ni aucun billet ne se chevauche${chevauche.length ? ` (${chevauche.slice(0, 3)})` : ''}`)

await nav.close()
// code de sortie lu par tests/lancer.mjs
process.exit(nbEchecs() ? 1 : 0)
