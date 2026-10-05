import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { existsSync, statSync, createReadStream } from 'node:fs'
import { join, extname } from 'node:path'

const TYPES = { '.html': 'text/html; charset=utf-8', '.pdf': 'application/pdf', '.jpg': 'image/jpeg', '.xml': 'application/xml', '.json': 'application/json' }

// En dev, sert les fiches PDF déjà générées (dist/telechargements, voir scripts/telechargements.mjs)
function telechargementsEnDev(base) {
  return {
    name: 'telechargements-en-dev',
    configureServer(server) {
      server.middlewares.use(`${base}telechargements`, (req, res) => {
        let f = join(process.cwd(), 'dist/telechargements', decodeURIComponent(req.url.split('?')[0]))
        if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html')
        if (!existsSync(f)) {
          // pas de page générée : message clair plutôt que l'app (qui tournerait à la mauvaise adresse)
          res.statusCode = 404
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          return res.end(`<!DOCTYPE html><meta charset="utf-8"><title>Fiches non générées</title>
<body style="font-family:system-ui;max-width:640px;margin:3rem auto;line-height:1.5">
<h1>📥 Pages de téléchargement pas encore générées</h1>
<p><code>${req.url}</code> n'existe pas dans <code>dist/telechargements/</code>.</p>
<p>Lance <code>npm run build</code> (≈ 3 min : génère les PDF et les pages) puis recharge.
Si un build est en cours, attends sa fin.</p><p><a href="${base}">← Retour à l'app</a></p>`)
        }
        res.setHeader('Content-Type', TYPES[extname(f)] ?? 'application/octet-stream')
        // toujours la dernière version générée (pas de page périmée en cache)
        res.setHeader('Cache-Control', 'no-cache')
        createReadStream(f).pipe(res)
      })
    },
  }
}

// Base et site selon le mode : défaut = GitHub Pages ; --mode ecoleprimaire / skoolik = VPS (voir .env*)
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const base = env.VITE_BASE || '/ecole-primaire/'
  return {
    plugins: [vue(), telechargementsEnDev(base)],
    base,
  }
})
