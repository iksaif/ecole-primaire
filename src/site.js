// Raccourci de l'ancien monde (scripts de build, ancien socle) : tout vient de src/sites.ts.
import { SITES as SITES_TS, site as siteTs, SITE as SITE_TS } from './sites.ts'

// ancien format : `langue` (interface par défaut) au lieu de `langueInterface`
const ancien = s => ({ ...s, langue: s.langueInterface })
export const SITES = Object.fromEntries(Object.entries(SITES_TS).map(([id, s]) => [id, ancien(s)]))
export const site = id => ancien(siteTs(id))
export const SITE = ancien(SITE_TS)
export const CONTACT = SITE_TS.contact
export const DEPOT = SITE_TS.depot
