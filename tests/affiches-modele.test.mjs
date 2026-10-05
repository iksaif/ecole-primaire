// Affiches au format « définition » (src/affiches/, plan 10) : test node, sans Chrome ni serveur. Se lit comme le test des
// exercices : pour chaque affiche (registre + exemples de dev), chaque variante, chaque langue et chaque jeu de réglages,
// la définition est valide, ses compétences sont au programme des niveaux, le dessin est déterministe et reste dans sa
// zone, le catalogue dérivé est complet, et l'empreinte du document ne bouge pas (tests/instantanes/affiches.json).
//   node tests/affiches-modele.test.mjs [--maj]      --maj : réécrire les empreintes
// Le test Chrome de mise en page (tests/affiches.test.mjs) couvre aussi les exemples quand il tourne sur le serveur de dev.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { REGISTRE } from '../src/affiches/index.ts'
import { EXEMPLES } from '../src/affiches/exemples.ts'
import { reglagesDe, jeuxDeReglages, reglagesApresVariante, optionsDe } from '../src/affiches/outils.ts'
import { genererAffiche } from '../src/affiches/generer.ts'
import { entreesDe } from '../src/affiches/catalogue.ts'
import { cleVariante, cleReglage, cleValeur } from '../src/affiches/textes.ts'
import { mesuresAffiche } from '../src/impression/affiches/cadre.ts'
import { contenu } from '../src/i18n/index.js'
import { NIVEAUX } from '../src/data/classes.ts'
import { domaineDe, competenceDe } from '../src/data/programme.ts'
import { empreinte, racine, lireInstantanes, ecrireInstantanes, fichierInstantanes } from './outils-instantanes.mjs'
import { verifier, nbEchecs } from './outils.mjs'

const MODULES = [...REGISTRE, ...EXEMPLES]
const maj = process.argv.includes('--maj')

// une vérification par sujet : la liste des problèmes (les 3 premiers) en cas d'échec
function controler(problemes, message) {
  const p = [...new Set(problemes)]
  verifier(!p.length, `${message}${p.length ? ` — ${p.slice(0, 3).join(' ; ')}${p.length > 3 ? ` (+${p.length - 3})` : ''}` : ''}`)
}

// Éléments SVG du dessin qui sortent de la zone W × H (mm) : rect, circle, line, text (largeur estimée à 0,6 × la taille)
function horsZone(svg, W, H) {
  const pbs = []
  const [vb] = [...svg.matchAll(/viewBox="0 0 ([\d.]+) ([\d.]+)"/g)]
  if (!vb || +vb[1] > W + 0.01 || +vb[2] > H + 0.01) pbs.push(`viewBox ${vb?.[1]}×${vb?.[2]} plus grand que la zone ${W}×${H}`)
  const dans = (x, y, d) => { if (x < -0.01 || y < -0.01 || x > W + 0.01 || y > H + 0.01) pbs.push(`${d} hors de la zone`) }
  const attr = (el, a) => +(el.match(new RegExp(`\\b${a}="(-?[\\d.]+)"`))?.[1] ?? NaN)
  for (const [el] of svg.matchAll(/<(rect|circle|line|text)\b[^>]*>(?:[^<]*<\/text>)?/g)) {
    const nom = el.match(/^<(\w+)/)[1]
    if (nom === 'rect') dans(attr(el, 'x'), attr(el, 'y'), 'rect') || dans(attr(el, 'x') + attr(el, 'width'), attr(el, 'y') + attr(el, 'height'), 'rect')
    if (nom === 'circle') { const r = attr(el, 'r'); dans(attr(el, 'cx') - r, attr(el, 'cy') - r, 'circle'); dans(attr(el, 'cx') + r, attr(el, 'cy') + r, 'circle') }
    if (nom === 'line') { dans(attr(el, 'x1'), attr(el, 'y1'), 'line'); dans(attr(el, 'x2'), attr(el, 'y2'), 'line') }
    if (nom === 'text') {
      const taille = attr(el, 'font-size'), n = (el.match(/>([^<]*)</)?.[1] ?? '').length
      dans(attr(el, 'x') - 0.3 * taille * n, attr(el, 'y') - taille / 2, 'text'); dans(attr(el, 'x') + 0.3 * taille * n, attr(el, 'y') + taille / 2, 'text')
    }
  }
  return pbs
}

console.log('Registre')
const dossiers = readdirSync(join(racine, 'src/affiches')).filter(d => statSync(join(racine, 'src/affiches', d)).isDirectory())
const ids = MODULES.map(m => m.definition.id)
controler(dossiers.filter(d => !MODULES.some(m => m.definition.id === d)).map(d => `${d} absent de index.ts et de exemples.ts`), `${dossiers.length} dossier(s), tous dans un registre`)
controler(ids.filter((id, i) => ids.indexOf(id) !== i).map(id => `${id} en double`), 'ids uniques')

// Rien de production n'importe exemples.js autrement que par import() : sinon l'exemple partirait dans le build
const fichiers = d => readdirSync(join(racine, d)).flatMap(f => (statSync(join(racine, d, f)).isDirectory() ? fichiers(join(d, f)) : /\.(js|ts|vue)$/.test(f) ? [join(d, f)] : []))
const fautifs = fichiers('src').filter(f => /^\s*import\s[^(]*from\s+['"][^'"]*affiches\/exemples(\.ts)?['"]/m.test(readFileSync(join(racine, f), 'utf8')))
controler(fautifs.map(f => `${f} importe exemples.ts statiquement`), 'exemples.ts : aucun import statique dans src/')

const empreintes = {}
for (const module of MODULES) {
  const { definition: d, textes } = module
  console.log(`\n${d.id}`)

  // ── Définition (definirAffiche a déjà vérifié la déclaration à l'import : ici, ce qui dépend des données) ──
  const pbs = []
  if (d.genre !== 'affiche') pbs.push(`genre « ${d.genre} »`)
  if (!domaineDe(d.domaine)) pbs.push(`domaine ${d.domaine} inconnu`)
  for (const [vid, v] of Object.entries(d.variantes)) {
    for (const n of v.niveaux) if (!NIVEAUX.includes(n)) pbs.push(`${vid} : classe ${n} inconnue`)
    if (!v.competences.length) pbs.push(`${vid} : aucune compétence`)
    for (const id of v.competences) {
      const k = competenceDe(id)
      if (!k) pbs.push(`${vid} : compétence ${id} inconnue de programme.ts`)
      else for (const n of v.niveaux) if (!k.niveaux.includes(n)) pbs.push(`${vid} : ${id} n'est pas au programme du ${n}`)
    }
    // les valeurs par défaut sont au programme
    const defauts = reglagesDe(d, { variante: vid })
    for (const cle of Object.keys(optionsDe(d, v))) {
      if (v.horsProgramme?.some(h => h.reglage === cle && h.option === defauts[cle]) || v.bonus?.[cle]?.includes(defauts[cle])) pbs.push(`${vid} : ${cle} par défaut hors programme`)
    }
    // textes : chaque clé existe dans chaque langue (sinon la lecture retombe sur le français ou sur la clé elle-même)
    for (const langue of d.langues) {
      const cles = ['titre', cleVariante(vid, 'court'), cleVariante(vid, 'titre'), cleVariante(vid, 'description'),
        ...Object.entries(optionsDe(d, v)).flatMap(([c, valeurs]) => [cleReglage(c), ...valeurs.map(x => cleValeur(c, x))])]
      for (const c of cles) if (!(c in (textes[langue] ?? {}))) pbs.push(`texte « ${c} » manquant en ${langue}`)
    }
  }
  controler(pbs, 'définition valide, compétences au programme des classes, textes présents')

  // ── Réglages ──
  const rpbs = []
  for (const [vid, v] of Object.entries(d.variantes)) {
    const abime = reglagesDe(d, { variante: vid, format: 'A5', orientation: 'x', langue: 'zz', inconnu: 1, ...Object.fromEntries(Object.keys(optionsDe(d, v)).map(c => [c, 'n’importe quoi'])) })
    if (JSON.stringify(abime) !== JSON.stringify(reglagesDe(d, { variante: vid }))) rpbs.push(`${vid} : des réglages abîmés ne reprennent pas les défauts`)
    for (const autre of Object.keys(d.variantes)) {
      const apres = reglagesApresVariante(d, reglagesDe(d, { variante: autre }), vid)
      if (apres.variante !== vid) rpbs.push(`changer vers ${vid} garde ${apres.variante}`)
    }
  }
  controler(rpbs, 'réglages abîmés ou changement de variante : valeurs valides')

  // ── Dessin, document, catalogue ──
  const dpbs = [], hpbs = [], epbs = []
  for (const vid of Object.keys(d.variantes)) for (const langue of d.langues) {
    for (const [nom, reglages] of Object.entries(jeuxDeReglages(d, vid, { horsProgramme: true }))) {
      const cfg = { ...reglages, langue }
      const a = genererAffiche(module, cfg), b = genererAffiche(module, cfg)
      const cas = `${d.id}/${vid}/${langue}/${nom}`
      if (a.html !== b.html) dpbs.push(`${cas} : pas déterministe`)
      if (a.nbPages !== 1) dpbs.push(`${cas} : ${a.nbPages} pages`)
      if (!new RegExp(`@page \\{ size: ${cfg.format} ${cfg.orientation}`).test(a.html)) dpbs.push(`${cas} : @page ≠ ${cfg.format} ${cfg.orientation}`)
      const m = mesuresAffiche({ format: cfg.format, orientation: cfg.orientation, marge: d.marge, hTitre: d.hTitre })
      const svg = module.rendu.dessin(reglagesDe(d, cfg), { W: m.W, H: m.H }, contenu(textes, langue).t)
      hpbs.push(...horsZone(svg, m.W, m.H).map(p => `${cas} : ${p}`))
      if (!a.html.includes(`inset:${m.marge}mm`)) hpbs.push(`${cas} : marge du cadre absente`)
      empreintes[cas] = empreinte(a.html)
    }
  }
  const entrees = entreesDe(module)
  const slugs = entrees.map(e => e.slug)
  if (entrees.length !== Object.keys(d.variantes).length * d.langues.length) epbs.push('une entrée par variante et par langue')
  if (slugs.some((s, i) => slugs.indexOf(s) !== i)) epbs.push('slugs en double')
  for (const e of entrees) {
    for (const cle of ['slug', 'court', 'titre', 'description', 'domaine', 'genre']) if (!e[cle] || e[cle].startsWith('variante.')) epbs.push(`${e.slug} : ${cle} vide ou clé de texte`)
    if (!e.niveaux.length || !e.competences.length) epbs.push(`${e.slug} : niveaux ou compétences vides`)
    if (!e.lien.includes(`affiche=${d.id}&variante=${e.config.variante}`)) epbs.push(`${e.slug} : lien`)
    if (e.competences.some(id => !competenceDe(id))) epbs.push(`${e.slug} : compétence inconnue`)
  }
  // le catalogue est écrit en JSON par le build : il doit survivre à l'aller-retour (donc aucune fonction, aucun undefined)
  if (JSON.stringify(JSON.parse(JSON.stringify(entrees))) !== JSON.stringify(entrees)) epbs.push('le catalogue n’est pas sérialisable')
  controler(dpbs, 'dessin déterministe, une page, @page au bon format')
  controler(hpbs, 'rien ne dépasse de la zone, marge du cadre (chaque variante × langue × réglage × format × orientation)')
  controler(epbs, `catalogue dérivé : ${entrees.length} entrée(s)`)
}

// ── Instantané : empreinte de chaque document ──
console.log('\nInstantané')
const fichier = fichierInstantanes('affiches')
const attendues = lireInstantanes(fichier)
if (maj || !attendues) { ecrireInstantanes(fichier, empreintes); console.log(`  ${Object.keys(empreintes).length} empreintes écrites dans ${fichier}`) }
else {
  const ecarts = Object.keys(empreintes).filter(k => attendues[k] !== empreintes[k])
  controler(ecarts.map(k => `${k}${attendues[k] ? ' a changé' : ' est nouveau'}`), `${Object.keys(empreintes).length} documents identiques à l'instantané (--maj pour accepter un écart voulu)`)
}

process.exit(nbEchecs() ? 1 : 0)
