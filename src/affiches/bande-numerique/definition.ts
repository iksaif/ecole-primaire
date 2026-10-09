// La bande numérique de la maternelle : les nombres dans l'ordre, une case chacun, avec ce qui les représente (des objets, des points, ou rien),
// en français, en breton, ou les deux sur la même feuille. Programme (src/data/programme.ts) : MS, de 1 à 6 (denombrer-6) ; GS, de 1 à 10 (denombrer-10,
// bande-numerique) et la comptine jusqu'à 30, que la GS récite : une bande de 1 à 30 sans représentation. Les nombres en lettres ne sont pas au programme du cycle 1.
// Dessin : dessin.ts (images OpenMoji : src/images/).
import { definirAffiche, choix } from '../definir.ts'
import { D, K } from '../../noyau/ids.ts'
import { CODES } from '../../langues/registre.ts'
import type { ReglagesDeAffiche } from '../types.ts'

// Hors programme au cycle 1 : proposé « (hors programme) », jamais par défaut, la raison en infobulle
const lettres = choix([false], { horsProgramme: [{ option: true, raison: 'Le programme du cycle 1 demande d’écrire les nombres en chiffres, pas en lettres.' }] })

const REPRESENTATION = choix(['objets', 'points', 'aucune'])
// la bande de la comptine (jusqu'à 30) n'a pas la place d'une représentation
const SANS_REPRESENTATION = choix(['aucune'])

const definition = definirAffiche({
  id: 'bande-numerique',
  domaine: D.nombresCalcul,
  emoji: '🔢',
  autresDomaines: [D.regionaleMots],
  langues: CODES,
  bilingue: true,
  orientations: ['landscape', 'portrait'],
  formats: ['A4', 'A3'],
  competences: [K.denombrer6, K.denombrer10, K.bandeNumerique, K.nombresJusqua10LangueRegionale],
  reglages: { objet: choix(['pomme', 'etoile', 'fleur', 'coccinelle']) },
  formulaire: {
    groupes: [{ id: 'representation', reglages: ['representation', 'objet'] }, { id: 'lettres', reglages: ['lettres', 'langues'] }],
    visibleSi: { objet: { reglage: 'representation', valeur: 'objets' } },
  },
  variantes: {
    ms: { classes: ['ms'], slug: 'affiche-bande-numerique-1-a-6', reglages: { debut: 1, max: 6, representation: REPRESENTATION, lettres } },
    gs: { classes: ['gs'], slug: 'affiche-bande-numerique-1-a-10', reglages: { debut: 1, max: 10, representation: REPRESENTATION, lettres } },
    'gs-comptine': { classes: ['gs'], slug: 'affiche-bande-numerique-1-a-30', reglages: { debut: 1, max: 30, representation: SANS_REPRESENTATION, lettres } },
  },
})

export default definition
export type Reglages = ReglagesDeAffiche<typeof definition>
