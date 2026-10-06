// Affiches au format « définition » (src/affiches/, plan 10) : test node, sans Chrome ni serveur. Se lit comme le test des
// exercices : pour chaque affiche (registre + exemples de dev), chaque variante, chaque langue et chaque jeu de réglages,
// la définition est valide, ses compétences sont au programme des niveaux, le dessin est déterministe et reste dans sa
// zone, le catalogue dérivé est complet, et l'empreinte du document ne bouge pas (tests/instantanes/affiches.json).
//   node tests/affiches-modele.test.mjs [--maj]      --maj : réécrire les empreintes
// Le test Chrome de mise en page (tests/affiches.test.mjs) couvre aussi les exemples quand il tourne sur le serveur de dev.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { REGISTRE } from '../src/affiches/index.ts'
import { EXEMPLES } from '../src/affiches/dev.ts'
import {
  reglagesDe, jeuxDeReglages, reglagesApresVariante, optionsDe, champsDe, groupesDuFormulaire, visible, evaluer, reglagesDeCondition, typesDePolice,
  typesDePoliceVisibles, valeurDeChamp, valeursProposees, appliquerPrereglage, prereglageActif,
} from '../src/affiches/outils.ts'
import { definirAffiche, choix, cases, texte, nombre } from '../src/affiches/definir.ts'
import { mesureEstimee } from '../src/affiches/mesure.ts'
import * as riche from '../src/affiches/exemple-riche/definition.ts'
import { genererAffiche } from '../src/affiches/generer.ts'
import { entreesDe, catalogueDe, lireLien } from '../src/affiches/catalogue.ts'
import { cleVariante, cleReglage, cleValeur, cleGroupe, clePolice, clePrereglage } from '../src/affiches/textes.ts'
import { SITES } from '../src/sites.ts'
import { mesuresAffiche } from '../src/impression/affiches/cadre.ts'
import { traducteurAffiche } from '../src/affiches/textes.ts'
import { NIVEAUX } from '../src/data/classes.ts'
import { domaineDe, competenceDe } from '../src/data/programme.ts'
import { D, K } from '../src/noyau/ids.ts'
import { creerRng } from '../src/utils/hasard.ts'
import { empreinte, racine, lireInstantanes, ecrireInstantanes, fichierInstantanes } from './outils-instantanes.mjs'
import { verifier, nbEchecs } from './outils.mjs'

const MODULES = [...REGISTRE, ...EXEMPLES]
const module_riche = EXEMPLES.find(m => m.definition.id === 'exemple-riche')
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
      // largeur du texte : la mesure estimée de la police de l'élément (Andika sinon), pas une moyenne par caractère
      const taille = attr(el, 'font-size'), contenu = (el.match(/>([^<]*)</)?.[1] ?? '').replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"')
      const largeur = mesureEstimee.largeur(contenu, el.match(/font-family="'([^']+)'/)?.[1] ?? 'Andika') * taille
      const ancre = el.match(/text-anchor="(\w+)"/)?.[1] ?? 'middle'
      const gauche = ancre === 'middle' ? attr(el, 'x') - largeur / 2 : ancre === 'end' ? attr(el, 'x') - largeur : attr(el, 'x')
      dans(gauche, attr(el, 'y') - taille / 2, 'text'); dans(gauche + largeur, attr(el, 'y') + taille / 2, 'text')
    }
  }
  return pbs
}

console.log('Registre')
const dossiers = readdirSync(join(racine, 'src/affiches')).filter(d => statSync(join(racine, 'src/affiches', d)).isDirectory())
const ids = MODULES.map(m => m.definition.id)
controler(dossiers.filter(d => !MODULES.some(m => m.definition.id === d)).map(d => `${d} absent de index.ts et de dev.ts`), `${dossiers.length} dossier(s), tous dans un registre`)
controler(ids.filter((id, i) => ids.indexOf(id) !== i).map(id => `${id} en double`), 'ids uniques')

// Rien de production n'importe dev.ts autrement que par import() : sinon l'exemple partirait dans le build
const fichiers = d => readdirSync(join(racine, d)).flatMap(f => (statSync(join(racine, d, f)).isDirectory() ? fichiers(join(d, f)) : /\.(js|ts|vue)$/.test(f) ? [join(d, f)] : []))
const fautifs = fichiers('src').filter(f => /^\s*import\s[^(]*from\s+['"][^'"]*affiches\/dev(\.ts)?['"]/m.test(readFileSync(join(racine, f), 'utf8')))
controler(fautifs.map(f => `${f} importe dev.ts statiquement`), 'dev.ts : aucun import statique dans src/')

const empreintes = {}
const rendu = (module, config) => module.rendu.dessin(config, mesures(config), ...contextes(module, config))
function mesures(c) { const m = mesuresAffiche({ format: c.format, orientation: c.orientation }); return { W: m.W, H: m.H } }
// T et contexte comme genererAffiche les donne (sans passer par le cadre)
function contextes(module, c) {
  const Tde = l => traducteurAffiche(module.textes, l)
  return [Tde(c.langue), { Tde, police: () => "'Andika', Arial, sans-serif", nomPolice: () => 'Andika', mesure: mesureEstimee, rng: creerRng(c.graine) }]
}

for (const module of MODULES) {
  const { definition: d, textes } = module
  console.log(`\n${d.id}`)

  // ── Définition (definirAffiche a déjà vérifié la déclaration à l'import : ici, ce qui dépend des données) ──
  const pbs = []
  if (d.genre !== 'affiche') pbs.push(`genre « ${d.genre} »`)
  if (!domaineDe(d.domaine)) pbs.push(`domaine ${d.domaine} inconnu`)
  for (const [vid, v] of Object.entries(d.variantes)) {
    for (const n of v.classes) if (!NIVEAUX.includes(n)) pbs.push(`${vid} : classe ${n} inconnue`)
    if (!v.competences.length) pbs.push(`${vid} : aucune compétence`)
    for (const id of v.competences) {
      const k = competenceDe(id)
      if (!k) pbs.push(`${vid} : compétence ${id} inconnue de programme.ts`)
      else for (const n of v.classes) if (!k.niveaux.includes(n)) pbs.push(`${vid} : ${id} n'est pas au programme du ${n}`)
    }
    // les valeurs par défaut sont au programme
    const defauts = reglagesDe(d, { variante: vid })
    for (const cle of Object.keys(optionsDe(d, v))) {
      if (v.horsProgramme?.some(h => 'reglage' in h && h.reglage === cle && h.option === defauts[cle]) || v.bonus?.[cle]?.includes(defauts[cle])) pbs.push(`${vid} : ${cle} par défaut hors programme`)
    }
    // textes : chaque clé existe dans chaque langue (sinon la lecture retombe sur le français ou sur la clé elle-même)
    for (const langue of d.langues) {
      const cles = ['titre', cleVariante(vid, 'court'), cleVariante(vid, 'titre'), cleVariante(vid, 'description'),
        ...Object.entries(optionsDe(d, v)).flatMap(([c, valeurs]) => [cleReglage(c), ...valeurs.map(x => cleValeur(c, x))]),
        ...Object.keys(champsDe(d, v)).map(cleReglage), ...Object.keys(d.prereglages).map(clePrereglage),
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
  // visibleSi : un réglage invisible reprend son défaut, un réglage visible est gardé (une valeur autre que le défaut, valide)
  for (const cle of Object.keys(d.formulaire.visibleSi ?? {})) {
    for (const [vid, v] of Object.entries(d.variantes)) {
      const base = reglagesDe(d, { variante: vid })
      const cond = evaluer(d.formulaire.visibleSi[cle], base)
      if (cond !== visible(d, cle, base)) rpbs.push(`${vid} : visible(${cle}) incohérent`)
      if (cle.startsWith('polices.')) {
        const type = cle.slice(8), autre = { polices: { [type]: 'Autre police' } }
        const lu = reglagesDe(d, { ...base, ...autre })
        if (!cond && lu.polices[type] === 'Autre police') rpbs.push(`${vid} : ${cle} invisible mais gardé`)
        if (cond && lu.polices[type] !== 'Autre police') rpbs.push(`${vid} : ${cle} visible mais perdu`)
        if (cond !== typesDePoliceVisibles(d, base).includes(type)) rpbs.push(`${vid} : ${cle} : types de police visibles incohérents`)
        continue
      }
      const champ = champsDe(d, v)[cle], offertes = optionsDe(d, v)[cle]
      const valeurs = champ ? (champ.sorte === 'texte' ? ['zz'] : [champ.max]) : offertes ? [offertes.at(-1)] : null
      const essai = cle === 'graine' ? { graine: 7 } : cle === 'langues' ? { langues: d.langues } : valeurs ? { [cle]: Array.isArray(base[cle]) ? valeurs : valeurs[0] } : {}
      const lu = reglagesDe(d, { ...base, ...essai })
      const garde = cle === 'graine' ? lu.graine === 7 : cle === 'langues' ? lu.langues.length === (d.bilingue ? d.langues.length : 1) : cle in essai ? JSON.stringify(lu[cle]) === JSON.stringify(essai[cle]) || JSON.stringify(base[cle]) === JSON.stringify(essai[cle]) : true
      // le « essai » peut être refusé pour une autre raison (une valeur que `offertes` ne propose pas) : on ne juge que graine, langues, champs
      const jugeable = ['graine', 'langues'].includes(cle) || !!champ
      if (cond && jugeable && !garde) rpbs.push(`${vid} : ${cle} visible mais perdu`)
      if (!cond && cle === 'graine' && lu.graine === 7) rpbs.push(`${vid} : ${cle} invisible mais gardé`)
      if (!cond && cle === 'langues' && lu.langues.length > 1) rpbs.push(`${vid} : ${cle} invisible mais gardé`)
      if (!cond && champ && JSON.stringify(lu[cle]) !== JSON.stringify(base[cle])) rpbs.push(`${vid} : ${cle} invisible mais gardé`)
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
    if (!e.classes.length || !e.competences.length || !e.langues.length) epbs.push(`${e.slug} : classes, compétences ou langues vides`)
    if (!Number.isInteger(e.pages) || e.pages < 1) epbs.push(`${e.slug} : pages`)
    if (e.pages !== genererAffiche(module, e.config).nbPages) epbs.push(`${e.slug} : pages ≠ document`)
    if (!e.lien.includes(`affiche=${d.id}&variante=${e.config.variante}`)) epbs.push(`${e.slug} : lien`)
    if (e.competences.some(id => !competenceDe(id))) epbs.push(`${e.slug} : compétence inconnue`)
    if (reglagesDe(d, e.config).langues.join() !== e.langues.join()) epbs.push(`${e.slug} : config ≠ langues`)
    // aller-retour lien ↔ formulaire : les réglages que lit le formulaire d'après le lien sont ceux de l'entrée
    const query = Object.fromEntries(new URL(e.lien, 'http://x').searchParams)
    if (JSON.stringify(reglagesDe(d, lireLien(query))) !== JSON.stringify(reglagesDe(d, e.config))) epbs.push(`${e.slug} : le lien ouvre d'autres réglages que l'entrée (${e.lien})`)
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

// ── Conditions « visible si » ──
console.log('\nConditions')
{
  const cfg = { a: 'x', liste: ['p', 'q'], n: 3 }
  const cas = [
    ['valeur', { reglage: 'a', valeur: 'x' }, true], ['valeur fausse', { reglage: 'a', valeur: 'y' }, false],
    ['dans', { reglage: 'a', dans: ['y', 'x'] }, true], ['dans (absent)', { reglage: 'a', dans: ['y', 'z'] }, false],
    ['contient', { reglage: 'liste', contient: 'q' }, true], ['contient (absent)', { reglage: 'liste', contient: 'r' }, false],
    ['contient sur une valeur simple', { reglage: 'a', contient: 'x' }, false],
    ['tous (ET)', { tous: [{ reglage: 'a', valeur: 'x' }, { reglage: 'liste', contient: 'p' }] }, true],
    ['tous (ET) faux', { tous: [{ reglage: 'a', valeur: 'x' }, { reglage: 'liste', contient: 'r' }] }, false],
    ['un (OU)', { un: [{ reglage: 'a', valeur: 'y' }, { reglage: 'n', valeur: 3 }] }, true],
    ['un (OU) faux', { un: [{ reglage: 'a', valeur: 'y' }, { reglage: 'n', dans: [1, 2] }] }, false],
    ['imbriquées', { tous: [{ un: [{ reglage: 'a', valeur: 'y' }, { reglage: 'a', valeur: 'x' }] }, { reglage: 'n', dans: [3] }] }, true],
  ]
  controler(cas.filter(([, c, attendu]) => evaluer(c, cfg) !== attendu).map(([nom]) => nom), `évaluation des conditions (valeur, dans, contient, ET, OU, imbriquées) : ${cas.length} cas`)
  controler(JSON.stringify(reglagesDeCondition({ tous: [{ reglage: 'a', valeur: 1 }, { un: [{ reglage: 'b', dans: [1] }, { reglage: 'c', contient: 2 }] }] })) === '["a","b","c"]' ? [] : ['réglages d’une condition'], 'les réglages dont dépend une condition imbriquée')
}

// ── Champs libres, valeurs dynamiques, préréglages, formats fixes (exemple riche) ──
console.log('\nExemple riche')
{
  const d = riche.default
  const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b)
  const pbs = []
  // champs : texte limité, nombre dans ses bornes, au pas, chaîne numérique acceptée, rien d'autre
  const nb = { sorte: 'nombre', min: 0, max: 10, pas: 2 }, tx = { sorte: 'texte', max: 5 }
  for (const [lu, attendu] of [[4, 4], [5, 6], [-3, 0], [99, 10], ['8', 8], ['', 3], [NaN, 3], [Infinity, 3], [null, 3], [[1], 3], [{}, 3]]) {
    if (valeurDeChamp(nb, 3, lu) !== attendu) pbs.push(`nombre ${JSON.stringify(lu)} → ${valeurDeChamp(nb, 3, lu)} au lieu de ${attendu}`)
  }
  if (valeurDeChamp({ sorte: 'nombre', min: 0, max: 1, pas: 0.25 }, 0, 0.3) !== 0.25) pbs.push('pas décimal')
  if (valeurDeChamp(tx, 'x', 'abcdefgh') !== 'abcde' || valeurDeChamp(tx, 'x', 12) !== 'x') pbs.push('texte : longueur, type')
  controler(pbs, 'valeur d’un champ : bornes, pas, type, longueur')
  const lu = (o = {}) => reglagesDe(d, o)
  const p2 = []
  if (lu({ serie: 'nombres', de: 500 }).de !== 99 || lu({ serie: 'mot', mot: 'x'.repeat(60) }).mot.length !== 20) p2.push('champs bornés par reglagesDe')
  if (lu({ serie: 'mot', mot: 'Léa' }).mot !== 'Léa') p2.push('un texte visible est gardé')
  if (lu({ serie: 'alphabet', mot: 'Léa' }).mot !== 'bonjour') p2.push('un champ invisible reprend son défaut')
  if (lu({ serie: 'nombres', de: 3, a: 8 }).a !== 8 || lu({ serie: 'mot', de: 3 }).de !== 0) p2.push('nombres visibles gardés, invisibles remis au défaut')
  controler(p2, 'champs texte et nombre dans la config, avec leur visibilité')

  // format et orientation fixes : rien n'est proposé, et une autre valeur lue est refusée
  const f = lu({ format: 'A3', orientation: 'landscape' })
  controler([...(f.format !== 'A4' ? ['format'] : []), ...(f.orientation !== 'portrait' ? ['orientation'] : []),
    ...Object.keys(jeuxDeReglages(d, 'ecrire')).filter(k => k.startsWith('format=') || k.startsWith('orientation='))], 'format et orientation fixes : valeurs imposées, aucun jeu d’essai pour un format ou une orientation')
  controler(eq(riche.default.orientations, ['portrait']) && eq(riche.default.formats, ['A4']) ? [] : ['déclaration'], 'orientations et formats déclarés fixes')

  // valeurs dynamiques : les lettres suivent la langue
  const p3 = []
  if (!valeursProposees(d, 'lettres', lu({ langue: 'br' })).includes("c'h") || valeursProposees(d, 'lettres', lu({ langue: 'fr' })).includes("c'h")) p3.push('lettres proposées selon la langue')
  if (valeursProposees(d, 'lettres', lu({ langue: 'br' })).includes('q')) p3.push('q n’existe pas en breton')
  if (!eq(lu({ langue: 'br', lettres: ['q', 'a', "c'h"] }).lettres, ['a', "c'h"])) p3.push('lettres non proposées retirées')
  if (!eq(lu({ langue: 'fr', lettres: ['ch', 'b'] }).lettres, ['b'])) p3.push('ch n’est pas une lettre du français')
  if (!eq(lu({ langue: 'br', lettres: ['q'] }).lettres, ['a', 'b'])) p3.push('plus aucune lettre proposée : le défaut, restreint à la langue')
  if (!eq(lu({ langue: 'br' }).lettres, ['a', 'b'])) p3.push('défaut a b c restreint au breton (pas de c seul)')
  controler(p3, 'valeurs proposées qui dépendent de la langue (offertes)')

  // préréglages : pré-remplissent, restent modifiables, et ne sont pas des variantes
  const p4 = []
  const pre = appliquerPrereglage(d, lu(), 'mon-prenom')
  if (pre.serie !== 'mot' || pre.mot !== 'Léa' || !eq(pre.styles, ['script', 'attache'])) p4.push('un préréglage pré-remplit le formulaire')
  if (!prereglageActif(d, pre, 'mon-prenom') || prereglageActif(d, pre, 'compter-jusqua-dix')) p4.push('préréglage actif')
  const modif = reglagesDe(d, { ...pre, mot: 'Zoé' })
  if (modif.mot !== 'Zoé' || prereglageActif(d, modif, 'mon-prenom')) p4.push('un préréglage reste modifiable')
  if (appliquerPrereglage(d, lu({ serie: 'alphabet', titre: 'Mon titre' }), 'compter-jusqua-dix').titre !== 'Mon titre') p4.push('un préréglage garde le titre et la feuille')
  if (Object.keys(d.prereglages).some(id => d.variantes[id])) p4.push('un préréglage n’est pas une variante')
  controler(p4, 'préréglages : pré-remplissent, restent modifiables, distincts des variantes')

  // polices par type visibles selon l'écriture choisie
  const p5 = []
  if (!eq(typesDePoliceVisibles(d, lu({ styles: ['script'] })), ['script'])) p5.push('seul le script')
  if (!eq(typesDePoliceVisibles(d, lu()), ['script', 'attache'])) p5.push('les deux')
  if (lu({ styles: ['script'], polices: { attache: 'Autre' } }).polices.attache !== 'Playwrite FR Trad') p5.push('police d’un type invisible remise au défaut')
  controler(p5, 'types de police visibles selon un autre réglage (polices.<type>)')

  // pointillés : visibles selon ET + OU
  const vis = o => groupesDuFormulaire(d, lu(o)).some(g => g.elements.some(e => e.cle === 'pointilles'))
  controler([[{ serie: 'mot', styles: ['script'] }, true], [{ serie: 'alphabet', styles: ['script', 'attache'] }, true], [{ serie: 'nombres', styles: ['script'] }, false], [{ serie: 'mot', styles: ['attache'] }, false]]
    .filter(([o, attendu]) => vis(o) !== attendu).map(([o]) => JSON.stringify(o)), 'condition ET + OU du formulaire')

  // le cadre avec une mesure injectée : le texte est ajusté à la largeur (un texte long est plus petit), avec la mesure estimée de node
  const p6 = []
  const taille = (o, mesure) => +genererAffiche(module_riche, o, undefined, mesure).html.match(/<text [^>]*font-size="([\d.]+)"/)[1]
  const court = taille({ serie: 'mot', mot: 'Léa', styles: ['script'] }), long = taille({ serie: 'mot', mot: 'extraordinairement', styles: ['script'] })
  if (!(long < court)) p6.push(`un mot long (${long}) doit être plus petit qu’un mot court (${court})`)
  const largeLarge = taille({ serie: 'mot', mot: 'Léa', styles: ['script'] }, { largeur: () => 100, metriques: mesureEstimee.metriques })
  if (!(largeLarge < court)) p6.push('la mesure injectée est ignorée')
  // la même police : estimée = largeur × taille ≤ 90 % de la zone, quelle que soit la police
  for (const police of ['Andika', 'Luciole', 'OpenDyslexic', 'Playwrite FR Trad']) {
    const lettres = riche.alphabetDe('fr')
    const t = taille({ serie: 'alphabet', styles: ['script'], lettres, polices: { script: police } })
    if (mesureEstimee.largeur(lettres.join(' '), police) * t > mesuresAffiche({ format: 'A4', orientation: 'portrait' }).W * 0.9 + 0.01) p6.push(`${police} : le texte dépasse 90 % de la largeur`)
  }
  controler(p6, 'mesure de texte injectée : le dessin ajuste la taille, sans canvas')
}

// La mesure estimée : cohérente, sans canvas, avec les proportions des polices livrées
console.log('\nMesure de texte')
{
  const p = []
  const m = mesureEstimee
  if (!(m.largeur('iiii', 'Andika') < m.largeur('MMMM', 'Andika'))) p.push('i plus étroit que M')
  if (!(m.largeur('abc', 'Andika', true) > m.largeur('abc', 'Andika'))) p.push('le gras est plus large')
  if (m.largeur('', 'Andika') !== 0) p.push('texte vide')
  if (m.largeur('abc', 'Police Inconnue') !== m.largeur('abc', 'Andika')) p.push('police inconnue estimée comme Andika')
  if (!(m.largeur('ñ « c’h » 😀', 'Andika') > 0)) p.push('caractères hors de la table')
  if (!(m.metriques('Playwrite FR Trad').hampe > m.metriques('Andika').hampe)) p.push('proportions de l’attaché')
  // écart avec le canvas, mesuré dans Chrome quand la table a été faite (scripts/generer/metriques-polices.mjs) : Andika, 17,95 em pour
  // 'Les nombres en lettres : quarante-sept' ; le canvas n'existe pas sous node, on vérifie à 1 % près en Andika
  const attendue = 17.95
  const w = m.largeur('Les nombres en lettres : quarante-sept', 'Andika')
  if (Math.abs(w - attendue) / attendue > 0.01) p.push(`écart avec le canvas : ${w.toFixed(2)} em au lieu de ${attendue}`)
  controler(p, 'mesure estimée : largeurs, gras, police inconnue, caractères hors table, proportions')
}

// ── Déclaration : erreurs claires ──
console.log('\nDéclaration')
{
  const base = { id: 'essai', domaine: D.exemple, competences: [K.exempleLire, K.exempleCompter], variantes: { v: { classes: ['cp'] } } }
  const echoue = (nom, spec, attendu) => {
    try { definirAffiche({ ...base, ...spec }); verifier(false, `${nom} : aurait dû échouer`) } catch (e) { verifier(e.message.includes(attendu), `${nom} : « ${e.message} » doit contenir « ${attendu} »`) }
  }
  echoue('classe inconnue', { variantes: { v: { classes: ['cm3'] } } }, 'classe « cm3 » inconnu')
  echoue('aucune classe', { variantes: { v: { classes: [] } } }, 'aucune classe')
  echoue('every : compétence du CP seul pour GS + CP', { competences: [K.exempleCompter], variantes: { v: { classes: ['gs', 'cp'] } } }, 'aucune compétence de l\'affiche')
  echoue('sauf étranger', { variantes: { v: { classes: ['cp'], sauf: [K.exempleRegle] } } }, 'sauf')
  echoue('réservé', { reglages: { titre: true } }, '« titre » est réservé')
  echoue('visibleSi : réglage inconnu', { formulaire: { visibleSi: { nimporte: { reglage: 'serie', valeur: 1 } } } }, 'réglage inconnu')
  echoue('visibleSi : dépend d’un réglage inconnu', { reglages: { a: true }, formulaire: { visibleSi: { a: { tous: [{ reglage: 'fantome', valeur: 1 }] } } } }, 'selon « fantome »')
  echoue('visibleSi polices.x en mode unique', { formulaire: { visibleSi: { 'polices.attache': { reglage: 'langue', valeur: 'fr' } } } }, 'réglage inconnu')
  echoue('offertes : pas un choix', { reglages: { n: nombre({ defaut: 1, min: 0, max: 5 }) }, offertes: { n: () => [1] } }, 'n\'est pas un réglage à choix')
  echoue('préréglage : réglage inconnu', { reglages: { a: choix([1, 2]) }, prereglages: { p: { b: 1 } } }, 'n\'est pas un réglage à choix ni un champ')
  echoue('préréglage : valeur invalide', { reglages: { a: choix([1, 2]) }, prereglages: { p: { a: 3 } } }, 'valeur valide')
  echoue('préréglage : hors bornes', { reglages: { n: nombre({ defaut: 1, min: 0, max: 5 }) }, prereglages: { p: { n: 9 } } }, 'valeur valide')
  echoue('préréglage vide', { reglages: { a: choix([1, 2]) }, prereglages: { p: {} } }, 'aucune valeur')
  echoue('champ : bornes inversées', { reglages: { n: nombre({ defaut: 1, min: 5, max: 0 }) } }, 'dépasse max')
  echoue('champ : défaut hors bornes', { reglages: { n: nombre({ defaut: 9, min: 0, max: 5 }) } }, 'hors de')
  echoue('champ : défaut hors pas', { reglages: { n: nombre({ defaut: 1, min: 0, max: 10, pas: 2 }) } }, 'pas')
  echoue('champ : texte trop long', { reglages: { t: texte({ defaut: 'trop long', max: 3 }) } }, 'dépasse max')
  echoue('aucune orientation', { orientations: [] }, 'une orientation')
  echoue('id invalide', { id: 'Mon Affiche' }, 'invalide')
  echoue('héritage absent', { variantes: { v: { classes: ['cp'], herite: 'absente' } } }, 'hérité mais pas déclaré')
  echoue('héritage circulaire', { variantes: { a: { classes: ['cp'], herite: 'b' }, b: { classes: ['cp'], herite: 'a' } } }, 'héritage circulaire')
  echoue('domaine étranger', { competences: [K.exempleLire, K.heureEntiere] }, 'pas de « exemple »')
  // les compétences hors programme d'une variante : { competence, raison }
  const hors = definirAffiche({ ...base, competences: [K.exempleLire], variantes: { v: { classes: ['ms'], horsProgramme: [{ competence: K.exempleCompter, raison: 'proposée aux élèves en avance' }] } } })
  verifier(JSON.stringify(hors.variantes.v.horsProgramme) === '[{"competence":"exemple-compter","raison":"proposée aux élèves en avance"}]', 'compétence hors programme : { competence, raison }, jamais un `option`')
  // l'héritage d'une variante : les réglages de l'autre, sauf ceux qu'on redit
  const h = definirAffiche({ ...base, variantes: { a: { classes: ['cp'], reglages: { max: 6, debut: 1 } }, b: { classes: ['cp'], herite: 'a', reglages: { max: 10 } } } })
  verifier(h.variantes.b.reglages.max === 10 && h.variantes.b.reglages.debut === 1, 'variante héritée : réglages de l’autre, sauf ceux qu’on redit')
  // champ libre refusé dans un exercice
  try { (await import('../src/noyau/definir.ts')).definir({ id: 'essai', route: '/dev/essai', domaine: D.exemple, competences: [K.exempleCompter], reglages: { n: nombre({ defaut: 1, min: 0, max: 5 }) }, niveaux: { cp: {} } }); verifier(false, 'un champ libre dans un exercice aurait dû échouer') }
  catch (e) { verifier(e.message.includes('n\'existe que pour une affiche'), 'un champ libre est refusé dans un exercice') }
  // mêmes règles de politique que les exercices : une liste (cases) est gardée dans la variante et reprend les défauts au changement
  const c = definirAffiche({ ...base, competences: [K.exempleCompter], reglages: { l: cases(['a', 'b', 'c'], { defaut: ['a'] }) }, variantes: { x: { classes: ['cp'] }, y: { classes: ['ce1'] } } })
  verifier(JSON.stringify(reglagesDe(c, { variante: 'x', l: ['b', 'z'] }).l) === '["b"]', 'un choix multiple (cases) est gardé, valeurs non proposées retirées')
  verifier(JSON.stringify(reglagesDe(c, { variante: 'x', l: ['z'] }).l) === '["a"]', 'un choix multiple sans valeur valide reprend le défaut')
  verifier(JSON.stringify(reglagesApresVariante(c, reglagesDe(c, { variante: 'x', l: ['b'] }), 'y').l) === '["a"]', 'au changement de variante, un choix multiple reprend les défauts')
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
