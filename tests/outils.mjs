// Outils communs aux tests : navigateur, URL du site testé, petites assertions.
import { chromium } from 'playwright-core'
import { existsSync } from 'node:fs'
import { AsyncLocalStorage } from 'node:async_hooks'

// Niveau de test : rapide (défaut, `npm test`) ou complet (`npm run test:complet`, TEST_COMPLET=1 : voir tests/lancer.mjs)
export const complet = ['1', 'true'].includes(process.env.TEST_COMPLET ?? '')

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

// Contexte de navigateur avec langue d'interface, sans l'avis de traduction ni la visite guidée de la première visite
// (`assistant: true` pour la garder : tests/assistant.test.mjs) ; graine de hasard optionnelle
export async function contexte(navigateur, { langue = 'fr', regionale, graine, viewport = { width: 1100, height: 900 }, assistant = false } = {}) {
  const ctx = await navigateur.newContext({ viewport })
  await ctx.addInitScript(([l, r, g, a]) => {
    try {
      localStorage.setItem('ep_langue_interface', JSON.stringify(l))
      localStorage.setItem('ep_avis_traduction_vu', 'true')
      if (!a) localStorage.setItem('ep_assistant_vu', 'true')
      if (r !== undefined) localStorage.setItem('ep_langue_regionale', JSON.stringify(r))
    } catch {}
    if (g != null) {
      let s = g
      Math.random = () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
      window.__reset = () => { s = g }
    }
  }, [langue, regionale, graine, assistant])
  return ctx
}

// Collecte des erreurs JavaScript d'une page
/**
 * Le titre du document une fois qu'il correspond à `motif` (RegExp) : le titre se pose après le rendu de la page (et après un
 * changement de langue), pas en même temps que le premier élément visible ; le lire avant est un faux échec sous charge.
 */
export async function titreQui(page, motif, timeout = 10000) {
  await page.waitForFunction(([source, drapeaux]) => new RegExp(source, drapeaux).test(document.title), [motif.source, motif.flags], { timeout })
  return page.title()
}

export function surveiller(page) {
  const erreurs = []
  page.on('pageerror', e => erreurs.push(String(e).slice(0, 200)))
  return erreurs
}

// Sortie des vérifications : la console, ou le tampon du groupe en cours (`enTampon`) pour que des tâches menées EN PARALLÈLE
// n'entremêlent pas leurs lignes (chaque groupe est imprimé d'un bloc, dans l'ordre voulu).
const tampon = new AsyncLocalStorage()
export const ecrire = ligne => { const t = tampon.getStore(); if (t) t.push(ligne); else console.log(ligne) }
/** Exécute `f` en capturant ce que `verifier` et `ecrire` écrivent ; rend les lignes (à imprimer d'un bloc par l'appelant). */
export async function enTampon(f) {
  const lignes = []
  await tampon.run(lignes, f)
  return lignes
}

let echecs = 0
export function verifier(condition, message) {
  if (condition) ecrire(`  ✓ ${message}`)
  else { echecs++; ecrire(`  ✗ ${message}`) }
}
export const nbEchecs = () => echecs

export const ROUTES = ['/', '/maths', '/francais', '/lecture', '/autres', '/imprimer', '/imprimer/ecriture', '/imprimer/alphabet',
  '/imprimer/nombres', '/imprimer/affiches', '/programme', '/langue-regionale', '/imprimer/calcul', '/maternelle', '/maternelle/compter', '/maternelle/comparer', '/maternelle/ordonner',
  '/maternelle/lettres', '/maternelle/formes', '/maternelle/motifs', '/maternelle/longueurs', '/maths/numeration', '/maths/suites', '/maths/calcul-mental', '/maths/calcul-pose', '/maths/tables',
  '/maths/fractions', '/maths/problemes', '/maths/heure', '/maths/monnaie', '/maths/mesures', '/maths/geometrie',
  '/francais/dictee', '/francais/orthographe', '/francais/grammaire', '/francais/conjugaison', '/francais/vocabulaire',
  '/about', '/parametres', '/mentions-legales']

export const EXERCICES = ['/maths/calcul-mental', '/maths/calcul-pose', '/maths/tables', '/maths/numeration', '/maths/suites', '/maths/problemes',
  '/maths/fractions', '/maths/heure', '/maths/monnaie', '/maths/mesures', '/maths/geometrie', '/francais/grammaire',
  '/francais/vocabulaire', '/francais/conjugaison', '/francais/dictee', '/francais/orthographe', '/lecture', '/autres',
  '/maternelle/compter', '/maternelle/comparer', '/maternelle/ordonner', '/maternelle/lettres', '/maternelle/formes', '/maternelle/motifs', '/maternelle/longueurs']
