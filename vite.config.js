import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { site } from './src/sites.ts'

// Identité du site dans index.html (titre, description, adresse, couleur) : vient de src/sites.ts, choisi par VITE_SITE
// (.env.<mode>) ; l'adresse publique peut être surchargée par VITE_SITE_URL (GitHub Pages)
function identiteDuSite(env) {
  const s = site(env.VITE_SITE)
  const valeurs = { TITRE: s.titre, NOM: s.nom, DESCRIPTION: s.description, URL: env.VITE_SITE_URL || s.url, COULEUR: s.couleur }
  const echapper = v => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
  return {
    name: 'identite-du-site',
    transformIndexHtml: html => html.replace(/%SITE_(TITRE|NOM|DESCRIPTION|URL|COULEUR)%/g, (_, k) => echapper(valeurs[k])),
  }
}

// site.webmanifest (installation sur l'écran d'accueil) : fait partie de l'identité du site, pas de la génération des
// fiches. Écrit au build ; servi tel quel par le serveur de dev (sinon il retomberait sur index.html).
function manifesteDuSite(env, base) {
  const s = site(env.VITE_SITE)
  const manifeste = JSON.stringify({
    name: s.nom, short_name: s.nom, lang: s.langueInterface, start_url: base, display: 'standalone',
    background_color: '#f8f9fa', theme_color: s.couleur,
    icons: [
      { src: `${base}icone-192.png`, sizes: '192x192', type: 'image/png' },
      { src: `${base}icone-512.png`, sizes: '512x512', type: 'image/png' },
      { src: `${base}favicon.svg`, sizes: 'any', type: 'image/svg+xml' },
    ],
  }, null, 2)
  return {
    name: 'manifeste-du-site',
    generateBundle() { this.emitFile({ type: 'asset', fileName: 'site.webmanifest', source: manifeste }) },
    configureServer(serveur) {
      serveur.middlewares.use(`${base}site.webmanifest`, (_, res) => { res.setHeader('Content-Type', 'application/manifest+json'); res.end(manifeste) })
    },
  }
}

// Base et site selon le mode : défaut = GitHub Pages ; --mode ecoleprimaire / skoolik = VPS (voir .env*)
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const base = env.VITE_BASE || '/ecole-primaire/'
  return {
    plugins: [vue(), identiteDuSite(env), manifesteDuSite(env, base)],
    base,
  }
})
