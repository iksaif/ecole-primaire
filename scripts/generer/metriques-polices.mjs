// Table des largeurs de caractères et des proportions des polices livrées (src/affiches/metriques.ts), mesurées dans Chrome.
// Elle sert à la mesure de texte estimée (src/affiches/mesure.ts) quand il n'y a pas de canvas (node : tests, build des fiches).
// À refaire quand une police livrée change ou qu'un caractère manque. Demande le serveur de dev (npm run dev) et Chrome :
//   node scripts/generer/metriques-polices.mjs [url]       (défaut : http://localhost:5173/ecole-primaire/)
// Écrit src/affiches/metriques.ts et affiche l'écart de l'estimation (sans crénage ni ligatures) sur quelques phrases.
import { chromium } from 'playwright-core'
import { writeFileSync } from 'node:fs'
import { trouverChrome } from '../../tests/outils.mjs'

const url = process.argv[2] ?? 'http://localhost:5173/ecole-primaire/'
const nav = await chromium.launch({ executablePath: trouverChrome() })
const page = await (await nav.newContext()).newPage()
await page.goto(url)
const base = new URL(url).pathname
const res = await page.evaluate(async chemin => {
  const m = await import(`${chemin}src/utils/impression.js`)
  await m.chargerPolices()
  const CAR = [...Array(95)].map((_, i) => String.fromCharCode(32 + i)).join('') + 'àâäçéèêëîïôöùûüÿœæÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŒÆñÑ«»’‘“”–—…°€·'
  const polices = ['Andika', 'Luciole', 'OpenDyslexic', 'Playwrite FR Trad']
  const arrondi = v => Math.round(v * 1000) / 1000
  const out = { CAR, largeurs: {}, proportions: {}, tests: [] }
  for (const p of polices) {
    for (const gras of [false, true]) out.largeurs[p + (gras ? ':700' : '')] = [...CAR].map(c => arrondi(m.largeurTexte(c, p, gras)))
    out.proportions[p] = Object.fromEntries(Object.entries(m.metriquesPolice(p)).map(([k, v]) => [k, arrondi(v)]))
  }
  const phrases = ['Les nombres en lettres : quarante-sept', 'Bonjour à tous les élèves de la classe', 'Deizioù ar sizhun : Disul, Dilun, Meurzh',
    'AVOCAT WATERLOO ToYo', 'Ñ ñ c’h ch zh', '0123456789 1 000 000']
  for (const p of polices) for (const gras of [false, true]) for (const t of phrases) out.tests.push([p + (gras ? ':700' : ''), t, m.largeurTexte(t, p, gras)])
  return out
}, base)
await nav.close()

const fichier = `// Généré par scripts/generer/metriques-polices.mjs (mesuré dans Chrome) : ne pas modifier à la main.
// Largeur de chaque caractère (en em) des polices livrées, en normal et en gras (« :700 »), et leurs proportions (hauteur
// d'x, de majuscule, de hampe, de jambage). Lues par mesure.ts, sans canvas, donc par node.
export const CARACTERES = ${JSON.stringify(res.CAR)}

export const LARGEURS: Readonly<Record<string, readonly number[]>> = {
${Object.entries(res.largeurs).map(([k, v]) => `  ${JSON.stringify(k)}: [${v.join(',')}],`).join('\n')}
}

export const PROPORTIONS: Readonly<Record<string, { x: number, majuscule: number, hampe: number, jambage: number }>> = ${JSON.stringify(res.proportions, null, 2).replace(/"(\w+)":/g, '$1:').replace(/"(Playwrite FR Trad)":/, "'$1':")}
`
writeFileSync(new URL('../../src/affiches/metriques.ts', import.meta.url), fichier)

// écart de l'estimation (somme des largeurs, sans crénage) avec la mesure du canvas
const ecarts = {}
for (const [police, texte, mesure] of res.tests) {
  const l = res.largeurs[police]
  const estime = [...texte].reduce((s, c) => s + (res.CAR.includes(c) ? l[res.CAR.indexOf(c)] : l.reduce((a, b) => a + b, 0) / l.length), 0)
  ecarts[police] = Math.max(ecarts[police] ?? 0, Math.abs(estime - mesure) / mesure * 100)
}
console.log('écart maximal de l’estimation sur les phrases d’essai (%) :', Object.fromEntries(Object.entries(ecarts).map(([k, v]) => [k, +v.toFixed(1)])))
