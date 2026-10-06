// Adresses de la langue régionale, pures (lisibles par node) : le chemin d'une langue vient du registre de langues
// (son nom dans la langue elle-même : « brezhoneg » → /brezhoneg), jamais écrit en dur.
import { LANGUES } from '../langues/registre.ts'
import type { Langue } from '../langues/registre.ts'

/** Nom d'une langue en chemin d'adresse : minuscules, sans accents ni espaces. */
const enChemin = (nom: string): string => nom.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/** Chemin de la page d'une langue régionale (« /brezhoneg »). */
export const cheminRegional = (code: Langue): string => `/${enChemin(LANGUES[code].nomLocal)}`
