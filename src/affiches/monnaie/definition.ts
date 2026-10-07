// L'affiche « Pièces et billets » (reportée de `main`, src/impression/affiches/monnaie.js) : les pièces et les billets de l'euro
// (dessin partagé avec l'exercice « La monnaie » : src/dessins/argent.ts), avec les échanges usuels ; et, pour jouer à la marchande,
// la PLANCHE à découper au massicot : les mêmes pièces et billets, à la taille réelle ou réduits (plus nombreux par page), en
// bandes alignées avec traits et repères de coupe (planche.ts).
// Programme (src/data/programme.ts) : CP, montants entiers d'euros ≤ 100 € ; CE1 et CE2, euros et centimes.
// Les slugs publiés (`affiche-monnaie-euros`, `affiche-monnaie-centimes`) sont ceux de `main` : une variante par fiche.
import { definirAffiche, choix, cases } from '../definir.ts'
import { D, K } from '../../noyau/ids.ts'
import { CODES } from '../../langues/registre.ts'
import type { ReglagesDeAffiche } from '../types.ts'
import { ECHELLES, EXEMPLAIRES, GENRES, LOTS } from './planche.ts'

// les réglages de la planche : tailles, genres, valeurs (celles de la planche, toutes cochées) et exemplaires
const optionsPlanche = (centimes: boolean) => ({
  taillePieces: choix(ECHELLES),
  tailleBillets: choix(ECHELLES),
  genres: choix(GENRES),
  valeurs: cases([...LOTS[centimes ? 'centimes' : 'euros'].pieces, ...LOTS[centimes ? 'centimes' : 'euros'].billets] as number[]),
  exemplaires: choix(EXEMPLAIRES),
})

const definition = definirAffiche({
  id: 'monnaie',
  domaine: D.grandeursMesures,
  emoji: '💶',
  // paysage par défaut ; une seule langue par feuille (une entrée de catalogue par langue)
  orientations: ['landscape', 'portrait'],
  langues: CODES,
  competences: [K.monnaieEuros, K.monnaieCentimes],
  // `centimes` : toutes les pièces (dès 1 centime) et le billet de 200 € ; `planche` : la feuille à découper, à la taille réelle.
  // Ce sont des réglages de la variante que lit le dessin, pas des choix de l'élève.
  variantes: {
    euros: { classes: ['cp'], reglages: { centimes: false, planche: false } },
    // les centimes sont la compétence de l'affiche ; les euros entiers, déjà vus au CP, n'y sont plus travaillés
    centimes: { classes: ['ce1', 'ce2'], sauf: [K.monnaieEuros], reglages: { centimes: true, planche: false } },
    // la planche : la taille des pièces et celle des billets au choix, séparément (100 % : la taille réelle ; plus petit : plus de pièces
    // ou de billets par page : des pièces petites et des billets à taille réelle, par exemple)
    // + pièces et/ou billets, quelles valeurs, combien d'exemplaires de chacune (0 : une rangée pleine)
    'planche-euros': { classes: ['cp'], reglages: { centimes: false, planche: true, ...optionsPlanche(false) } },
    'planche-centimes': { classes: ['ce1', 'ce2'], sauf: [K.monnaieEuros], reglages: { centimes: true, planche: true, ...optionsPlanche(true) } },
  },
})

export default definition
/** Les réglages que lit le dessin : ceux de la variante (centimes, planche) et ceux de la feuille. */
export type Reglages = ReglagesDeAffiche<typeof definition>
