// Icône d'un domaine du programme (src/images/icones.ts) : celle de ses ressources. Un `Record` complet : un domaine ajouté à programme.ts sans
// emoji ne compile pas. Pur.
import type { DomaineId } from '../data/programme.ts'
import type { TypeRessource } from './types.ts'
import type { NomIcone } from '../images/icones.ts'

export const EMOJI_DOMAINE: Readonly<Record<DomaineId, NomIcone>> = {
  'nombres-calcul': 'chiffres',
  'grandeurs-mesures': 'regle',
  'espace-geometrie': 'equerre',
  donnees: 'graphique',
  proportionnalite: 'balance',
  'pensee-informatique': 'ordinateur',
  motifs: 'losange',
  'temps-espace': 'boussole',
  lecture: 'livreOuvert',
  ecriture: 'crayon',
  oral: 'parole',
  vocabulaire: 'lettres',
  grammaire: 'puzzle',
  'culture-litteraire': 'livres',
  vivant: 'pousse',
  'corps-sante': 'coeur',
  matiere: 'eprouvette',
  'objets-techniques': 'engrenage',
  histoire: 'monument',
  geographie: 'carte',
  emc: 'poigneeDeMains',
  'regionale-oral': 'bulle',
  'regionale-mots': 'tableau',
  'regionale-sons': 'minuscules',
  'regionale-culture': 'notes',
  exemple: 'de',   // domaine fictif des exemples (développement) ; le dé, pas l'étoile (l'étoile est un retour : bonne réponse)
}

/** Icône d'un type de ressource (une notion de l'interface, <Icone>) : l'en-tête de ses résultats dans la recherche. */
export const ICONE_TYPE: Readonly<Record<TypeRessource, NomIcone>> = {
  exercice: 'exercice',
  affiche: 'affiche',
  fiche: 'fiches',
  competence: 'competence',
  page: 'page',
}
