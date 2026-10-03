// Génère les fiches « toutes prêtes » en PDF + des pages statiques indexables.
// Lancé après `vite build` (voir `npm run build`) : il sert dist/ avec `vite preview`,
// pilote Chrome sans interface pour produire les documents avec le code de l'app,
// puis écrit dist/telechargements/<slug>/{index.html, <slug>.pdf, apercu.jpg}, l'index et le sitemap.
//
// Polices : par défaut celles incluses (Playwrite FR Trad, Andika). Pour utiliser une police
// non redistribuable (Belle Allure, Écolier…) dans les PDF, déposer le fichier dans
// polices-locales/attache/ (ou polices-locales/script/) — dossier ignoré par git.
//
// Options : --mode <mode Vite> (défaut : production → .env ; ecoleprimaire / skoolik → .env.<mode>)
//           --outDir <dossier> (défaut : dist). Variables : CHROME_PATH (chemin de Chrome).
// Le site (VITE_SITE), la base (VITE_BASE) et l'URL publique (VITE_SITE_URL) viennent des fichiers .env*.
import { preview, loadEnv } from 'vite'
import { chromium } from 'playwright-core'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CATEGORIES } from '../src/impression/catalogue.js'
import { site } from '../src/site.js'

const arg = (nom, defaut) => {
  const i = process.argv.indexOf(nom)
  return i > 0 ? process.argv[i + 1] : defaut
}
const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const MODE = arg('--mode', 'production')
const OUT_DIR = arg('--outDir', 'dist')
const dist = join(racine, OUT_DIR)
const env = loadEnv(MODE, racine)
const BASE = env.VITE_BASE || '/ecole-primaire/'
const SITE_URL = (env.VITE_SITE_URL || 'https://iksaif.github.io/ecole-primaire/').replace(/\/?$/, '/')
const SITE = site(env.VITE_SITE)
// Textes des pages statiques par langue du site (lang="fr" tant qu'ils ne sont pas traduits). TODO : traduction bretonne à faire relire par un
// brittophone — en attendant, skoolik.app reprend les textes français.
const T = {
  fr: { telecharger: 'Fiches à télécharger', creer: 'Créer ma fiche', exercices: 'Exercices en ligne' },
}
const t = cle => (T[SITE.langue] ?? T.fr)[cle] ?? T.fr[cle]

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

const echapper = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

const CSS = `
:root { --bleu:#4a90e2; --vert:#5cb85c; --orange:#f39c12; --texte:#2c3e50; --gris:#f8f9fa; --brd:#dee2e6; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Segoe UI', system-ui, sans-serif; color: var(--texte); background: var(--gris); line-height: 1.5; }
a { color: var(--bleu); }
header { background: white; box-shadow: 0 4px 12px rgba(0,0,0,.08); padding: .75rem 1.5rem; display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }
header .logo { font-size: 1.4rem; font-weight: 800; text-decoration: none; }
header nav a { text-decoration: none; font-weight: 600; margin-right: 1rem; color: var(--texte); }
main { max-width: 1000px; margin: 0 auto; padding: 2rem 1.25rem 3rem; }
h1 { font-size: 1.8rem; margin-bottom: .5rem; }
h2 { font-size: 1.3rem; margin: 2rem 0 .75rem; }
.fil { font-size: .85rem; color: #777; margin-bottom: 1rem; }
.fil a { color: #777; }
.intro { color: #555; max-width: 720px; }
.fiche { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 2rem; align-items: start; margin-top: 1.5rem; }
.apercu { background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,.1); padding: .75rem; }
.apercu img { width: 100%; height: auto; display: block; border: 1px solid var(--brd); }
.actions { display: flex; flex-direction: column; gap: .75rem; }
.btn { display: inline-flex; justify-content: center; align-items: center; gap: .5rem; padding: .85rem 1.5rem; border-radius: 10px;
  font-weight: 800; font-size: 1.05rem; text-decoration: none; }
.btn-dl { background: var(--orange); color: white; }
.btn-perso { background: white; border: 2px solid var(--brd); color: var(--texte); }
.infos { list-style: none; font-size: .95rem; color: #555; }
.infos li { margin: .25rem 0; }
.grille { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 1rem; }
.carte { background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,.08); padding: .6rem; text-decoration: none;
  color: var(--texte); display: flex; flex-direction: column; gap: .4rem; border-top: 4px solid var(--orange); }
.carte img { width: 100%; height: auto; border: 1px solid var(--brd); }
.carte span { font-weight: 700; font-size: .9rem; }
footer { text-align: center; font-size: .8rem; color: #888; padding: 2rem 1rem; }
@media (max-width: 720px) { .fiche { grid-template-columns: 1fr; } }
`

function gabarit({ titre, description, canonique, contenu, image }) {
  return `<!DOCTYPE html>
<html lang="fr"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${echapper(titre)} — ${SITE.nom}</title>
<meta name="description" content="${echapper(description)}">
<link rel="canonical" href="${canonique}">
<meta property="og:type" content="website"><meta property="og:locale" content="fr_FR"><meta property="og:site_name" content="${SITE.nom}">
<meta property="og:title" content="${echapper(titre)}"><meta property="og:description" content="${echapper(description)}">
${image ? `<meta property="og:image" content="${image}">` : ''}
<link rel="icon" href="${BASE}favicon.svg" type="image/svg+xml">
<style>${CSS}</style>
</head><body>
<header><a class="logo" href="${BASE}">${SITE.emoji} ${SITE.nom}</a>
<nav><a href="${BASE}telechargements/">📥 ${t('telecharger')}</a><a href="${BASE}#/imprimer">🖨️ ${t('creer')}</a><a href="${BASE}">🎯 ${t('exercices')}</a></nav></header>
<main>${contenu}</main>
<footer>Fiches gratuites, sans publicité, faites par des parents. Polices : Playwrite FR Trad, Andika (OFL).</footer>
</body></html>`
}

async function main() {
  if (!existsSync(join(dist, 'index.html'))) throw new Error('dist/ absent : lancer `vite build` avant')

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

    const liste = await app.evaluate(langue => window.__ecolePrimaire.catalogue(langue), SITE.langue)
    console.log(`Site ${SITE.nom} (${SITE.langue}) → ${OUT_DIR}/, ${liste.length} fiches, base ${BASE}`)
    const doc = await navigateur.newPage({ deviceScaleFactor: 1 })
    await doc.goto(url)
    for (const t of liste) {
      const dossier = join(dist, 'telechargements', t.slug)
      mkdirSync(dossier, { recursive: true })
      const r = await app.evaluate(slug => window.__ecolePrimaire.generer(slug), t.slug)
      await doc.setContent(r.html, { waitUntil: 'load' })
      await doc.evaluate(() => document.fonts.ready)
      await doc.emulateMedia({ media: 'print' })
      await doc.pdf({ path: join(dossier, `${t.slug}.pdf`), preferCSSPageSize: true, printBackground: true })
      await doc.emulateMedia({ media: 'screen' })
      await doc.locator('.page').first().screenshot({ path: join(dossier, 'apercu.jpg'), type: 'jpeg', quality: 78 })
      t.nbPages = r.nbPages
      t.format = `${r.format} ${r.orientation === 'landscape' ? 'paysage' : 'portrait'}`
      console.log(`✓ ${t.slug} (${r.nbPages} p.)`)
    }

    ecrirePages(liste)
  } finally {
    await navigateur.close()
    await new Promise(ok => serveur.httpServer.close(ok))
  }
}

function ecrirePages(liste) {
  const lienFiche = t => `${BASE}telechargements/${t.slug}/`
  const carte = t => `<a class="carte" href="${lienFiche(t)}"><img src="${lienFiche(t)}apercu.jpg" alt="${echapper(t.titre)}" loading="lazy" width="300"><span>${echapper(t.court)}</span></a>`

  for (const t of liste) {
    const cat = CATEGORIES.find(c => c.id === t.categorie)
    const voisines = liste.filter(x => x.categorie === t.categorie && x.slug !== t.slug).slice(0, 8)
    const pdf = `${t.slug}.pdf`
    const contenu = `
<p class="fil"><a href="${BASE}telechargements/">Fiches à télécharger</a> › ${echapper(cat.titre.replace(/^\S+\s/, ''))}</p>
<h1>${echapper(t.titre)}</h1>
<p class="intro">${echapper(t.description)}</p>
<div class="fiche">
  <div class="apercu"><img src="apercu.jpg" alt="Aperçu : ${echapper(t.titre)}" width="600"></div>
  <div class="actions">
    <a class="btn btn-dl" href="${pdf}" download>📥 Télécharger le PDF</a>
    <a class="btn btn-perso" href="${BASE}#${t.lien}">✏️ Personnaliser cette fiche</a>
    <ul class="infos">
      <li>📄 ${t.nbPages} page${t.nbPages > 1 ? 's' : ''} · ${echapper(t.format)}</li>
      <li>🎒 ${echapper(t.niveaux)}</li>
      <li>🖨️ Imprimer en « taille réelle » (100 %), sans « ajuster à la page »</li>
      <li>✔️ Gratuit, sans inscription</li>
    </ul>
    <p class="intro">${echapper(cat.intro)} Avec « Personnaliser », tu peux changer les lettres ou les mots, la taille du lignage, la police et l'espacement.</p>
  </div>
</div>
<h2>Autres fiches</h2>
<div class="grille">${voisines.map(carte).join('')}</div>`
    writeFileSync(join(dist, 'telechargements', t.slug, 'index.html'), gabarit({
      titre: t.titre, description: t.description, canonique: `${SITE_URL}telechargements/${t.slug}/`,
      image: `${SITE_URL}telechargements/${t.slug}/apercu.jpg`, contenu,
    }))
  }

  const index = `
<h1>📥 Fiches à imprimer gratuites</h1>
<p class="intro">Fiches d'écriture en script et en attaché sur lignes Seyès, affiches de l'alphabet, nombres en lettres en français et en breton.
Toutes les fiches sont gratuites, en PDF, prêtes à imprimer. Pour une fiche sur mesure (tes mots, ton lignage, ta police), utilise
<a href="${BASE}#/imprimer">le générateur de fiches</a>.</p>
${CATEGORIES.map(c => `<h2>${echapper(c.titre)}</h2><p class="intro">${echapper(c.intro)}</p>
<div class="grille" style="margin-top:.75rem">${liste.filter(t => t.categorie === c.id).map(carte).join('')}</div>`).join('\n')}`
  writeFileSync(join(dist, 'telechargements', 'index.html'), gabarit({
    titre: 'Fiches à imprimer gratuites : écriture, alphabet, nombres en breton',
    description: "Fiches d'écriture script et attaché sur lignes Seyès, affiches de l'alphabet A4 et A3, nombres en lettres en français et en breton. PDF gratuits pour la maternelle, le CP et le CE1.",
    canonique: `${SITE_URL}telechargements/`, contenu: index,
  }))

  const urls = ['', 'telechargements/', ...liste.map(t => `telechargements/${t.slug}/`)]
  writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${SITE_URL}${u}</loc></url>`).join('\n')}
</urlset>
`)
  writeFileSync(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}sitemap.xml\n`)
  console.log(`${liste.length} fiches, sitemap : ${urls.length} URL`)
}

main().catch(e => { console.error(e); process.exit(1) })
