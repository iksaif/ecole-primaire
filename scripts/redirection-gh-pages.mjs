// Génère le site GitHub Pages : uniquement une redirection vers https://ecoleprimaire.app,
// en conservant le chemin, la requête et le # (routes de l'app) :
//   https://iksaif.github.io/ecole-primaire/#/maths/heure  →  https://ecoleprimaire.app/#/maths/heure
//   https://iksaif.github.io/ecole-primaire/telechargements/x/  →  https://ecoleprimaire.app/telechargements/x/
// index.html sert la racine, 404.html tous les autres chemins (GitHub Pages le renvoie pour les pages absentes).
import { mkdirSync, writeFileSync } from 'node:fs'

const CIBLE = process.env.CIBLE || 'https://ecoleprimaire.app'
const BASE = '/ecole-primaire'
const SORTIE = process.argv[2] || 'dist-gh-pages'

const page = `<!DOCTYPE html>
<html lang="fr"><head>
<meta charset="UTF-8">
<title>École Primaire a déménagé → ecoleprimaire.app</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${CIBLE}/">
<meta http-equiv="refresh" content="0; url=${CIBLE}/">
<script>
  var p = location.pathname.replace(/^${BASE.replace(/\//g, '\\/')}/, '') || '/'
  location.replace('${CIBLE}' + p + location.search + location.hash)
</script>
<style>body{font-family:system-ui,sans-serif;text-align:center;padding:3rem 1rem;color:#2c3e50}a{color:#4a90e2;font-weight:700}</style>
</head><body>
<p>📚 Le site a déménagé : <a href="${CIBLE}/">${CIBLE.replace('https://', '')}</a></p>
</body></html>
`

mkdirSync(SORTIE, { recursive: true })
writeFileSync(`${SORTIE}/index.html`, page)
writeFileSync(`${SORTIE}/404.html`, page)
writeFileSync(`${SORTIE}/.nojekyll`, '')
console.log(`Redirection GitHub Pages → ${CIBLE} écrite dans ${SORTIE}/`)
