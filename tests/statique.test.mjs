// Pages statiques (node, sans Chrome) : sur un site factice (index.html à la Vite, JSON d'entrées aux textes piégeux) et sur les
// exemples de public/fiches/ s'ils existent. Vérifie : une page par entrée, les slugs de l'index (aucun nouveau), les canonical
// absolus et uniques, le sitemap (exactement les pages du site), le JSON-LD, les fichiers référencés, l'échappement, les
// hreflang, l'absence d'exemple sans --avec-exemples. Le parcours dans Chrome : tests/statique-fumee.test.mjs.
import { mkdirSync, mkdtempSync, writeFileSync, existsSync, symlinkSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { lireContexte } from '../scripts/build/statique/lire.ts'
import { fichiersStatiques, pagesStatiques } from '../scripts/build/statique/ecrire.ts'
import { adressesApp, adressesStatiques } from '../scripts/build/statique/sitemap.ts'
import { racineDeSlug, siteDeReference } from '../scripts/build/statique/adresses.ts'
import { adresseCanonique, estIndexable } from '../src/router/canonique.ts'
import { SITES } from '../src/sites.ts'
import { verifier, nbEchecs } from './outils.mjs'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const MODELE = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <script>(function () { history.replaceState(null, '', '/' ) })()</script>
    <title>Titre générique</title>
    <meta name="description" content="Description générique" />
    <link rel="canonical" href="https://ecoleprimaire.app/" />
    <meta property="og:title" content="Générique" />
    <meta name="twitter:card" content="summary" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <script type="module" crossorigin src="/assets/index-AAA.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-BBB.css">
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
`
const t = (fr, br) => ({ fr, ...(br ? { br } : {}) })
const SOURCE = { texte: 'c2maths', page: 1, url: 'https://www.education.gouv.fr/x.pdf#page=1', extrait: 'x' }
const entree = (slug, extra = {}) => ({
  slug, titre: t(`Fiche ${slug}`), titreCourt: t(slug), description: t(`Description de ${slug}`), niveaux: ['cp'], domaine: 'nombres-calcul',
  genre: 'fiche', usage: 'sentrainer', langues: ['fr'], nbPages: 1, nbVariantes: 1, taillePdf: 4096, parent: null, personnaliser: null,
  exemple: false, recherche: slug, miniature: { chemin: `${slug}/miniature.jpg`, largeur: 300, hauteur: 424 },
  descriptionLongue: t(`Longue description de ${slug}`),
  competences: [{ id: 'numeration100', libelle: `Compétence de ${slug}`, niveaux: ['cp'], source: SOURCE }],
  variantes: [{ id: 'fiche-1', titre: null, graine: 1, pdfs: [{ chemin: `${slug}/fiche-1-a4.pdf`, format: 'A4', orientation: 'portrait', taille: 4096, nbPages: 1 }], pages: [{ chemin: `${slug}/fiche-1-p1.jpg`, largeur: 794, hauteur: 1123 }] }],
  reglages: {}, voisines: [], ...extra,
})
const PIEGE = 'Table <b>"x"</b> & \'y\' </script><script>alert(1)</script>'
const ENTREES = [
  entree('maths-cp', { titre: t(PIEGE, 'Taolenn <i>&</i>'), description: t('Descr <&> "guillemets"', 'Deskrivadur br'), langues: ['fr'], personnaliser: { route: '/maths/heure', requete: { mode: 'imprimer', niveau: 'cp' } }, voisines: ['maths-cp-br', 'maths-ce1', 'inconnue-exemple'] }),
  entree('maths-cp-br', { titre: t('Table br', 'Taolenn'), langues: ['br'] }),
  entree('maths-ce1', { niveaux: ['ce1'], genre: 'affiche', usage: 'apprendre' }),
  entree('maths-ce1-regle', { niveaux: ['ce1'], parent: 'maths-ce1' }),
  entree('bilingue', { langues: ['fr', 'br'], titre: t('Bilingue', 'Daouyezhek') }),
  entree('hors-programme', { domaine: null, competences: [] }),
  entree('affiche-exemple-x', { exemple: true, domaine: 'exemple' }),
]
const domaine = (id, matiere) => ({ id, nom: t(id, `${id} br`), matiere, rang: 1, programme: [{ classes: ['cp', 'ce1'], nom: 'Nombres et calcul', url: 'https://www.education.gouv.fr/d.pdf' }] })
const PROPRES_A_L_ENTREE = ['descriptionLongue', 'competences', 'variantes', 'reglages', 'voisines']
const indexDe = entrees => ({
  version: 1, genereLe: '2026-03-04T10:00:00.000Z', site: 'ecoleprimaire',
  filtres: { classes: ['cp', 'ce1'], langues: ['fr', 'br'], usages: ['apprendre', 'sentrainer'], domaines: [domaine('nombres-calcul', 'maths'), domaine('exemple', 'maths'), { ...domaine(null, 'maths'), programme: [] }] },
  entrees,
})
const ecrireSite = (dossier, entrees) => {
  mkdirSync(join(dossier, 'assets'), { recursive: true })
  mkdirSync(join(dossier, 'fiches'), { recursive: true })
  writeFileSync(join(dossier, 'index.html'), MODELE)
  const tout = indexDe(entrees.map(e => Object.fromEntries(Object.entries(e).filter(([k]) => !PROPRES_A_L_ENTREE.includes(k)))))
  writeFileSync(join(dossier, 'fiches', 'index.json'), JSON.stringify(tout))
  for (const e of entrees) {
    writeFileSync(join(dossier, 'fiches', `${e.slug}.json`), JSON.stringify(e))
    mkdirSync(join(dossier, 'fiches', e.slug), { recursive: true })
    for (const f of [e.miniature.chemin, ...e.variantes.flatMap(v => [...v.pdfs.map(p => p.chemin), ...v.pages.map(p => p.chemin)])]) writeFileSync(join(dossier, 'fiches', f), 'x')
  }
}

const dossier = mkdtempSync(join(tmpdir(), 'statique-'))
ecrireSite(dossier, ENTREES)
const decoder = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
const attr = (html, balise, discr, nom) => new RegExp(`<${balise}[^>]*${discr}[^>]*${nom}="([^"]*)"`).exec(html)?.[1]

console.log('Lecture')
const ctx = lireContexte({ mode: 'ecoleprimaire', outDir: dossier, avecExemples: false })
verifier(ctx.base === '/', 'la base est lue dans index.html (« / »)')
verifier(ctx.site.id === 'ecoleprimaire' && ctx.date === '2026-03-04', 'site du mode ; date de l’index (lastmod)')
verifier(!ctx.index.entrees.some(e => e.exemple) && !ctx.entrees.has('affiche-exemple-x'), 'sans --avec-exemples : aucune entrée d’exemple')
verifier(lireContexte({ mode: 'ecoleprimaire', outDir: dossier, avecExemples: true }).entrees.has('affiche-exemple-x'), 'avec --avec-exemples : l’exemple est lu')
{
  const r = spawnSync(process.execPath, ['scripts/build/statique/commande.ts', '--mode', 'production', '--outDir', dossier, '--avec-exemples'], { cwd: racine, encoding: 'utf8' })
  verifier(r.status !== 0 && /jamais dans un build de production/.test(r.stderr), 'la commande refuse --avec-exemples en production')
  const bon = spawnSync(process.execPath, ['scripts/build/statique/commande.ts', '--mode', 'ecoleprimaire', '--outDir', dossier], { cwd: racine, encoding: 'utf8' })
  verifier(bon.status === 0 && existsSync(join(dossier, 'telechargements', 'maths-cp', 'index.html')) && existsSync(join(dossier, 'sitemap.xml')) && existsSync(join(dossier, '404.html')), 'la commande écrit les pages, le sitemap et 404.html')
  verifier(!existsSync(join(dossier, 'telechargements', 'affiche-exemple-x')), 'aucune page d’exemple écrite sans --avec-exemples')
}

console.log('Pages')
const pages = pagesStatiques(ctx)
const slugsIndex = new Set(ctx.index.entrees.map(e => e.slug))
const fiches = pages.filter(p => p.adresse !== 'telechargements/')
verifier(fiches.length === ctx.index.entrees.length, `une page par entrée de l’index (${fiches.length})`)
verifier(fiches.every(p => slugsIndex.has(p.adresse.replace(/^telechargements\//, '').replace(/\/$/, ''))), 'chaque adresse est « telechargements/<slug>/ » d’un slug de l’index : aucun slug nouveau')
verifier(pages.some(p => p.adresse === 'telechargements/'), 'l’index /telechargements/ a sa page')
verifier(pages.every(p => /^https:\/\/[a-z.]+\/(?:[^?#\s]*)$/.test(p.canonique)), 'canonical absolus (https, sans requête)')
verifier(new Set(pages.map(p => p.canonique)).size === pages.length, 'canonical uniques')
verifier(pages.every(p => (p.html.match(/<link rel="canonical"/g) ?? []).length === 1 && (p.html.match(/<title>/g) ?? []).length === 1), 'un seul canonical et un seul titre par page (ceux du modèle retirés)')
verifier(pages.every(p => p.html.includes('<script type="module" crossorigin src="/assets/index-AAA.js">') && p.html.includes('<div id="app"><main')), 'le script d’entrée de l’app est gardé ; le contenu est dans #app')
verifier(pages.every(p => p.html.includes('data-statique')), '<html data-statique> : l’app sait qu’elle prend une page statique en charge')
const parSlug = s => pages.find(p => p.adresse === `telechargements/${s}/`)
verifier(parSlug('maths-cp').html.includes('<html lang="fr" data-statique>') && parSlug('maths-cp-br').html.includes('<html lang="br" data-statique>'), '<html lang> = langue de l’entrée')
verifier(parSlug('bilingue').html.includes('lang="fr"'), 'une fiche bilingue : langue d’interface du site')
verifier(parSlug('maths-cp-br').canonique.startsWith(SITES.skoolik.url) && parSlug('maths-cp').canonique.startsWith(SITES.ecoleprimaire.url), 'canonical sur le site de référence (breton : le site breton)')
verifier(siteDeReference(['fr']).id === 'ecoleprimaire' && siteDeReference(['fr', 'br']).id === 'skoolik' && racineDeSlug('a-b-br') === 'a-b' && racineDeSlug('a-b') === 'a-b', 'site de référence et racine de slug')

console.log('Cohérence avec l’entrée JSON')
{
  const e = ctx.entrees.get('maths-ce1')
  const p = parSlug('maths-ce1')
  verifier(p.titre === `${e.titre.fr} — ${ctx.site.nom}` && p.description === e.description.fr, 'titre et description de la page = ceux de l’entrée')
  verifier(decoder(attr(p.html, 'meta', 'name="description"', 'content')) === e.description.fr, '<meta description> = description de l’entrée')
  verifier(p.html.includes(`<h1>${e.titre.fr}</h1>`) && p.html.includes(e.competences[0].libelle) && p.html.includes('CP') === false && p.html.includes('CE1'), 'titre, classes et compétences dans le HTML, sans JavaScript')
  verifier(p.html.includes('og:image" content="https://ecoleprimaire.app/fiches/maths-ce1/miniature.jpg"'), 'image de partage = la miniature de la fiche (absolue)')
  verifier(p.html.includes('href="/fiches/maths-ce1/fiche-1-a4.pdf"') && p.html.includes('src="/fiches/maths-ce1/fiche-1-p1.jpg"'), 'lien PDF et aperçu')
  verifier(p.html.includes('<a href="/">') && p.html.includes('<a href="/telechargements/">') && p.html.includes('aria-current="page"'), 'fil d’Ariane')
}
{
  const p = parSlug('maths-cp')
  verifier(p.html.includes('href="/maths/heure?mode=imprimer&amp;niveau=cp"') && p.html.includes('href="/maths/heure?niveau=cp"'), '« Personnaliser » et « Faire en ligne » vers l’app')
  verifier(p.html.includes('href="/telechargements/maths-cp-br/"') && p.html.includes('href="/telechargements/maths-ce1/"') && !p.html.includes('inconnue-exemple'), 'fiches voisines (une voisine inconnue est ignorée)')
}

console.log('Échappement')
{
  const p = parSlug('maths-cp')
  verifier(!p.html.includes('<b>"x"</b>') && !p.html.includes('<script>alert(1)') && !/<\/script><script>/.test(p.html), 'aucune balise venue d’un titre n’arrive brute dans la page')
  verifier(p.html.includes('Table &lt;b&gt;&quot;x&quot;&lt;/b&gt; &amp; &#39;y&#39;'), 'titre échappé (< > & " \')')
  verifier(decoder(attr(p.html, 'meta', 'property="og:title"', 'content')) === PIEGE, 'attribut og:title échappé : relu à l’identique')
  verifier(p.html.includes('Descr &lt;&amp;&gt; &quot;guillemets&quot;'), 'description échappée')
  const ld = /<script type="application\/ld\+json">([^<]*)<\/script>/.exec(p.html)
  verifier(ld !== null && !ld[1].includes('<'), 'le JSON-LD ne contient aucun « < » (il ne peut pas refermer la balise)')
  verifier(JSON.parse(ld[1]).name === PIEGE, 'le JSON-LD relu garde le titre exact')
}

console.log('JSON-LD')
for (const p of fiches) {
  const e = ctx.entrees.get(p.adresse.replace(/^telechargements\//, '').replace(/\/$/, ''))
  const m = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(p.html)
  let ld = null
  try { ld = JSON.parse(m[1]) } catch {}
  const ok = ld && ld['@context'] === 'https://schema.org' && ld['@type'] === 'LearningResource' && ld.url === p.canonique && ld.image.endsWith(e.miniature.chemin)
    && ld.isAccessibleForFree === true && Array.isArray(ld.inLanguage) && ld.educationalLevel.length === e.niveaux.length
    && ld.educationalAlignment.length === e.competences.length + (e.domaine ? 1 : 0)
    && ld.educationalAlignment.filter(a => a.alignmentType === 'teaches').every((a, k) => a.targetName === e.competences[k].libelle && a.targetUrl === e.competences[k].source.url)
    && ld.encoding.length === e.variantes.reduce((n, v) => n + v.pdfs.length, 0) && ld.publisher.url === ctx.site.url
  verifier(Boolean(ok), `JSON-LD valide : ${e.slug}`)
}

console.log('hreflang')
{
  const alt = html => [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)].map(m => `${m[1]} ${m[2]}`)
  const a = alt(parSlug('maths-cp').html)
  verifier(a.includes('fr https://ecoleprimaire.app/telechargements/maths-cp/') && a.includes('br https://skoolik.app/telechargements/maths-cp-br/') && a.some(x => x.startsWith('x-default ')), 'une fiche et sa sœur bretonne se renvoient l’une à l’autre (+ x-default)')
  verifier(alt(parSlug('maths-ce1').html).length === 0, 'une fiche sans sœur : aucun hreflang')
}

console.log('Sitemap et fichiers')
const fichiersS = fichiersStatiques(ctx)
const sitemapXml = fichiersS.find(f => f.chemin === 'sitemap.xml').contenu
const locs = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])
verifier(new Set(locs).size === locs.length && locs.every(l => l.startsWith(ctx.site.url)), `sitemap : ${locs.length} adresses uniques, toutes sur ce site`)
{
  const aTelechargements = locs.filter(l => l.includes('/telechargements/')).sort()
  const attendues = pages.map(p => p.canonique).filter(c => c.startsWith(ctx.site.url)).sort()
  verifier(JSON.stringify(aTelechargements) === JSON.stringify(attendues), 'le sitemap liste exactement les pages dont ce site est la référence (ni plus, ni moins)')
  verifier(!locs.includes(`${ctx.site.url}telechargements/maths-cp-br/`) && locs.includes(`${ctx.site.url}telechargements/maths-cp/`), 'une fiche dont le canonical est l’autre site n’est pas dans ce sitemap')
  verifier(sitemapXml.includes('<lastmod>2026-03-04</lastmod>') && sitemapXml.includes('xhtml:link rel="alternate" hreflang="br"'), 'lastmod et hreflang')
  const app = adressesApp(ctx)
  verifier(app.includes('') && app.includes('maths') && app.includes('programme') && app.some(a => a.startsWith('competence/')) && !app.includes('parametres') && !app.some(a => a.startsWith('dev')), 'adresses de l’app : accueil, matières, programme, compétences ; ni réglages ni /dev')
  verifier(adressesStatiques(ctx)[0] === 'telechargements/', 'l’index des fiches est une page statique du sitemap')
  const skoolik = { ...ctx, site: SITES.skoolik }
  verifier(adressesApp(skoolik).includes('brezhoneg'), 'la page de la langue régionale vient du registre de langues (« brezhoneg »)')
}
{
  const robots = fichiersS.find(f => f.chemin === 'robots.txt').contenu
  verifier(robots.includes(`Sitemap: ${ctx.site.url}sitemap.xml`) && /Disallow: \/parametres/.test(robots) && !estIndexable('/parametres'), 'robots.txt : adresse du sitemap, réglages interdits')
  const nf = fichiersS.find(f => f.chemin === '404.html').contenu
  verifier(nf.includes('noindex') && nf.includes('action="/telechargements/"') && nf.includes('name="q"') && !nf.includes('/assets/index-AAA.js'), '404.html : noindex, recherche, sans l’app')
  const idx = pages.find(p => p.adresse === 'telechargements/').html
  verifier(idx.includes('href="/telechargements/maths-cp/"') && idx.includes('href="/telechargements/hors-programme/"') && !idx.includes('maths-ce1-regle') && !idx.includes('affiche-exemple-x'), 'index A→Z : chaque fiche (sauf les fiches par compétence et les exemples)')
  verifier(idx.indexOf('maths-ce1/') < idx.indexOf('maths-cp/'), 'index trié de A à Z (titres)')
}
{
  // aucune page ne référence un fichier absent
  const manquants = []
  for (const f of fichiersS.filter(f => f.chemin.endsWith('.html'))) {
    for (const [, url] of f.contenu.matchAll(/(?:src|href)="(\/[^"#?]*\.[a-z0-9]+)"/g)) {
      if (!existsSync(join(dossier, url)) && !/^\/(favicon|apple-touch|site\.webmanifest|assets\/)/.test(url)) manquants.push(`${f.chemin} → ${url}`)
    }
  }
  verifier(!manquants.length, `aucune page ne référence un fichier absent${manquants.length ? ` : ${manquants.slice(0, 3).join(' ; ')}` : ''}`)
}

console.log('Adresse canonique de l’app')
{
  const u = 'https://ecoleprimaire.app/'
  verifier(adresseCanonique('/', {}, u) === u && adresseCanonique('/maths/', {}, u) === `${u}maths` && adresseCanonique('/telechargements', {}, u) === `${u}telechargements/` && adresseCanonique('/telechargements/x', {}, u) === `${u}telechargements/x/`, 'adresses canoniques : barre finale seulement sous /telechargements (comme les pages statiques)')
  verifier(adresseCanonique('/parametres', {}, u) === null && adresseCanonique('/dev/exemple', {}, u) === null && adresseCanonique('/nimporte', { titre: 'routeur.titre.introuvable' }, u) === null, 'réglages, développement et page introuvable : pas de canonical (noindex)')
}

console.log('Exemples (public/fiches)')
if (existsSync(join(racine, 'public/fiches/index.json'))) {
  const d2 = mkdtempSync(join(tmpdir(), 'statique-ex-'))
  writeFileSync(join(d2, 'index.html'), MODELE)
  symlinkSync(join(racine, 'public/fiches'), join(d2, 'fiches'))
  const c2 = lireContexte({ mode: 'developpement', outDir: d2, avecExemples: true })
  const f2 = fichiersStatiques(c2)
  verifier(c2.index.entrees.length > 0 && f2.length === c2.index.entrees.length + 4, `${c2.index.entrees.length} exemples : une page chacun, plus l’index, sitemap, robots et 404`)
  const p2 = pagesStatiques(c2)
  verifier(p2.every(p => /<script type="application\/ld\+json">/.test(p.html) || p.adresse === 'telechargements/'), 'chaque page d’exemple a son JSON-LD')
  rmSync(d2, { recursive: true, force: true })
} else console.log('  (pas de public/fiches : exemples ignorés)')

rmSync(dossier, { recursive: true, force: true })
process.exit(nbEchecs() ? 1 : 0)
