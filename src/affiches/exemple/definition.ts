// L'affiche d'exemple : la bande numérique (MS : 1 à 6, GS : 0 à 10), avec ou sans une page « à compléter ». Point de
// départ de toute affiche : on copie ce dossier (`npm run nouveau -- affiche <id> "<Titre>"`) et on change ce qui change.
// Format : src/affiches/README.md. Ce fichier est de la donnée, pas du code : formulaire, catalogue, dessin et tests la lisent.
// Elle montre : des variantes calculées, une page ou deux, des langues sur la même feuille, un réglage conditionnel et
// groupé, du hasard (la graine), la police unique. L'autre exemple (exemple-jours) montre une langue par feuille et la
// police par type.
import { definirAffiche, choix } from '../definir.ts'
import { D, K } from '../../noyau/ids.ts'
import { CODES } from '../../langues/registre.ts'
import type { ReglagesDeAffiche } from '../types.ts'

// Hors programme à toutes les classes de l'exemple : proposé « (hors programme) », jamais par défaut, la raison en infobulle
const lettres = choix([false], { horsProgramme: [{ option: true, raison: 'Le programme du cycle 1 demande d’écrire les nombres en chiffres, pas en lettres.' }] })

/** Les bandes : une classe et ses nombres. Les variantes en sont dérivées ci-dessous (bande × avec/sans page à compléter). */
export const BANDES = [
  { id: 'jusqua6', niveaux: ['ms'], debut: 1, max: 6 },
  { id: 'jusqua10', niveaux: ['gs'], debut: 0, max: 10 },
] as const

const definition = definirAffiche({
  id: 'exemple',
  // domaine et compétences fictifs, dev seulement (src/data/programme.ts) ; une vraie affiche : D.nombresCalcul, K.bandeNumerique…
  domaine: D.exemple,
  orientation: 'landscape',
  // langues de la feuille : toutes celles du registre ; `bilingue` : on peut en mettre plusieurs sur la même feuille
  // (le catalogue publie chaque langue seule, puis toutes ensemble)
  langues: CODES,
  bilingue: true,
  // le dessin a du hasard (les nombres à compléter) : réglage « graine » et bouton « Nouvelle »
  hasard: true,
  // route du formulaire « Personnaliser » ; une vraie affiche garde le défaut (/imprimer/affiches)
  route: '/dev/affiches',
  // toutes les compétences de l'affiche : chaque variante garde celles qui sont au programme de TOUTES ses classes
  // (ici exempleCompter, du CP, n'est dans aucune variante : on ne l'écrit pas variante par variante)
  competences: [K.exempleLire, K.exempleCompter],
  // réglage à choix, commun aux variantes
  reglages: { points: choix([false, true]) },
  // le formulaire : deux groupes (titre `groupe.<id>`) ; la graine n'est proposée que si la variante a la page à compléter
  // (un réglage invisible reprend son défaut)
  formulaire: {
    groupes: [{ id: 'repere', reglages: ['points', 'lettres', 'langues'] }, { id: 'completer', reglages: ['graine'] }],
    visibleSi: { graine: { reglage: 'completer', valeur: true } },
  },
  // variantes CALCULÉES : une fonction pure (bandes × avec/sans page à compléter). Elle est appelée une fois, ici ;
  // `max`, `debut`, `completer` sont des réglages sans choix, propres à la variante, que lit le dessin
  variantes: () => Object.fromEntries(BANDES.flatMap(b => [false, true].map(completer => [
    completer ? `${b.id}-completer` : b.id,
    { niveaux: b.niveaux, reglages: { max: b.max, debut: b.debut, completer, lettres } },
  ]))),
})

export default definition
/** Les réglages que lit le dessin : ceux de la définition (points, lettres, max, debut, completer) et ceux de la feuille. */
export type Reglages = ReglagesDeAffiche<typeof definition>
