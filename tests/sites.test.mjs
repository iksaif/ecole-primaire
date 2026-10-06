// Sites (node, sans Chrome) : réglages par site et cohérence avec le registre de langues.
import { SITES, site, estSite } from '../src/sites.ts'
import { LANGUES, REGIONALES, estLangue } from '../src/langues/registre.ts'
import { verifier, nbEchecs } from './outils.mjs'

console.log('Sites')
verifier(Object.keys(SITES).join() === 'ecoleprimaire,skoolik', 'deux sites : ecoleprimaire, skoolik')
verifier(Object.entries(SITES).every(([id, s]) => s.id === id && s.nom && s.titre && s.description && s.url.endsWith('/') && s.contact && s.depot), 'identité complète, adresse terminée par /')
verifier(site('skoolik').id === 'skoolik' && site('autre').id === 'ecoleprimaire' && site().id === 'ecoleprimaire' && !estSite('toString'), 'site(id) : repli sur ecoleprimaire')

const E = SITES.ecoleprimaire, S = SITES.skoolik
console.log('ecoleprimaire')
verifier(E.langueInterface === 'fr', 'interface en français par défaut')
verifier(E.langueRegionale === '', 'aucune langue régionale active par défaut')
verifier(E.languesRegionales.includes('br'), 'langue régionale activable (breton)')
console.log('skoolik')
verifier(S.langueInterface === 'fr', 'interface en français par défaut (décision du 2026-10-06)')
verifier(S.languesInterface.includes('br') && S.languesInterface.includes('fr'), 'interface : breton ou français')
verifier(S.langueRegionale === 'br', 'breton actif par défaut')

console.log('Cohérence avec le registre')
for (const s of Object.values(SITES)) {
  verifier(s.languesInterface.every(estLangue) && s.languesInterface.includes(s.langueInterface), `${s.id} : langue d’interface par défaut proposée`)
  verifier(s.languesRegionales.every(l => REGIONALES.includes(l)), `${s.id} : langues régionales proposées = langues à données`)
  verifier(s.langueRegionale === '' || s.languesRegionales.includes(s.langueRegionale), `${s.id} : langue régionale par défaut proposée`)
  verifier(Object.values(LANGUES).length >= s.languesInterface.length, `${s.id} : langues connues du registre`)
}
process.exit(nbEchecs() ? 1 : 0)
