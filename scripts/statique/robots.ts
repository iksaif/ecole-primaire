// `robots.txt` : tout est ouvert, sauf les pages sans intérêt pour un moteur (réglages) ; l'adresse du sitemap.
import type { ContexteStatique } from './types.ts'

/** Chemins interdits (ceux que `estIndexable` refuse et qui existent en production ; tests/statique.test.mjs le vérifie). */
const INTERDITS = ['/parametres']

export const robots = (ctx: ContexteStatique): string =>
  `User-agent: *\nAllow: /\n${INTERDITS.map(c => `Disallow: ${ctx.base}${c.slice(1)}\n`).join('')}Sitemap: ${ctx.site.url}sitemap.xml\n`
