// Génère les fiches « toutes prêtes » en PDF + des pages statiques indexables.
// Lancé après `vite build` : il sert le build avec `vite preview` et pilote Chrome sans interface pour
// produire les documents avec le code de l'app, puis écrit dans <outDir>/telechargements/ :
//   - <fiche>/                 une page par fiche (PDF, aperçu) — catalogue.js + fiches de calcul
//   - exercices-<id>-<classe>/ une page par exercice et par classe, NB_VARIANTES fiches différentes
//                              (page d'exercice de l'app en mode impression, voir src/impression/exercices.js),
//                              en français et (suffixe -brezhoneg) avec les consignes en breton
//   - index.html               toutes les fiches, recherche et filtres (classe, langue, apprendre / s'entraîner)
// plus sitemap.xml, robots.txt et 404.html à la racine.
//
// Les deux sites publient les mêmes fiches. C'est le réglage « Langue régionale » du visiteur (le même que
// dans l'app ; par défaut celui du site) qui décide d'afficher les fiches et les mentions en breton.
//
// Polices : par défaut celles incluses. Pour une police non redistribuable (Belle Allure, Écolier…) dans les
// PDF, déposer le fichier dans polices-locales/attache/ (ou script/) — dossier ignoré par git.
//
// Options : --mode <mode Vite> (défaut : production → .env ; ecoleprimaire / skoolik → .env.<mode>)
//           --outDir <dossier> (défaut : dist)   --sans-exercices (plus rapide, pour tester)
// Variables : CHROME_PATH (chemin de Chrome). Le site (VITE_SITE), la base (VITE_BASE) et l'URL publique
// (VITE_SITE_URL) viennent des fichiers .env*.
import { preview, loadEnv } from 'vite'
import { chromium } from 'playwright-core'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CATEGORIES } from '../src/impression/catalogue.js'
import { EXERCICES, NB_VARIANTES, classesDe, etiquetteClasse } from '../src/impression/exercices.js'
import { site, SITES, CONTACT } from '../src/site.js'
import { DRAPEAUX } from '../src/data/drapeaux.js'
import textesFr from '../src/i18n/fr/pages-statiques.js'
import textesBr from '../src/i18n/br/pages-statiques.js'

const arg = (nom, defaut) => {
  const i = process.argv.indexOf(nom)
  return i > 0 ? process.argv[i + 1] : defaut
}
const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const MODE = arg('--mode', 'production')
const OUT_DIR = arg('--outDir', 'dist')
const AVEC_EXERCICES = !process.argv.includes('--sans-exercices')
const dist = join(racine, OUT_DIR)
const env = loadEnv(MODE, racine)
const BASE = env.VITE_BASE || '/ecole-primaire/'
const SITE_URL = (env.VITE_SITE_URL || 'https://iksaif.github.io/ecole-primaire/').replace(/\/?$/, '/')
const SITE = site(env.VITE_SITE)
const CLASSES = ['ms', 'gs', 'cp', 'ce1', 'ce2', 'cm1', 'cm2']
// Adresse de référence d'une fiche : les fiches qui contiennent du breton vivent sur skoolik.app, les autres
// sur ecoleprimaire.app (les deux sites publient tout, sans contenu dupliqué pour les moteurs de recherche)
const urlReference = t => (t.langues.includes('br') ? SITES.skoolik.url : SITES.ecoleprimaire.url)

// ── Textes des pages (français / breton) ─────────────────────────────────────
// Les pages contiennent les deux langues ; le sélecteur FR/BR (même clé localStorage que l'app)
// choisit celle qui s'affiche. Breton : à relire par un brittophone.
const T = { fr: textesFr, br: textesBr }
const val = (l, cle, a) => {
  const v = T[l][cle] ?? T.fr[cle]
  return typeof v === 'function' ? v(...a) : v
}
const echapper = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
// Texte dans la langue principale du site (titres de page, attributs)
const tx = (cle, ...a) => val(SITE.langue, cle, a)
// Les deux versions d'un texte ; le sélecteur de langue n'en montre qu'une
const duo = (fr, br) => (br == null || fr === br ? echapper(fr)
  : `<span class="l-fr" lang="fr">${echapper(fr)}</span><span class="l-br" lang="br">${echapper(br)}</span>`)
const bi = (cle, ...a) => duo(val('fr', cle, a), val('br', cle, a))

// ── Classement des fiches ────────────────────────────────────────────────────
// usage : 'apprendre' (affiches, mémos) ou 'exercice' (fiches à remplir) ; groupe : rubrique dans l'index
function classer(t) {
  const affiche = /^(affiches?|table-de-pythagore|tableau-des|cartes)-/.test(t.slug)
  if (t.categorie === 'alphabet') return { usage: 'apprendre', groupe: 'alphabet' }
  if (t.categorie === 'nombres') return { usage: 'apprendre', groupe: 'nombres' }
  if (t.categorie === 'calcul') return affiche ? { usage: 'apprendre', groupe: 'tables' } : { usage: 'exercice', groupe: 'calcul' }
  if (t.categorie === 'ecriture') return { usage: 'exercice', groupe: 'ecriture' }
  return { usage: 'exercice', groupe: t.groupe ?? 'autres' }
}
const GROUPES = {
  apprendre: ['alphabet', 'nombres', 'tables'],
  exercice: ['ecriture', 'calcul', 'maths', 'francais', 'maternelle', 'autres'],
}
const classesDepuisTexte = s => (s || '').toLowerCase().split(/[·→,\s]+/).filter(c => CLASSES.includes(c))
const brSeule = t => t.langues.length === 1 && t.langues[0] === 'br'
// fiche qui contient du breton (bretonne ou bilingue) : affichée seulement si la langue régionale est active
const avecBreton = t => t.langues.includes('br')

function trouverChrome() {
  const candidats = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  ].filter(Boolean)
  const c = candidats.find(p => existsSync(p))
  if (!c) throw new Error('Chrome introuvable : définir CHROME_PATH')
  return c
}

function policesLocales() {
  const res = {}
  for (const type of ['attache', 'script']) {
    const dossier = join(racine, 'polices-locales', type)
    if (!existsSync(dossier)) continue
    const f = readdirSync(dossier).find(n => /\.(ttf|otf|woff2?)$/i.test(n))
    if (f) {
      const mime = { '.ttf': 'font/ttf', '.otf': 'font/otf', '.woff': 'font/woff', '.woff2': 'font/woff2' }[extname(f).toLowerCase()]
      res[type] = { nom: f, dataUrl: `data:${mime};base64,${readFileSync(join(dossier, f)).toString('base64')}` }
    }
  }
  return res
}

// texte de recherche : minuscules, sans accents
const normaliser = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
// graine stable à partir d'un texte (les PDF sont identiques d'un build à l'autre)
const graineDe = s => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 7) % 1e6

const CSS = `
:root { --bleu:#4a90e2; --vert:#5cb85c; --orange:#f39c12; --texte:#2c3e50; --gris:#f8f9fa; --brd:#dee2e6; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Segoe UI', system-ui, sans-serif; color: var(--texte); background: var(--gris); line-height: 1.5; }
a { color: var(--bleu); }
html[data-ui="fr"] .l-br, html[data-ui="br"] .l-fr { display: none; }
html:not([data-regionale="br"]) .si-br, html[data-regionale="br"] .si-pas-br { display: none !important; }
header.nav { background: white; box-shadow: 0 4px 12px rgba(0,0,0,.1); padding: .6rem 1.25rem; display: flex; align-items: center; gap: .75rem 1rem; }
header .logo { font-size: 1.4rem; font-weight: 800; text-decoration: none; color: var(--bleu); white-space: nowrap; }
header .liens { display: flex; gap: .35rem; min-width: 0; }
header .liens a { text-decoration: none; padding: .35rem .7rem; border-radius: 20px; font-weight: 600; font-size: .9rem; color: var(--texte); white-space: nowrap; }
header .liens a:hover { background: var(--gris); }
header .liens a.imprimer { border: 2px solid var(--orange); color: #b35c00; padding: .25rem .65rem; }
header .liens a.imprimer.actif { background: var(--orange); color: white; }
header .liens a.reglages { opacity: .55; }
header .droite { margin-left: auto; display: flex; gap: .5rem; align-items: center; flex-shrink: 0; }
.loupe { text-decoration: none; background: var(--gris); border-radius: 20px; padding: .3rem .6rem; font-size: .95rem; display: inline-flex; align-items: center; gap: .35rem; }
.loupe kbd { font: inherit; font-size: .7rem; color: #888; border: 1px solid var(--brd); border-radius: 5px; padding: 0 .3rem; background: white; }
.classe { display: flex; align-items: center; gap: .35rem; background: var(--gris); border-radius: 20px; padding: .2rem .35rem .2rem .7rem; font-size: .85rem; white-space: nowrap; }
.classe .lib { font-size: .72rem; font-weight: 800; color: #888; text-transform: uppercase; }
.classe select { border: none; background: white; border-radius: 14px; padding: .25rem .5rem; font: inherit; font-weight: 700; color: var(--texte); }
.langue-ui { display: flex; gap: 2px; background: var(--gris); border-radius: 20px; padding: 3px; }
.langue-ui button { border: none; background: none; border-radius: 16px; padding: .3rem .45rem; cursor: pointer; display: inline-flex; line-height: 1; }
html[data-ui="fr"] .langue-ui [data-ui="fr"], html[data-ui="br"] .langue-ui [data-ui="br"] { background: white; box-shadow: 0 0 0 2px var(--bleu); }
.drapeau { width: 1.5em; height: 1em; border-radius: 2px; box-shadow: 0 0 0 1px rgba(0,0,0,.15); display: block; }
@media (max-width: 900px) {
  header.nav { flex-wrap: wrap; padding: .5rem .75rem; }
  header .logo { font-size: 1.15rem; }
  header .liens { order: 3; flex-basis: 100%; overflow-x: auto; scrollbar-width: none; }
  .loupe kbd, .classe .lib { display: none; }
}
main { max-width: 1040px; margin: 0 auto; padding: 2rem 1.25rem 3rem; }
h1 { font-size: 1.8rem; margin-bottom: .5rem; }
h2 { font-size: 1.35rem; margin: 2.25rem 0 .25rem; }
h3 { font-size: 1.05rem; margin: 1.5rem 0 .6rem; color: #555; }
.fil { font-size: .85rem; color: #777; margin-bottom: 1rem; }
.fil a { color: #777; }
.intro { color: #555; max-width: 760px; }
.lien-br { background: none; border: none; font: inherit; color: var(--bleu); text-decoration: underline; cursor: pointer; padding: 0; }
.fiche { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 2rem; align-items: start; margin-top: 1.5rem; }
.apercu { background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,.1); padding: .75rem; }
.apercu img { width: 100%; height: auto; display: block; border: 1px solid var(--brd); }
.pager { display: flex; gap: .35rem; flex-wrap: wrap; margin-bottom: .6rem; }
.pager { align-items: center; }
.pager button { border: 2px solid var(--brd); background: white; border-radius: 8px; padding: .35rem .8rem; font: inherit; font-weight: 800; cursor: pointer; }
.pager button.actif { background: var(--bleu); border-color: var(--bleu); color: white; }
.pager .fleche { padding: .35rem .65rem; }
.pager .position { font-weight: 700; color: #555; padding: 0 .4rem; }
.badge-pages { position: absolute; top: .5rem; right: .5rem; background: rgba(44,62,80,.85); color: white; font-size: .72rem; font-weight: 800; border-radius: 10px; padding: .1rem .45rem; }
.carte { position: relative; }
.actions { display: flex; flex-direction: column; gap: .75rem; }
.btn { display: inline-flex; justify-content: center; align-items: center; gap: .5rem; padding: .85rem 1.5rem; border-radius: 10px;
  font-weight: 800; font-size: 1.05rem; text-decoration: none; }
.btn-dl { background: var(--orange); color: white; }
.btn-perso { background: white; border: 2px solid var(--brd); color: var(--texte); }
.infos { list-style: none; font-size: .95rem; color: #555; }
.infos li { margin: .25rem 0; }
.outils { position: sticky; top: 0; z-index: 5; background: var(--gris); padding: .75rem 0; margin-top: 1rem; display: flex; flex-direction: column; gap: .6rem; }
.recherche { position: relative; display: block; }
.recherche input { width: 100%; font: inherit; font-size: 1.05rem; padding: .7rem 3rem .7rem 2.6rem; border: 2px solid var(--brd); border-radius: 12px; background: white; }
.recherche input:focus { outline: none; border-color: var(--bleu); }
.recherche::before { content: '🔍'; position: absolute; left: .85rem; top: 50%; transform: translateY(-50%); }
.recherche kbd { position: absolute; right: .8rem; top: 50%; transform: translateY(-50%); font: inherit; font-size: .75rem; color: #888; border: 1px solid var(--brd); border-radius: 6px; padding: .05rem .4rem; background: var(--gris); }
.filtres { display: flex; gap: .5rem 1rem; flex-wrap: wrap; align-items: center; }
.filtre { display: flex; gap: .3rem; flex-wrap: wrap; align-items: center; }
.filtre .lib { font-size: .75rem; font-weight: 800; color: #888; text-transform: uppercase; margin-right: .2rem; }
.filtre button { border: 2px solid var(--brd); background: white; border-radius: 20px; padding: .25rem .8rem; font: inherit; font-size: .9rem; font-weight: 700; cursor: pointer; }
.filtre button.actif { background: var(--bleu); border-color: var(--bleu); color: white; }
.compteur { font-size: .85rem; color: #888; }
.grille { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 1rem; }
.carte { background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,.08); padding: .6rem; text-decoration: none;
  color: var(--texte); display: flex; flex-direction: column; gap: .4rem; border-top: 4px solid var(--orange); }
.carte.exercice { border-top-color: var(--vert); }
.carte img { width: 100%; height: auto; border: 1px solid var(--brd); aspect-ratio: 210 / 297; object-fit: cover; object-position: top; }
.carte img.paysage { aspect-ratio: 297 / 210; }
.carte span { font-weight: 700; font-size: .9rem; }
.carte small { color: #888; font-size: .78rem; }
.badge { font-style: normal; font-size: .7rem; background: #eee; border-radius: 6px; padding: .05rem .35rem; margin-left: .25rem; }
.badge.br { background: #111; color: white; }
.vide { color: #888; font-style: italic; margin: 2rem 0; }
[hidden] { display: none !important; }
footer { text-align: center; font-size: .8rem; color: #888; padding: 2rem 1rem; }
@media (max-width: 720px) { .fiche { grid-template-columns: 1fr; } .recherche kbd { display: none; } }
`

// Langue de l'interface et langue régionale : les choix faits dans l'app (mêmes clés localStorage),
// sinon ceux du site. Interface en breton → langue régionale bretonne d'office (comme dans l'app).
const SCRIPT_CONTEXTE = `<script>
(function () {
  var ui = '${SITE.langue}', reg = '${SITE.langueRegionale}'
  try { var s = JSON.parse(localStorage.getItem('ep_langue_interface')); if (s === 'fr' || s === 'br') ui = s } catch (e) {}
  try { var r = localStorage.getItem('ep_langue_regionale'); if (r !== null) reg = JSON.parse(r) || '' } catch (e) {}
  window.__contexte = { ui: ui, reg: reg }
  appliquerContexte()
})()
function appliquerContexte() {
  var c = window.__contexte, d = document.documentElement
  d.dataset.ui = c.ui; d.lang = c.ui
  d.dataset.regionale = c.reg || (c.ui === 'br' ? 'br' : 'aucune')
  document.querySelectorAll('option[data-fr]').forEach(function (o) { o.textContent = o.dataset[c.ui] || o.textContent })
  document.dispatchEvent(new Event('contexte'))
}
// classe choisie : même mémoire que l'app (ep_classe) ; sur l'index, elle règle le filtre « Classe »
function choisirClasse(c) {
  try { localStorage.setItem('ep_classe', JSON.stringify(c)) } catch (e) {}
  var b = document.querySelector('.filtre[data-filtre="classe"] [data-v="' + c + '"]')
  if (b) b.click()
}
document.addEventListener('DOMContentLoaded', function () {
  var c = ''
  try { c = JSON.parse(localStorage.getItem('ep_classe')) || '' } catch (e) {}
  var s = document.getElementById('classe-nav')
  if (s) s.value = c
})
function ouvrirRecherche() {
  var q = document.getElementById('q')
  if (q) { q.focus(); q.select(); return false }
  return true
}
function choisirLangue(l) {
  window.__contexte.ui = l
  try { localStorage.setItem('ep_langue_interface', JSON.stringify(l)) } catch (e) {}
  appliquerContexte()
}
function activerBreton() {
  window.__contexte.reg = 'br'
  try { localStorage.setItem('ep_langue_regionale', JSON.stringify('br')) } catch (e) {}
  appliquerContexte()
}
</script>`

// mêmes drapeaux que l'app
const DRAPEAU_FR = DRAPEAUX.fr.svg
const DRAPEAU_BR = DRAPEAUX.br.svg

function gabarit({ titre, description, canonique, contenu, image, jsonLd }) {
  return `<!DOCTYPE html>
<html lang="${SITE.langue}" data-ui="${SITE.langue}" data-regionale="${SITE.langueRegionale || 'aucune'}"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${echapper(titre)} — ${SITE.nom}</title>
<meta name="description" content="${echapper(description)}">
<link rel="canonical" href="${canonique}">
<meta property="og:type" content="website"><meta property="og:locale" content="fr_FR"><meta property="og:site_name" content="${SITE.nom}">
<meta property="og:title" content="${echapper(titre)}"><meta property="og:description" content="${echapper(description)}">
${image ? `<meta property="og:image" content="${image}">` : ''}
<link rel="icon" href="${BASE}favicon.svg" type="image/svg+xml">
<link rel="icon" href="${BASE}favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="${BASE}apple-touch-icon.png">
<meta name="twitter:card" content="summary_large_image">${jsonLd ? `\n<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''}
<style>${CSS}</style>
${SCRIPT_CONTEXTE}
</head><body>
<header class="nav">
<a class="logo" href="${BASE}">${SITE.emoji} ${SITE.nom}</a>
<nav class="liens">
  <a href="${BASE}#/maths">🔢 ${bi('nav_maths')}</a>
  <a href="${BASE}#/francais">📝 ${bi('nav_francais')}</a>
  <a href="${BASE}#/lecture">📖 ${bi('nav_lecture')}</a>
  <a href="${BASE}#/autres">🌍 ${bi('nav_autres')}</a>
  <a href="${BASE}#/imprimer" class="imprimer actif">🖨️ ${bi('nav_imprimer')}</a>
  <a href="${BASE}#/parametres" class="reglages" title="Paramètres">⚙️</a>
</nav>
<div class="droite">
  <a class="loupe" href="${BASE}telechargements/?chercher=1" title="Rechercher (/)" onclick="return ouvrirRecherche()">🔍<kbd>⌘K</kbd></a>
  <div class="langue-ui" role="group" aria-label="Langue / Yezh">
    <button data-ui="fr" onclick="choisirLangue('fr')" title="Français" aria-label="Français">${DRAPEAU_FR}</button><button data-ui="br" onclick="choisirLangue('br')" title="Brezhoneg" aria-label="Brezhoneg">${DRAPEAU_BR}</button>
  </div>
  <label class="classe" title="Classe">🎒 <span class="lib">${bi('nav_classe')}</span>
    <select id="classe-nav" onchange="choisirClasse(this.value)"><option value="" data-fr="${T.fr.nav_toutes}" data-br="${T.br.nav_toutes}">${tx('nav_toutes')}</option>${CLASSES.map(c => `<option value="${c}">${c.toUpperCase()}</option>`).join('')}</select>
  </label>
</div></header>
<main>${contenu}</main>
<footer><a id="signaler" href="mailto:${CONTACT}">${bi('signaler')}</a> · <a href="${BASE}#/nouveautes">${bi('nouveautes')}</a><br>
${bi('pied')} Polices / Nodrezhoù : Playwrite FR Trad, Andika, OpenDyslexic (OFL), Luciole (CC BY).</footer>
<script>
// mail prérempli avec l'adresse de la page (pas de formulaire, rien n'est stocké).
// Dans ce gabarit, les échappements sont doublés (\\n) pour arriver tels quels dans la page.
document.getElementById('signaler').href = 'mailto:${CONTACT}?subject=' + encodeURIComponent('[${SITE.nom}] Erreur — ' + location.pathname)
  + '&body=' + encodeURIComponent('Bonjour,\\n\\nJ\\'ai trouvé une erreur sur cette fiche :\\n\\n…\\n\\n———\\nPage : ' + location.href)
</script>
</body></html>`
}

// ── Génération des documents ─────────────────────────────────────────────────

// PDF + aperçus JPEG d'un document (nomApercu pour la 1re page, nomApercu-p2.jpg… pour les suivantes) ;
// renvoie { paysage, nbApercus }
async function enPdf(doc, html, dossier, nomPdf, nomApercu) {
  // assez large pour une page A3 paysage ; les fiches qui s'écoulent sont rendues en largeur A4 plus bas
  await doc.setViewportSize({ width: 1700, height: 1300 })
  await doc.setContent(html, { waitUntil: 'load' })
  await doc.evaluate(() => document.fonts.ready)
  await doc.emulateMedia({ media: 'print' })
  await doc.pdf({ path: join(dossier, nomPdf), preferCSSPageSize: true, printBackground: true })
  await doc.emulateMedia({ media: 'screen' })
  // fiches « à pages » (.page de taille fixe), sinon fiches qui s'écoulent : le haut de la première page
  const pages = doc.locator('.page')
  const n = await pages.count()
  if (n) {
    for (let k = 0; k < n; k++) {
      const nom = k ? nomApercu.replace(/\.jpg$/, `-p${k + 1}.jpg`) : nomApercu
      await pages.nth(k).screenshot({ path: join(dossier, nom), type: 'jpeg', quality: k ? 70 : 78 })
    }
    return { paysage: await pages.first().evaluate(e => e.offsetWidth > e.offsetHeight), nbApercus: n }
  }
  await doc.setViewportSize({ width: 794, height: 1123 })
  await doc.evaluate(() => { document.body.style.background = 'white' })
  await doc.screenshot({ path: join(dossier, nomApercu), type: 'jpeg', quality: 78, fullPage: true, clip: { x: 0, y: 0, width: 794, height: 1123 } })
  return { paysage: false, nbApercus: 1 }
}

// Fiches d'exercices : la page d'exercice de l'app en mode impression, avec un hasard reproductible
async function genererExercices(navigateur, url, doc) {
  const res = []
  for (const langue of ['fr', 'br']) {
    const ctx = await navigateur.newContext({ viewport: { width: 1100, height: 1000 } })
    await ctx.addInitScript(l => {
      const g = new URLSearchParams(location.search).get('graine')
      if (g) {
        let s = Number(g) | 0
        Math.random = () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
      }
      // chaque fiche part des réglages par défaut de l'exercice (pas de réglage mémorisé d'une fiche à l'autre)
    try { localStorage.clear(); localStorage.setItem('ep_langue_interface', JSON.stringify(l)); localStorage.setItem('ep_avis_traduction_vu', 'true') } catch {}
    }, langue)
    const page = await ctx.newPage()
    for (const ex of EXERCICES) {
      for (const c of ex.classes) {
        const slug = `exercices-${ex.id}-${c.classe}${langue === 'br' ? '-brezhoneg' : ''}`
        const dossier = join(dist, 'telechargements', slug)
        mkdirSync(dossier, { recursive: true })
        let paysage = false
        for (let v = 1; v <= NB_VARIANTES; v++) {
          await page.goto(`${url}?graine=${graineDe(slug) + v}#${ex.route}?mode=imprimer`)
          await page.locator('.cadre-exercice').waitFor({ timeout: 15000 })
          if (c.bouton) {
            const btn = page.locator('.cadre-exercice button', { hasText: new RegExp(c.bouton) }).first()
            if (!(await btn.count())) throw new Error(`${slug} : bouton de niveau /${c.bouton}/ introuvable`)
            await btn.click()
          }
          // réglages propres à la classe (ex. opérations du calcul mental)
          for (const re of c.clics ?? []) {
            const b = page.locator('.cadre-exercice button', { hasText: new RegExp(re) }).first()
            if (await b.count() && !(await b.getAttribute('class') ?? '').includes('active')) await b.click()
          }
          // corrigé : le cocher s'il existe
          const corrige = page.locator('.cadre-exercice label', { hasText: /Corrig|Reizhadenn/ }).locator('input[type=checkbox]')
          if (await corrige.count() && !(await corrige.first().isChecked())) await corrige.first().check()
          const iframe = page.locator('.cadre-exercice iframe').first()
          await iframe.waitFor({ timeout: 15000 })
          await page.waitForTimeout(300)
          paysage = (await enPdf(doc, await iframe.getAttribute('srcdoc'), dossier, `fiche-${v}.pdf`, `apercu-${v}.jpg`)).paysage || paysage
        }
        const niveaux = etiquetteClasse(c.classe)
        res.push({
          slug, categorie: 'exercices', groupe: ex.groupe, usage: 'exercice', variantes: NB_VARIANTES,
          langues: [langue], classes: classesDe(c.classe), niveaux, lien: ex.route, paysage, nbPages: 1,
          titreFr: `${ex.titre.fr} — ${niveaux} : fiches d'exercices à imprimer${langue === 'br' ? ' (consignes en breton)' : ''}`,
          titreBr: `${ex.titre.br} — ${niveaux} : fichennoù poelladennoù da voullañ`,
          courtFr: `${ex.titre.fr} · ${niveaux}`, courtBr: `${ex.titre.br} · ${niveaux}`,
          description: `${ex.titre.fr} (${niveaux}) : ${NB_VARIANTES} fiches d'exercices différentes à imprimer, avec le corrigé${langue === 'br' ? ', consignes en breton' : ''}. Gratuit, en PDF.`,
        })
        console.log(`✓ ${slug} (${NB_VARIANTES} fiches)`)
      }
    }
    await ctx.close()
  }
  return res
}

async function main() {
  if (!existsSync(join(dist, 'index.html'))) throw new Error(`${OUT_DIR}/ absent : lancer \`vite build\` avant`)

  const serveur = await preview({
    root: racine, mode: MODE, build: { outDir: OUT_DIR },
    preview: { port: 4179, strictPort: false, open: false }, logLevel: 'warn',
  })
  const url = serveur.resolvedUrls.local[0]
  const navigateur = await chromium.launch({ executablePath: trouverChrome() })
  try {
    const app = await navigateur.newPage()
    await app.goto(`${url}?generation=1#/`)
    await app.waitForFunction(() => window.__ecolePrimaire)
    await app.evaluate(() => window.__ecolePrimaire.preparer())

    for (const [type, f] of Object.entries(policesLocales())) {
      const nom = await app.evaluate(([t, n, d]) => window.__ecolePrimaire.utiliserPolice(t, n, d), [type, f.nom, f.dataUrl])
      console.log(`Police locale (${type}) : ${nom}`)
    }

    // les deux sites publient toutes les fiches, françaises et bretonnes
    const liste = await app.evaluate(() => window.__ecolePrimaire.catalogue(['fr', 'br']))
    console.log(`Site ${SITE.nom} → ${OUT_DIR}/, ${liste.length} fiches, base ${BASE}`)
    const doc = await navigateur.newPage({ deviceScaleFactor: 1 })
    await doc.goto(url)
    for (const t of liste) {
      const dossier = join(dist, 'telechargements', t.slug)
      mkdirSync(dossier, { recursive: true })
      const r = await app.evaluate(slug => window.__ecolePrimaire.generer(slug), t.slug)
      Object.assign(t, await enPdf(doc, r.html, dossier, `${t.slug}.pdf`, 'apercu.jpg'))
      t.nbPages = r.nbPages
      t.format = `${r.format} ${tx(r.orientation === 'landscape' ? 'paysage' : 'portrait')}`
      Object.assign(t, classer(t), { classes: classesDepuisTexte(t.niveaux) })
      console.log(`✓ ${t.slug} (${r.nbPages} p.)`)
    }

    const exercices = AVEC_EXERCICES ? await genererExercices(navigateur, url, doc) : []
    ecrirePages([...liste, ...exercices])
    await imagePartage(doc, url, liste)
    ecrireManifeste()
  } finally {
    await navigateur.close()
    await new Promise(ok => serveur.httpServer.close(ok))
  }
}

// Image d'aperçu lors d'un partage (og:image de l'accueil), 1200 × 630 : nom du site, accroche, vignettes
async function imagePartage(doc, url, liste) {
  const br = SITE.langue === 'br'
  const choix = ['affiche-alphabet-a4-paysage', 'fiche-table-de-multiplication-7', 'fiche-ecriture-lettre-a', br ? 'affiche-alphabet-breton-a4' : 'affiches-nombres-francais-breton']
    .filter(s => liste.some(t => t.slug === s))
  const vignettes = choix.map(s => `<img src="${url}telechargements/${s}/apercu.jpg">`).join('')
  const favicon = readFileSync(join(racine, 'public/favicon.svg'), 'utf8').replace('<svg ', '<svg width="120" height="120" ')
  await doc.setViewportSize({ width: 1200, height: 630 })
  await doc.setContent(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body { margin: 0; width: 1200px; height: 630px; font-family: 'Segoe UI', system-ui, sans-serif; color: #2c3e50;
  background: linear-gradient(135deg, #eef5fe, #fff8ef); display: flex; overflow: hidden; }
.texte { width: 560px; padding: 70px 0 0 70px; }
.logo { display: flex; align-items: center; gap: 24px; }
h1 { font-size: 66px; margin: 0; color: #3a78c9; }
p { font-size: 33px; line-height: 1.35; margin: 34px 0 0; }
.url { font-size: 26px; color: #b35c00; font-weight: 700; margin-top: 30px; }
.vignettes { position: relative; flex: 1; }
.vignettes img { position: absolute; width: 270px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,.18); background: white; }
.vignettes img:nth-child(1) { left: 40px; top: 60px; transform: rotate(-6deg); }
.vignettes img:nth-child(2) { left: 330px; top: 30px; transform: rotate(5deg); }
.vignettes img:nth-child(3) { left: 70px; top: 330px; transform: rotate(4deg); }
.vignettes img:nth-child(4) { left: 340px; top: 320px; transform: rotate(-4deg); }
</style></head><body>
<div class="texte"><div class="logo">${favicon}<h1>${echapper(SITE.nom)}</h1></div>
<p>${br ? 'Poelladennoù ha fichennoù digoust da voullañ, e galleg hag e brezhoneg.' : 'Exercices et fiches à imprimer gratuites, de la maternelle au CM2.'}</p>
<div class="url">${SITE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '')}</div></div>
<div class="vignettes">${vignettes}</div></body></html>`, { waitUntil: 'load' })
  await doc.screenshot({ path: join(dist, 'og-image.jpg'), type: 'jpeg', quality: 85 })
}

// Manifeste (icônes pour l'écran d'accueil d'un téléphone)
function ecrireManifeste() {
  writeFileSync(join(dist, 'site.webmanifest'), JSON.stringify({
    name: SITE.nom, short_name: SITE.nom, lang: SITE.langue, start_url: BASE, display: 'standalone',
    background_color: '#f8f9fa', theme_color: '#4a90e2',
    icons: [
      { src: `${BASE}icone-192.png`, sizes: '192x192', type: 'image/png' },
      { src: `${BASE}icone-512.png`, sizes: '512x512', type: 'image/png' },
      { src: `${BASE}favicon.svg`, sizes: 'any', type: 'image/svg+xml' },
    ],
  }, null, 2))
}

// ── Pages statiques ──────────────────────────────────────────────────────────

const lienFiche = t => `${BASE}telechargements/${t.slug}/`
const titreFr = t => t.titreFr ?? t.titre
const courtDuo = t => duo(t.courtFr ?? t.court, t.courtBr ?? t.court)
const titreDuo = t => duo(titreFr(t), t.titreBr ?? titreFr(t))
// badge de langue, seulement quand la langue régionale est active
const badge = t => (t.langues.length === 1 && t.langues[0] === 'fr' ? ''
  : `<em class="badge si-br${brSeule(t) ? ' br' : ''}">${brSeule(t) ? 'BR' : 'FR · BR'}</em>`)

function carte(t) {
  const texte = normaliser([titreFr(t), t.titreBr, t.courtFr ?? t.court, t.courtBr, t.description, t.niveaux, t.slug.replace(/-/g, ' ')].filter(Boolean).join(' '))
  const apercu = t.variantes ? 'apercu-1.jpg' : 'apercu.jpg'
  return `<a class="carte ${t.usage}${avecBreton(t) ? ' si-br' : ''}" href="${lienFiche(t)}" data-langues="${t.langues.join(' ')}" data-classes="${t.classes.join(' ')}" data-usage="${t.usage}" data-texte="${echapper(texte)}">
${(t.nbApercus ?? 1) > 1 ? `<em class="badge-pages">📄 ${t.nbApercus}</em>` : ''}<img src="${lienFiche(t)}${apercu}" alt="${echapper(titreFr(t))}" loading="lazy" width="300"${t.paysage ? ' class="paysage"' : ''}>
<span>${t.usage === 'apprendre' ? '📘' : '✏️'} ${courtDuo(t)} ${badge(t)}</span><small>🎒 ${echapper(t.niveaux)}${t.variantes ? ` · ${bi('variantes', t.variantes)}` : ''}</small></a>`
}

function pageFiche(t, liste) {
  const cat = CATEGORIES.find(c => c.id === t.categorie)
  // fiches voisines : même nature (apprendre / s'entraîner) et même langue ; d'abord le même exercice
  // dans d'autres classes, puis la même rubrique
  const racineSlug = x => x.slug.replace(/-(ms|gs|cp|ce1|ce2|cm1|cm2|gs-cp|ms-gs|cp-cm2)(-brezhoneg)?$/, '')
  const proches = liste.filter(x => x.slug !== t.slug && x.usage === t.usage && avecBreton(x) === avecBreton(t))
  const voisines = [
    ...proches.filter(x => x.variantes && racineSlug(x) === racineSlug(t)),
    ...proches.filter(x => x.groupe === t.groupe && !(x.variantes && racineSlug(x) === racineSlug(t))),
  ].slice(0, 8)
  const sansEmoji = s => s.replace(/^\S+\s/, '')
  const rubrique = cat ? duo(sansEmoji(cat.titre), sansEmoji(cat.titreBr ?? cat.titre)) : bi(`g_${t.groupe}`)
  const n = t.variantes ?? 0
  const pdf = n ? 'fiche-1.pdf' : `${t.slug}.pdf`
  const apercu = n ? 'apercu-1.jpg' : 'apercu.jpg'
  // visionneuse : fiches différentes (variantes, chacune son PDF) ou pages d'un même document
  const nbPagesApercu = n ? 0 : (t.nbApercus ?? 1)
  const images = n ? Array.from({ length: n }, (_, k) => `apercu-${k + 1}.jpg`)
    : Array.from({ length: nbPagesApercu }, (_, k) => (k ? `apercu-p${k + 1}.jpg` : 'apercu.jpg'))
  const pdfs = n ? Array.from({ length: n }, (_, k) => `fiche-${k + 1}.pdf`) : null
  const pager = images.length > 1 ? `<div class="pager">
  <button type="button" class="fleche" data-pas="-1" aria-label="Précédent">◀</button>
  ${n ? Array.from({ length: n }, (_, k) => `<button type="button" class="num${k ? '' : ' actif'}" data-k="${k}">${bi('fiche', k + 1)}</button>`).join('')
    : `<span class="position">${bi('page')} <b id="pos">1</b> / ${images.length}</span>`}
  <button type="button" class="fleche" data-pas="1" aria-label="Suivant">▶</button>
</div>
<script>
(function () {
  var images = ${JSON.stringify(images)}, pdfs = ${JSON.stringify(pdfs)}, k = 0
  function aller(i) {
    k = (i + images.length) % images.length
    document.getElementById('apercu').src = images[k]
    if (pdfs) document.getElementById('dl').href = pdfs[k]
    var pos = document.getElementById('pos'); if (pos) pos.textContent = k + 1
    document.querySelectorAll('.pager .num').forEach(function (b) { b.classList.toggle('actif', +b.dataset.k === k) })
    // précharge les pages voisines pour un passage instantané
    new Image().src = images[(k + 1) % images.length]; new Image().src = images[(k - 1 + images.length) % images.length]
  }
  document.querySelectorAll('.pager .fleche').forEach(function (b) { b.onclick = function () { aller(k + +b.dataset.pas) } })
  document.querySelectorAll('.pager .num').forEach(function (b) { b.onclick = function () { aller(+b.dataset.k) } })
  document.addEventListener('keydown', function (e) {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) return
    if (e.key === 'ArrowRight') aller(k + 1); else if (e.key === 'ArrowLeft') aller(k - 1)
  })
  // préchargement des images suivantes
  images.slice(1, 4).forEach(function (src) { new Image().src = src })
})()
</script>` : ''
  const contenu = `
<p class="fil"><a href="${BASE}telechargements/">${bi('telecharger')}</a> › ${rubrique}</p>
<h1>${titreDuo(t)}</h1>
<p class="intro">${echapper(t.description)}</p>
<div class="fiche">
  <div class="apercu">${pager}<img id="apercu" src="${apercu}" alt="${echapper(titreFr(t))}" width="600"></div>
  <div class="actions">
    <a class="btn btn-dl" id="dl" href="${pdf}" download>${bi('pdf')}</a>
    <button class="btn btn-perso" type="button" onclick="imprimerPdf()">${bi('imprimer')}</button>
    <a class="btn btn-perso" href="${BASE}#${t.lien}${n ? '?mode=imprimer' : ''}">${bi('personnaliser')}</a>
    <ul class="infos">
      ${n ? `<li>📚 ${bi('variantes', n)} — ${bi('variantesAide')}</li>` : `<li>${bi('pages', t.nbPages)} · ${echapper(t.format)}</li>`}
      <li>🎒 ${echapper(t.niveaux)}</li>
      <li>${bi('imprimer100')}</li>
    </ul>
    <p class="intro">${cat ? duo(cat.intro, cat.introBr ?? cat.intro) : ''} ${bi('persoAide')}</p>
  </div>
</div>
<script>
// Imprime le PDF affiché sans le télécharger (iframe cachée) ; sinon l'ouvre dans un onglet
function imprimerPdf() {
  var href = document.getElementById('dl').getAttribute('href')
  var f = document.createElement('iframe')
  f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'
  f.src = href
  f.onload = function () {
    try { f.contentWindow.focus(); f.contentWindow.print() } catch (e) { window.open(href, '_blank') }
    setTimeout(function () { f.remove() }, 60000)
  }
  document.body.appendChild(f)
}
</script>
${voisines.length ? `<h2>${bi('autres')}</h2>
<div class="grille">${voisines.map(carte).join('')}</div>` : ''}`
  writeFileSync(join(dist, 'telechargements', t.slug, 'index.html'), gabarit({
    titre: SITE.langue === 'br' ? t.titreBr ?? titreFr(t) : titreFr(t), description: t.description,
    canonique: `${urlReference(t)}telechargements/${t.slug}/`, image: `${urlReference(t)}telechargements/${t.slug}/${apercu}`, contenu,
    // données structurées : ressource pédagogique gratuite, en PDF
    jsonLd: {
      '@context': 'https://schema.org', '@type': 'LearningResource',
      name: titreFr(t), description: t.description, url: `${urlReference(t)}telechargements/${t.slug}/`,
      image: `${urlReference(t)}telechargements/${t.slug}/${apercu}`,
      inLanguage: t.langues, educationalLevel: t.niveaux, learningResourceType: t.usage === 'apprendre' ? 'Affiche' : "Fiche d'exercices",
      encodingFormat: 'application/pdf', isAccessibleForFree: true,
      publisher: { '@type': 'Organization', name: SITE.nom, url: SITE_URL },
    },
  }))
}

function pageIndex(liste) {
  const filtre = (nom, lib, choix, cls = '') => `<div class="filtre ${cls}" data-filtre="${nom}">${lib ? `<span class="lib">${lib}</span>` : ''}${choix.map(([v, l], k) =>
    `<button data-v="${v}"${k ? '' : ' class="actif"'}>${l}</button>`).join('')}</div>`
  const section = usage => {
    const groupes = GROUPES[usage].filter(g => liste.some(t => t.usage === usage && t.groupe === g))
    if (!groupes.length) return ''
    return `<section class="usage" data-usage="${usage}">
<h2>${bi(usage === 'apprendre' ? 'apprendre' : 'entrainer')}</h2><p class="intro">${bi(usage === 'apprendre' ? 'apprendreAide' : 'entrainerAide')}</p>
${groupes.map(g => `<div class="groupe"><h3>${bi(`g_${g}`)}</h3>
<div class="grille">${liste.filter(t => t.usage === usage && t.groupe === g).map(carte).join('')}</div></div>`).join('\n')}
</section>`
  }
  const classesPresentes = CLASSES.filter(c => liste.some(t => t.classes.includes(c)))
  const contenu = `
<h1>${bi('titreIndex')}</h1>
<p class="intro">${bi('introIndex')} <span class="si-br">${bi('introBreton')}</span> ${bi('introPerso')} <a href="${BASE}#/imprimer">${bi('generateur')}</a>.
<button class="lien-br si-pas-br" onclick="activerBreton()">${bi('voirBreton')}</button></p>
<div class="outils">
  <label class="recherche"><input id="q" type="search" autocomplete="off" placeholder="${echapper(tx('rechercher'))}"
    data-fr="${echapper(T.fr.rechercher)}" data-br="${echapper(T.br.rechercher)}"><kbd>/</kbd></label>
  <div class="filtres">
    ${filtre('usage', '', [['', bi('tout')], ['apprendre', bi('apprendre')], ['exercice', bi('entrainer')]])}
    ${filtre('classe', bi('classe'), [['', bi('toutes')], ...classesPresentes.map(c => [c, c.toUpperCase()])])}
    ${filtre('langue', bi('langueFiches'), [['', bi('toutes')], ['fr', bi('francais')], ['br', bi('breton')]], 'si-br')}
    <span class="compteur" id="compteur"></span>
  </div>
</div>
${section('apprendre')}
${section('exercice')}
<p class="vide" id="vide" hidden>${bi('aucune')}</p>
<script>
(function () {
  var filtres = { usage: '', classe: '', langue: '' }
  var q = document.getElementById('q')
  var norm = function (s) { return s.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase() }
  function appliquer() {
    var d = document.documentElement, breton = d.dataset.regionale === 'br'
    var mots = norm(q.value).split(/\\s+/).filter(Boolean), n = 0
    document.querySelectorAll('.carte').forEach(function (c) {
      var langues = c.dataset.langues.split(' ')
      var ok = (breton || langues.indexOf('br') < 0)
        && (!filtres.usage || c.dataset.usage === filtres.usage)
        && (!filtres.classe || c.dataset.classes.split(' ').indexOf(filtres.classe) >= 0)
        && (!breton || !filtres.langue || langues.indexOf(filtres.langue) >= 0)
        && mots.every(function (m) { return c.dataset.texte.indexOf(m) >= 0 })
      c.hidden = !ok; if (ok) n++
    })
    document.querySelectorAll('.groupe, section.usage').forEach(function (g) { g.hidden = !g.querySelector('.carte:not([hidden])') })
    document.getElementById('vide').hidden = n > 0
    var br = d.dataset.ui === 'br'
    document.getElementById('compteur').textContent = br ? 'Fichennoù : ' + n : n + ' fiche' + (n > 1 ? 's' : '')
    q.placeholder = br ? q.dataset.br : q.dataset.fr
  }
  document.querySelectorAll('.filtre[data-filtre]').forEach(function (f) {
    f.querySelectorAll('button').forEach(function (b) {
      b.onclick = function () {
        f.querySelectorAll('button').forEach(function (x) { x.classList.toggle('actif', x === b) })
        filtres[f.dataset.filtre] = b.dataset.v; appliquer()
        if (f.dataset.filtre === 'classe') {
          var s = document.getElementById('classe-nav'); if (s) s.value = b.dataset.v
          try { localStorage.setItem('ep_classe', JSON.stringify(b.dataset.v)) } catch (e) {}
        }
      }
    })
  })
  q.oninput = appliquer
  document.addEventListener('contexte', appliquer)
  // raccourcis : « / » ou Ctrl/⌘+K pour chercher, Échap pour effacer
  document.addEventListener('keydown', function (e) {
    var champ = /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)
    if ((e.key === '/' && !champ) || (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey))) { e.preventDefault(); q.focus(); q.select() }
    else if (e.key === 'Escape' && document.activeElement === q) { q.value = ''; appliquer() }
  })
  // ?q=… et ?classe=… dans l'URL (liens depuis l'app)
  var p = new URLSearchParams(location.search)
  if (p.get('q')) q.value = p.get('q')
  if (p.has('chercher')) setTimeout(function () { q.focus() }, 0)
  var cm = ''
  try { cm = JSON.parse(localStorage.getItem('ep_classe')) || '' } catch (e) {}
  var cl = p.get('classe') || cm
  var bc = cl && document.querySelector('.filtre[data-filtre="classe"] [data-v="' + cl + '"]')
  if (bc) bc.click(); else appliquer()
})()
</script>`
  writeFileSync(join(dist, 'telechargements', 'index.html'), gabarit({
    titre: SITE.langue === 'br' ? 'Fichennoù digoust da voullañ' : 'Fiches à imprimer gratuites : écriture, alphabet, calcul, exercices',
    description: `Fiches d'écriture script et attaché sur lignes Seyès, affiches de l'alphabet, fiches de calcul et d'exercices avec corrigé${SITE.langueRegionale ? ', en français et en breton' : ''}. PDF gratuits pour la maternelle et l'élémentaire.`,
    canonique: `${SITE_URL}telechargements/`, contenu,
  }))
}

function ecrirePages(liste) {
  for (const t of liste) pageFiche(t, liste)
  pageIndex(liste)

  // sitemap : seulement les pages dont ce site est l'adresse de référence
  const miennes = liste.filter(t => urlReference(t) === SITE_URL)
  const urls = ['', 'telechargements/', ...miennes.map(t => `telechargements/${t.slug}/`)]
  writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${SITE_URL}${u}</loc></url>`).join('\n')}
</urlset>
`)
  writeFileSync(join(dist, '404.html'), gabarit({
    titre: tx('introuvable'),
    description: '', canonique: SITE_URL,
    contenu: `<h1>🤔 ${bi('introuvable')}</h1>
<p class="intro" style="margin:1rem 0">${bi('introuvableAide')}</p>
<p><a class="btn btn-dl" href="${BASE}">${bi('accueil')}</a>
<a class="btn btn-perso" href="${BASE}telechargements/">${bi('telecharger')}</a></p>`,
  }))
  writeFileSync(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}sitemap.xml\n`)
  // liste des fiches pour la recherche dans l'app
  writeFileSync(join(dist, 'telechargements', 'fiches.json'), JSON.stringify(liste.map(t => ({
    slug: t.slug, fr: t.courtFr ?? t.court, br: t.courtBr ?? t.court, titre: titreFr(t), niveaux: t.niveaux,
    classes: t.classes, usage: t.usage, langues: t.langues, groupe: t.groupe,
  }))))
  console.log(`${liste.length} pages de fiches, sitemap : ${urls.length} URL`)
}

main().catch(e => { console.error(e); process.exit(1) })
