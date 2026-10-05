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
import { reglagesDe, jeuxDeReglages, reglagesApresVariante, optionsDe, groupesDuFormulaire, visible, typesDePolice } from '../src/affiches/outils.ts'
import { genererAffiche } from '../src/affiches/generer.ts'
import { entreesDe, catalogueDe } from '../src/affiches/catalogue.ts'
import { cleVariante, cleReglage, cleValeur, cleGroupe, clePolice } from '../src/affiches/textes.ts'
import { SITES } from '../src/sites.ts'
import { mesuresAffiche } from '../src/impression/affiches/cadre.ts'
import { contenu } from '../src/i18n/index.js'
import { NIVEAUX } from '../src/data/classes.ts'
import { domaineDe, competenceDe } from '../src/data/programme.ts'
import { creerRng } from '../src/utils/hasard.ts'
import { empreinte, racine, lireInstantanes, ecrireInstantanes, fichierInstantanes } from './outils-instantanes.mjs'
import { verifier, nbEchecs } from './outils.mjs'

const MODULES = [...REGISTRE, ...EXEMPLES]
const maj = process.argv.includes('--maj')

// une vérification par sujet : la liste des problèmes (les 3 premiers) en cas d'échec
function controler(problemes, message) {
  const p = [...new Set(problemes)]
  verifier(!p.length, `${message}${p.length ? ` — ${p.slice(0, 3).join(' ; ')}${p.length > 3 ? ` (+${p.length - 3})` : ''}` : ''}`)
}

// Éléments SVG d'une page du dessin qui sortent de la zone W × H (mm) : rect, circle, line, text (largeur estimée à 0,6 × la taille)
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
const rendu = (module, config) => module.rendu.dessin(config, mesures(config), ...contextes(module, config))
function mesures(c) { const m = mesuresAffiche({ format: c.format, orientation: c.orientation }); return { W: m.W, H: m.H } }
// T et contexte comme genererAffiche les donne (sans passer par le cadre)
function contextes(module, c) {
  const Tde = l => contenu(module.textes, l).t
  return [Tde(c.langue), { Tde, police: () => 'Andika', rng: creerRng(c.graine) }]
}

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
        ...Object.entries(optionsDe(d, v)).flatMap(([c, valeurs]) => [cleReglage(c), ...valeurs.map(x => cleValeur(c, x))]),
        ...(d.formulaire.groupes ?? []).map(g => cleGroupe(g.id)),
        ...(d.police.mode === 'parType' ? d.police.types.map(clePolice) : [])]
      for (const c of cles) if (!(c in (textes[langue] ?? {}))) pbs.push(`texte « ${c} » manquant en ${langue}`)
    }
  }
  controler(pbs, 'définition valide, compétences au programme des classes, textes présents')

  // ── Réglages ──
  const rpbs = []
  for (const [vid, v] of Object.entries(d.variantes)) {
    const abime = reglagesDe(d, { variante: vid, format: 'A5', orientation: 'x', langue: 'zz', langues: ['zz'], titre: 42, polices: 'oups', graine: -3, inconnu: 1, ...Object.fromEntries(Object.keys(optionsDe(d, v)).map(c => [c, 'n’importe quoi'])) })
    if (JSON.stringify(abime) !== JSON.stringify(reglagesDe(d, { variante: vid }))) rpbs.push(`${vid} : des réglages abîmés ne reprennent pas les défauts`)
    for (const autre of Object.keys(d.variantes)) {
      const apres = reglagesApresVariante(d, reglagesDe(d, { variante: autre }), vid)
      if (apres.variante !== vid) rpbs.push(`changer vers ${vid} garde ${apres.variante}`)
    }
  }
  if (reglagesDe(d, { titre: 'x'.repeat(500) }).titre.length > 80) rpbs.push('titre non limité')
  for (const type of typesDePolice(d)) if (reglagesDe(d, { polices: { [type]: 'Police Inconnue' } }, ['Autre']).polices[type] === 'Police Inconnue') rpbs.push(`police inconnue gardée (${type})`)
  // visibleSi : un réglage invisible reprend son défaut, un réglage visible est gardé
  for (const [cle, c] of Object.entries(d.formulaire.visibleSi ?? {})) {
    for (const [vid, v] of Object.entries(d.variantes)) {
      const base = reglagesDe(d, { variante: vid })
      const cond = base[c.reglage] === c.valeur
      const essai = cle === 'graine' ? { graine: 7 } : cle === 'langues' ? { langues: d.langues } : { [cle]: optionsDe(d, v)[cle]?.at(-1) }
      const lu = reglagesDe(d, { ...base, ...essai })
      const garde = cle === 'graine' ? lu.graine === 7 : cle === 'langues' ? lu.langues.length === (d.bilingue ? d.langues.length : 1) : true
      if (cond !== visible(d, cle, base)) rpbs.push(`${vid} : visible(${cle}) incohérent`)
      if (cond && !garde) rpbs.push(`${vid} : ${cle} visible mais perdu`)
      if (!cond && cle === 'graine' && lu.graine === 7) rpbs.push(`${vid} : ${cle} invisible mais gardé`)
      if (!cond && cle === 'langues' && lu.langues.length > 1) rpbs.push(`${vid} : ${cle} invisible mais gardé`)
      if (!cond && groupesDuFormulaire(d, base).some(g => g.elements.some(e => e.cle === cle))) rpbs.push(`${vid} : ${cle} invisible mais dans le formulaire`)
    }
  }
  controler(rpbs, 'réglages abîmés, titre, polices, visibilité, changement de variante : valeurs valides')

  // ── Dessin, document, catalogue ──
  const dpbs = [], hpbs = [], epbs = [], fpbs = []
  const vids = Object.keys(d.variantes)
  let graineChange = false
  for (const vid of vids) {
    for (const [nom, reglages] of Object.entries(jeuxDeReglages(d, vid, { horsProgramme: true }))) {
      const cas = `${d.id}/${vid}/${nom}`
      const a = genererAffiche(module, reglages), b = genererAffiche(module, reglages)
      const pages = rendu(module, reglagesDe(d, reglages))
      if (a.html !== b.html) dpbs.push(`${cas} : pas déterministe`)
      if (!pages.length) dpbs.push(`${cas} : aucune page`)
      if (a.nbPages !== pages.length || (a.html.match(/<section class="page">/g) ?? []).length !== pages.length) dpbs.push(`${cas} : nombre de pages incohérent (${a.nbPages} / ${pages.length})`)
      if (!new RegExp(`@page \\{ size: ${reglages.format} ${reglages.orientation}`).test(a.html)) dpbs.push(`${cas} : @page ≠ ${reglages.format} ${reglages.orientation}`)
      const m = mesuresAffiche({ format: reglages.format, orientation: reglages.orientation, marge: d.marge, hTitre: d.hTitre })
      if (!a.html.includes(`inset:${m.marge}mm`)) hpbs.push(`${cas} : marge du cadre absente`)
      for (const p of pages) {
        const corps = typeof p === 'string' ? p : p.corps
        if (corps.includes('<svg')) hpbs.push(...horsZone(corps, m.W, m.H).map(x => `${cas} : ${x}`))
      }
      // le titre de l'élève est échappé ; le titre et l'interface restent dans la police de base
      if (nom === 'titre' && (!a.html.includes('Mon &lt;titre&gt; &amp; &quot;autre&quot;') || a.html.includes('<titre>'))) fpbs.push(`${cas} : titre personnalisé mal échappé`)
      if (!/h1 \{ font-family: 'Andika'/.test(a.html)) fpbs.push(`${cas} : le titre n'est pas dans la police de base`)
      if (d.hasard && nom === 'graine=2' && a.html !== genererAffiche(module, { ...reglages, graine: 1 }).html) graineChange = true
      if (!d.hasard && genererAffiche(module, { ...reglages, graine: 99 }).html !== a.html) dpbs.push(`${cas} : dépend de la graine alors que l'affiche n'a pas de hasard`)
      empreintes[cas + '/' + reglages.langues.join('+')] = empreinte(a.html)
    }
  }
  if (d.hasard && !graineChange) dpbs.push('la graine ne change aucune variante')
  // polices choisies : en mode unique celle de l'élève sert au texte ; par type, chaque type a la sienne dans le HTML
  const types = typesDePolice(d)
  const choisies = Object.fromEntries(types.map((t, i) => [t, `Police${i}`]))
  const html = genererAffiche(module, { polices: choisies }).html
  if (d.police.mode === 'unique' && !html.includes("font-family: 'Police0'")) fpbs.push('police unique non appliquée')
  if (d.police.mode === 'parType') for (const t of types) if (!html.includes(`'${choisies[t]}'`)) fpbs.push(`police ${t} non appliquée`)
  controler(dpbs, 'dessin déterministe, au moins une page, nombre de pages cohérent, @page au bon format, graine seulement si hasard')
  controler(hpbs, 'rien ne dépasse de la zone, marge du cadre (chaque page × variante × réglage × format × orientation × langues)')
  controler(fpbs, 'titre échappé et dans la police de base, polices choisies appliquées')

  const entrees = entreesDe(module)
  const slugs = entrees.map(e => e.slug)
  const attendues = vids.length * (d.bilingue && d.langues.length > 1 ? d.langues.length + 1 : d.langues.length)
  if (entrees.length !== attendues) epbs.push(`${entrees.length} entrées au lieu de ${attendues}`)
  if (slugs.some((s, i) => slugs.indexOf(s) !== i)) epbs.push('slugs en double')
  for (const e of entrees) {
    for (const cle of ['slug', 'court', 'titre', 'description', 'domaine', 'genre']) if (!e[cle] || e[cle].startsWith('variante.')) epbs.push(`${e.slug} : ${cle} vide ou clé de texte`)
    if (!e.niveaux.length || !e.competences.length || !e.langues.length) epbs.push(`${e.slug} : niveaux, compétences ou langues vides`)
    if (!Number.isInteger(e.pages) || e.pages < 1) epbs.push(`${e.slug} : pages`)
    if (e.pages !== genererAffiche(module, e.config).nbPages) epbs.push(`${e.slug} : pages ≠ document`)
    if (!e.lien.includes(`affiche=${d.id}&variante=${e.config.variante}`)) epbs.push(`${e.slug} : lien`)
    if (e.competences.some(id => !competenceDe(id))) epbs.push(`${e.slug} : compétence inconnue`)
    if (reglagesDe(d, e.config).langues.join() !== e.langues.join()) epbs.push(`${e.slug} : config ≠ langues`)
  }
  // le catalogue est écrit en JSON par le build : il doit survivre à l'aller-retour (donc aucune fonction, aucun undefined)
  if (JSON.stringify(JSON.parse(JSON.stringify(entrees))) !== JSON.stringify(entrees)) epbs.push('le catalogue n’est pas sérialisable')
  // chaque site publie les langues qu'il propose
  for (const [id, site] of Object.entries(SITES)) {
    const publiees = catalogueDe([module], site).flatMap(e => e.langues)
    const permises = new Set([...site.languesInterface, ...site.languesRegionales])
    if (publiees.some(l => !permises.has(l))) epbs.push(`${id} : publie une langue qu'il ne propose pas`)
    if (!publiees.length) epbs.push(`${id} : aucune entrée`)
  }
  const soloFr = catalogueDe([module], { languesInterface: ['fr'], languesRegionales: [] })
  if (soloFr.some(e => e.langues.join() !== 'fr') || soloFr.length !== vids.length) epbs.push(`un site français seul : ${soloFr.length} entrées (langues ${soloFr.map(e => e.langues)})`)
  controler(epbs, `catalogue dérivé : ${entrees.length} entrée(s), sérialisable, filtré par site`)
}

// ── Instantané : empreinte de chaque document ──
console.log('\nInstantané')
const fichier = fichierInstantanes('affiches')
const attendues = lireInstantanes(fichier)
if (maj || !attendues) { ecrireInstantanes(fichier, empreintes); console.log(`  ${Object.keys(empreintes).length} empreintes écrites dans ${fichier}`) }
else {
  const ecarts = [...new Set([...Object.keys(empreintes), ...Object.keys(attendues)])].filter(k => attendues[k] !== empreintes[k])
  controler(ecarts.map(k => `${k}${attendues[k] ? (empreintes[k] ? ' a changé' : ' a disparu') : ' est nouveau'}`), `${Object.keys(empreintes).length} documents identiques à l'instantané (--maj pour accepter un écart voulu)`)
}

process.exit(nbEchecs() ? 1 : 0)
