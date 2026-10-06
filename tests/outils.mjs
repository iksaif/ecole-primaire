// Outils communs aux tests : navigateur, URL du site testé, petites assertions.
import { chromium } from 'playwright-core'
import { existsSync } from 'node:fs'

// URL du site testé (servi par tests/lancer.mjs, ou TEST_URL=https://ecoleprimaire.app/ pour la production)
export const URL_SITE = (process.env.TEST_URL || 'http://localhost:4190/').replace(/\/?$/, '/')
export const app = route => `${URL_SITE}${route.replace(/^\//, '')}`
// Site AVEC les pages de développement (/dev/exemple, /dev/affiches : les exemples). `npm test` en construit un
// (VITE_AVEC_DEV=1, tests/lancer.mjs → TEST_URL_DEV) ; sur le serveur de dev (`npm run dev`), c'est le site lui-même.
export const URL_DEV = (process.env.TEST_URL_DEV || URL_SITE).replace(/\/?$/, '/')
export const appDev = route => `${URL_DEV}${route.replace(/^\//, '')}`

export function trouverChrome() {
  const c = [process.env.CHROME_PATH, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium'].filter(Boolean).find(p => existsSync(p))
  if (!c) throw new Error('Chrome introuvable : définir CHROME_PATH')
  return c
}
export const lancerNavigateur = () => chromium.launch({ executablePath: trouverChrome() })

// Contexte de navigateur avec langue d'interface et sans l'avis de traduction ; graine de hasard optionnelle
export async function contexte(navigateur, { langue = 'fr', regionale, graine, viewport = { width: 1100, height: 900 } } = {}) {
  const ctx = await navigateur.newContext({ viewport })
  await ctx.addInitScript(([l, r, g]) => {
    try {
      localStorage.setItem('ep_langue_interface', JSON.stringify(l))
      localStorage.setItem('ep_avis_traduction_vu', 'true')
      if (r !== undefined) localStorage.setItem('ep_langue_regionale', JSON.stringify(r))
    } catch {}
    if (g != null) {
      let s = g
      Math.random = () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
      window.__reset = () => { s = g }
    }
  }, [langue, regionale, graine])
  return ctx
}

// Collecte des erreurs JavaScript d'une page
export function surveiller(page) {
  const erreurs = []
  page.on('pageerror', e => erreurs.push(String(e).slice(0, 200)))
  return erreurs
}

let echecs = 0
export function verifier(condition, message) {
  if (condition) console.log(`  ✓ ${message}`)
  else { echecs++; console.log(`  ✗ ${message}`) }
}
export const nbEchecs = () => echecs

export const ROUTES = ['/', '/maths', '/francais', '/lecture', '/autres', '/imprimer', '/imprimer/ecriture', '/imprimer/alphabet',
  '/imprimer/nombres', '/imprimer/affiches', '/programme', '/langue-regionale', '/imprimer/calcul', '/maternelle', '/maternelle/compter', '/maternelle/comparer', '/maternelle/ordonner',
  '/maternelle/lettres', '/maternelle/formes', '/maternelle/motifs', '/maternelle/longueurs', '/maths/numeration', '/maths/calcul-mental', '/maths/calcul-pose', '/maths/tables',
  '/maths/fractions', '/maths/problemes', '/maths/heure', '/maths/monnaie', '/maths/mesures', '/maths/geometrie',
  '/francais/dictee', '/francais/orthographe', '/francais/grammaire', '/francais/conjugaison', '/francais/vocabulaire',
  '/about', '/parametres', '/mentions-legales']

export const EXERCICES = ['/maths/calcul-mental', '/maths/calcul-pose', '/maths/tables', '/maths/numeration', '/maths/problemes',
  '/maths/fractions', '/maths/heure', '/maths/monnaie', '/maths/mesures', '/maths/geometrie', '/francais/grammaire',
  '/francais/vocabulaire', '/francais/conjugaison', '/francais/dictee', '/francais/orthographe', '/lecture', '/autres',
  '/maternelle/compter', '/maternelle/comparer', '/maternelle/ordonner', '/maternelle/lettres', '/maternelle/formes', '/maternelle/motifs', '/maternelle/longueurs']
