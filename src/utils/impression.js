import { ref } from 'vue'
import { echapper } from './html.js'
import { fournirPolices } from './page.ts'

// Outils communs aux documents imprimables (fiches, affiches).
// Les polices sont embarquées dans le build : tout fonctionne hors ligne.
import attacheUrl from '@fontsource/playwrite-fr-trad/files/playwrite-fr-trad-latin-400-normal.woff2?url'
import scriptUrl from '@fontsource/andika/files/andika-latin-400-normal.woff2?url'
import scriptGrasUrl from '@fontsource/andika/files/andika-latin-700-normal.woff2?url'
import lucioleUrl from '../assets/fonts/luciole/Luciole-Regular.woff2?url'
import lucioleGrasUrl from '../assets/fonts/luciole/Luciole-Bold.woff2?url'
import dysUrl from '@fontsource/opendyslexic/files/opendyslexic-latin-400-normal.woff2?url'
import dysGrasUrl from '@fontsource/opendyslexic/files/opendyslexic-latin-700-normal.woff2?url'

// Écriture « script » : a et g à un seul œil, comme les lettres apprises en classe
export const POLICE_SCRIPT = 'Andika'
// Écriture cursive (attachée) incluse
export const POLICE_ATTACHE = 'Playwrite FR Trad'

// Polices scolaires courantes que l'on peut avoir installées sur l'ordinateur. Leur licence
// (usage personnel / en classe) ne permet pas de les rediffuser avec le site :
// on les détecte si elles sont installées, ou on peut les ajouter depuis un fichier.
export const POLICES_CONNUES = {
  attache: [
    'BelleAllure CM', 'BelleAllure CE', 'BelleAllure GS', 'BelleAllure MS',
    'Belle Allure CM', 'Belle Allure CE', 'Belle Allure GS',
    'Ecolier', 'Ecolier_court', 'Ecolier CP', 'Cursif', 'Cursive standard',
  ],
  script: ['Script Ecole 2', 'Belle Allure Script'],
}
// Polices livrées avec le site (licences libres : OFL ou CC BY)
const FICHIERS_INCLUS = {
  [POLICE_ATTACHE]: { 400: attacheUrl },
  [POLICE_SCRIPT]: { 400: scriptUrl, 700: scriptGrasUrl },
  Luciole: { 400: lucioleUrl, 700: lucioleGrasUrl },
  OpenDyslexic: { 400: dysUrl, 700: dysGrasUrl },
}
export const POLICES_INCLUSES = {
  attache: [{ id: POLICE_ATTACHE, label: 'Playwrite FR Trad — cursive scolaire française' }],
  script: [
    { id: POLICE_SCRIPT, label: 'Andika — conçue pour apprendre à lire (a et g simples)' },
    { id: 'Luciole', label: 'Luciole — très lisible, conçue pour les enfants malvoyants' },
    { id: 'OpenDyslexic', label: 'OpenDyslexic — pour les lecteurs dyslexiques' },
  ],
}
export const LIENS_POLICES = [
  { nom: 'Belle Allure', url: 'https://www.jeanboyault.fr/belle-allure/', note: 'cursive très utilisée en classe, plusieurs variantes (GS, CP, CE…)' },
  { nom: 'Écolier', url: 'https://www.dafont.com/fr/jean-marie-douteau.d75', note: 'cursive classique, version « court » pour petites boucles' },
  { nom: 'Cursif', url: 'https://www.dafont.com/fr/theme.php?cat=602', note: 'et d\'autres polices scolaires (catégorie Script › Scolaire)' },
]

// Polices ajoutées depuis un fichier : gardées dans le navigateur (localStorage)
const CLE_PERSO = 'ep_polices_perso'
// Le nom finit dans du CSS (@font-face) : on ne garde que des caractères sûrs
const nomSur = s => String(s).replace(/[^\p{L}\p{N} _.()-]/gu, '').trim()
function lirePerso() {
  try {
    const l = JSON.parse(localStorage.getItem(CLE_PERSO)) ?? []
    return l.filter(p => p && typeof p.dataUrl === 'string' && p.dataUrl.startsWith('data:'))
      .map(p => ({ ...p, id: nomSur(p.id), label: nomSur(p.label) }))
  } catch { return [] }
}
export const policesPerso = ref(lirePerso())

function enregistrerFontFace(p) {
  try {
    const ff = new FontFace(p.id, `url(${p.dataUrl})`)
    document.fonts.add(ff)
    return ff.load()
  } catch { return Promise.resolve() }
}

// Ajoute une police (.ttf / .otf / .woff / .woff2) ; renvoie son nom
export async function ajouterPolicePerso(fichier, type) {
  if (fichier.size > 3 * 1024 * 1024) throw new Error('Fichier trop gros (3 Mo maximum)')
  const dataUrl = await new Promise((ok, ko) => {
    const r = new FileReader()
    r.onload = () => ok(r.result)
    r.onerror = () => ko(r.error)
    r.readAsDataURL(fichier)
  })
  const base = nomSur(fichier.name.replace(/\.(ttf|otf|woff2?)$/i, '')) || 'Police'
  const p = { id: `${base} (fichier)`, label: base, type, dataUrl }
  await enregistrerFontFace(p)
  policesPerso.value = [...policesPerso.value.filter(x => x.id !== p.id), p]
  try { localStorage.setItem(CLE_PERSO, JSON.stringify(policesPerso.value)) }
  catch { throw new Error("Police chargée pour cette session, mais impossible de la mémoriser (stockage du navigateur plein)") }
  return p.id
}

export function supprimerPolicePerso(id) {
  policesPerso.value = policesPerso.value.filter(x => x.id !== id)
  try { localStorage.setItem(CLE_PERSO, JSON.stringify(policesPerso.value)) } catch {}
}

const abs = url => new URL(url, window.location.href).href

// Polices incluses (les polices ajoutées depuis un fichier sont gérées à part)
export function cssPolices() {
  return Object.entries(FICHIERS_INCLUS).flatMap(([famille, graisses]) =>
    Object.entries(graisses).map(([g, url]) =>
      `@font-face { font-family: '${famille}'; font-weight: ${g}; src: url(${abs(url)}) format('woff2'); }`)).join('\n')
}

// Charge les polices dans le document principal (nécessaire pour mesurer les textes)
let policesChargees = null
export function chargerPolices() {
  if (!policesChargees) {
    const style = document.createElement('style')
    style.textContent = cssPolices()
    document.head.appendChild(style)
    policesChargees = Promise.all([
      ...policesPerso.value.map(enregistrerFontFace),
      ...Object.keys(FICHIERS_INCLUS).flatMap(f => [
        document.fonts.load(`20px '${f}'`, 'aàâçéèêëîïôœùûü'),
        document.fonts.load(`bold 20px '${f}'`, 'a'),
      ]),
    ]).catch(() => {})
  }
  return policesChargees
}

// ── Mesures de texte (en unités de la taille de police : 1 = 1 em) ──
let ctx = null
function contexte() {
  ctx ??= document.createElement('canvas').getContext('2d')
  return ctx
}

export function largeurTexte(texte, police, gras = false) {
  const c = contexte()
  c.font = `${gras ? 'bold ' : ''}100px '${police}', sans-serif`
  return c.measureText(texte).width / 100
}

// Proportions d'une police : hauteur d'x, de majuscule, de hampe, de jambage (en em)
const cacheMetriques = {}
export function metriquesPolice(police) {
  if (cacheMetriques[police]) return cacheMetriques[police]
  const c = contexte()
  c.font = `100px '${police}', sans-serif`
  const h = ch => c.measureText(ch).actualBoundingBoxAscent / 100
  const m = {
    x: h('x'),
    majuscule: h('H'),
    hampe: h('l'),
    jambage: c.measureText('p').actualBoundingBoxDescent / 100,
  }
  return (cacheMetriques[police] = m)
}

// Une police locale est-elle installée ? (sa largeur diffère de la police de repli)
export function policeInstallee(police) {
  if (FICHIERS_INCLUS[police]) return true
  if (policesPerso.value.some(p => p.id === police)) return true
  const c = contexte()
  const test = 'abcdefghijklmnopqrstuvwxyz ABCDEF'
  return ['monospace', 'serif'].some(repli => {
    c.font = `40px ${repli}`
    const w0 = c.measureText(test).width
    c.font = `40px '${police}', ${repli}`
    return c.measureText(test).width !== w0
  })
}

export { echapper }
// Imprime un document HTML via une iframe cachée (pas de pop-up à autoriser)
export function imprimerDocument(html) {
  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;'
  document.body.appendChild(iframe)
  const doc = iframe.contentDocument
  doc.open(); doc.write(html); doc.close()
  // Firefox / Safari rendent la main avant la fin de l'impression : on attend « afterprint »
  const retirer = () => iframe.remove()
  const lancer = async () => {
    try { await doc.fonts.ready } catch {}
    iframe.contentWindow.addEventListener('afterprint', () => setTimeout(retirer, 500), { once: true })
    setTimeout(retirer, 60000)
    iframe.contentWindow.focus()
    iframe.contentWindow.print()
  }
  if (doc.readyState === 'complete') lancer()
  else iframe.onload = lancer
}

// Document complet et dimensions des pages : src/utils/page.ts (pur, lisible par node) ; les @font-face viennent d'ici
export { FORMATS, dimensionsPage, documentImpression } from './page.ts'
fournirPolices(contenu => `${cssPolices()}${policesPerso.value.filter(p => contenu.includes(p.id)).map(p => `
@font-face { font-family: '${p.id}'; src: url(${p.dataUrl}); }`).join('')}`)
