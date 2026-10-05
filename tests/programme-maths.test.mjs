// Fiches de maths contre le programme (src/data/programme.js, CONTRAINTES) : pour chaque exercice et chaque niveau,
// plusieurs graines, on lit le texte de la fiche et on vérifie qu'il reste dans le champ du niveau (nombres, heure,
// fractions, unités, figures). Réglages par défaut du niveau, plus les options « au programme » (jamais les bonus).
import { lancerNavigateur, contexte, surveiller, verifier, nbEchecs, app } from './outils.mjs'
import { contraintesDe } from '../src/data/programme.js'

const GRAINES = [1, 2, 3, 4, 5]

// Texte de la fiche : nœuds texte séparés par « ¦ » ; les chiffres d'un calcul posé (une case par chiffre) sont
// recollés ligne par ligne ; `svg: false` ignore les dessins (graduations des horloges, des droites)
function texteFiche(html, { svg = false } = {}) {
  const d = new DOMParser().parseFromString(html, 'text/html')
  d.querySelectorAll('style, script').forEach(e => e.remove())
  if (!svg) d.querySelectorAll('svg').forEach(e => e.remove())
  d.querySelectorAll('tr').forEach(tr => {
    const cases = [...tr.children].map(td => td.textContent.replace(/\u00a0/g, '').trim())
    if (cases.length > 1 && cases.every(c => /^[\d+−×]?$/.test(c))) tr.textContent = cases.join('')
  })
  const w = d.createTreeWalker(d.body, NodeFilter.SHOW_TEXT)
  const t = []
  while (w.nextNode()) { const s = w.currentNode.nodeValue.trim(); if (s) t.push(s) }
  return t.join(' ¦ ')
}

// Nombres d'un texte (« 10 000 » compte pour un seul nombre), sans les numéros de question (« 12. »)
const nombres = txt => (txt.replace(/(^|[\s¦])\d+\.(?!\d)/g, '$1').match(/\d+(?:[  ]\d{3})*/g) ?? [])
  .map(s => Number(s.replace(/\D/g, '')))
const corrige = txt => txt.split(/¦ Corrigé/)[1] ?? ''

// ── Vérifications ──
const champ = (cle = 'nombreMax', partie = t => t) => (txt, k) => {
  const max = Math.max(0, ...nombres(partie(txt)))
  return max <= k[cle] || `${max} > ${k[cle]} (${cle})`
}
const sans = (re, quoi) => txt => { const m = txt.match(re); return !m || `${quoi} : « ${m[0]} »` }
const avec = (re, quoi) => txt => re.test(txt) || `${quoi} absent`
// heure : précision des heures écrites (« 3 h 45 ») et des durées (« 45 min »)
const PRECISION = { entiere: 60, quart: 15, minute: 1, seconde: 1 }
const heure = (txt, k) => {
  const pas = PRECISION[k.heure]
  const minutes = [...txt.matchAll(/\b\d{1,2} h (\d{2})\b/g)].map(m => +m[1])
    .concat([...txt.matchAll(/(?<!h )\b(\d+) min\b/g)].map(m => +m[1]))
  const faux = minutes.find(m => m % pas)
  if (faux !== undefined) return `${faux} min (précision « ${k.heure} »)`
  if (k.heure !== 'seconde' && /\d+ s\b|seconde/.test(txt)) return 'secondes'
  return true
}
// fractions du corrigé (« 3/4 ») : dénominateurs et fractions ≤ 1 ; pas de fraction d'une quantité
const fractions = (txt, k) => {
  const f = k.fractions
  for (const [, a, b] of corrige(txt).matchAll(/\b(\d+)\/(\d+)\b/g)) {
    const ok = f.denominateurs ? f.denominateurs.includes(+b) : +b <= f.denominateurMax
    if (!ok) return `dénominateur ${b} (${a}/${b})`
    if (!f.superieuresA1 && +a > +b) return `fraction > 1 : ${a}/${b}`
  }
  const op = !f.operateur && txt.match(/\b(le tiers|le quart|le cinquième|le dixième|les? \w+ tiers) de \d/i)
  return !op || `fraction d'une quantité : « ${op[0]} »`
}
// unités de contenance au programme
const contenances = (txt, k) => {
  const u = [...txt.matchAll(/\b\d+\s?(mL|cL|dL|L|daL|hL)\b/g)].map(m => m[1]).find(x => !k.unitesContenance.includes(x))
  if (u) return `unité de contenance ${u}`
  return k.unitesContenance.length > 0 || !/litre|contenance/i.test(txt) || 'contenances'
}
// figures nommées : seulement celles du niveau
const NOMS_FIGURES = { losange: /losange/i, trapeze: /trapèze/i, pentagone: /pentagone/i, hexagone: /hexagone/i,
  'triangle-isocele': /isocèle/i, 'triangle-equilateral': /équilatéral/i, cercle: /cercle/i, disque: /disque/i }
const figures = (txt, k) => {
  const hors = Object.keys(NOMS_FIGURES).filter(f => !k.figures.includes(f) && NOMS_FIGURES[f].test(txt))
  if (hors.length) return `figures hors programme : ${hors.join(', ')}`
  return !!k.symetrie || !/symétri/i.test(txt) || 'symétrie'
}

// PS, comparer : chaque paire du corrigé (« 5 · 2 ») a un rapport d'au moins 2, sans dépasser le maximum
const rapport = (txt, k) => {
  const n = nombres(corrige(txt)), fautes = []
  for (let i = 0; i + 1 < n.length; i += 2) {
    const [a, b] = [n[i], n[i + 1]].sort((x, y) => x - y)
    if (b < k.comparaisonGlobale.rapportMin * a || b > k.comparaisonGlobale.max) fautes.push(`${n[i]} · ${n[i + 1]}`)
  }
  return !fautes.length || `rapport < ${k.comparaisonGlobale.rapportMin} ou > ${k.comparaisonGlobale.max} : ${fautes.join(', ')}`
}

// ── Cas : [route, bouton de niveau (texte), niveau du programme, vérifications, options à activer] ──
// options : expressions sur le texte des boutons ; `tout:<titre>` active tous les boutons d'une section
const CAS = [
  ['/maternelle/compter', '\\bPS\\b', 'ps', [champ('nombreMax', corrige)]],
  ['/maternelle/comparer', '\\bPS\\b', 'ps', [rapport]],
  ['/maternelle/compter', 'MS', 'ms', [champ('nombreMax', corrige)]],
  ['/maternelle/compter', 'GS', 'gs', [champ('nombreMax', corrige)]],
  ['/maternelle/comparer', 'MS', 'ms', [champ('nombreMax', corrige)]],
  ['/maternelle/comparer', 'GS', 'gs', [champ('nombreMax', corrige)]],
  ['/maternelle/ordonner', 'MS', 'ms', [champ('nombreMax', corrige)]],
  ['/maternelle/ordonner', 'GS', 'gs', [champ('nombreMax', corrige)]],
  ['/maternelle/formes', '\\bPS\\b', 'ps', [sans(/rectangle|losange|pentagone|hexagone|ovale|cercle/i, 'forme hors programme (PS)')]],
  ['/maternelle/formes', '\\bMS\\b', 'ms', [sans(/rectangle|losange|pentagone|hexagone|ovale|cercle/i, 'forme hors programme (MS)')]],
  ['/maternelle/formes', '\\bGS\\b', 'gs', [figures, avec(/disque/, 'disque')]],
  ['/maths/calcul-mental', '^CP$', 'cp', [champ('calculMentalMax')], ['tout:Opérations']],
  ['/maths/calcul-mental', '^CE1$', 'ce1', [champ('calculMentalMax'), sans(/× 100\b/, '× 100')], ['tout:Opérations']],
  ['/maths/calcul-mental', '^CE2$', 'ce2', [champ('calculMentalMax')], ['tout:Opérations']],
  ['/maths/calcul-pose', '^1', 'cp', [champ()]],
  ['/maths/calcul-pose', '^2', 'cp', [champ(), sans(/Soustraction/, 'soustraction')]],
  ['/maths/calcul-pose', '^3', 'ce1', [champ()], ['^− Soustraction']],
  ['/maths/calcul-pose', '^4', 'ce2', [champ()], ['^− Soustraction']],
  ['/maths/tables', null, 'ce1', [sans(/× 1[1-9]\b|\b1[1-9] ×/, 'tables au-delà de 10')]],
  ['/maths/numeration', '^CE1$', 'ce1', [champ()]],
  ['/maths/numeration', '^CE2$', 'ce2', [champ()]],
  ...['20', '100', '1 ?000'].map(n => ['/maths/problemes', '^CE1$', 'ce1', [champ()], [`^Jusqu'à ${n}$`]]),
  ...['100', '1 ?000'].map(n => ['/maths/problemes', '^CE2$', 'ce2', [champ()], [`^Jusqu'à ${n}$`]]),
  ['/maths/fractions', '^CE1$', 'ce1', [fractions], ['^Aussi 2/3']],
  ['/maths/fractions', '^CE2$', 'ce2', [fractions]],
  ['/maths/heure', '^CE1$', 'ce1', [heure], ['tout:Exercices', 'tout:Précision']],
  ['/maths/heure', '^CE2$', 'ce2', [heure], ['tout:Exercices', 'tout:Précision']],
  ['/maths/monnaie', '^CE1$', 'ce1', [champ()], ['tout:Exercices']],
  ['/maths/monnaie', '^CE2$', 'ce2', [champ()], ['tout:Exercices']],
  ['/maths/mesures', '^CE1$', 'ce1', [contenances, champ()], ['tout:Exercices']],
  ['/maths/mesures', '^CE2$', 'ce2', [contenances, champ()], ['tout:Exercices']],
  ['/maths/geometrie', '^CE1$', 'ce1', [figures], ['tout:Exercices']],
  ['/maths/geometrie', '^CE2$', 'ce2', [figures], ['tout:Exercices']],
]

// Active tous les boutons d'une section (sauf ceux marqués bonus ou désactivés)
async function toutActiver(page, titre) {
  const section = page.locator('.cadre-exercice .config-section', { has: page.locator('.config-section-title', { hasText: titre }) }).first()
  const boutons = section.locator('button')
  for (let i = 0; i < await boutons.count(); i++) {
    const b = boutons.nth(i)
    const texte = await b.innerText()
    if (/bonus|plus loin|hors programme/i.test(texte) || await b.isDisabled()) continue
    if (!(await b.getAttribute('class') ?? '').includes('active')) await b.click()
  }
}

const nav = await lancerNavigateur()
const ctx = await contexte(nav, { langue: 'fr' })
// hasard reproductible (?graine=N) et réglages par défaut à chaque page
await ctx.addInitScript(() => {
  for (const k of Object.keys(localStorage)) if (!/^ep_(langue_interface|avis_traduction_vu)$/.test(k)) localStorage.removeItem(k)
  const g = new URLSearchParams(location.search).get('graine')
  if (g) {
    let s = Number(g) | 0
    Math.random = () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
  }
})
const page = await ctx.newPage()
const erreurs = surveiller(page)
const base = app('').replace(/#$/, '')

console.log('Fiches de maths et programme officiel')
for (const [route, bouton, niveau, verifs, options = []] of CAS) {
  const k = contraintesDe(niveau)
  const problemes = []
  erreurs.length = 0
  for (const g of GRAINES) {
    await page.goto(`${base}?graine=${g}#${route}?mode=imprimer`)
    await page.locator('.cadre-exercice').waitFor({ timeout: 15000 })
    if (bouton) await page.locator('.cadre-exercice button', { hasText: new RegExp(bouton) }).first().click({ timeout: 5000 })
    for (const o of options) {
      if (o.startsWith('tout:')) await toutActiver(page, o.slice(5))
      else {
        const b = page.locator('.cadre-exercice button', { hasText: new RegExp(o) }).first()
        if (!(await b.count())) { problemes.push(`bouton /${o}/ introuvable`); continue }
        if (!(await b.getAttribute('class') ?? '').includes('active')) await b.click()
      }
    }
    await page.waitForTimeout(250)
    const html = await page.locator('.cadre-exercice iframe').first().getAttribute('srcdoc')
    const txt = await page.evaluate(texteFiche, html)
    for (const v of verifs) {
      const r = v(txt, k)
      if (r !== true) problemes.push(`graine ${g} : ${r}`)
    }
  }
  const detail = [...new Set(problemes)].slice(0, 2).join(' ; ')
  verifier(!problemes.length && !erreurs.length,
    `${route} ${bouton ? bouton.replace(/[\^$]/g, '') : ''}${options.length ? ` [${options.join(', ')}]` : ''} → ${niveau.toUpperCase()}${detail ? ' — ' + detail : ''}${erreurs.length ? ' — ' + erreurs[0] : ''}`)
}
await nav.close()

// code de sortie lu par tests/lancer.mjs
process.exit(nbEchecs() ? 1 : 0)
