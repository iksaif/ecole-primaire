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
      server.middlewares.use(`${base}telechargements`, (req, res, next) => {
        let f = join(process.cwd(), 'dist/telechargements', decodeURIComponent(req.url.split('?')[0]))
        if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html')
        if (!existsSync(f)) return next()
        res.setHeader('Content-Type', TYPES[extname(f)] ?? 'application/octet-stream')
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
