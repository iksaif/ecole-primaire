// Les jours de la semaine : une affiche pour le mur de la classe, en français, en breton, ou les deux sur la même feuille (classe
// bilingue). Programme (src/data/programme.ts) : nommer les jours en MS (jours-mois), la semaine au CP (calendrier-mesure-temps), et
// les jours dans la langue régionale (calendrier-langue-regionale). Deux variantes, l'écriture de la classe : en script en maternelle,
// en script et en attaché au CP.
import { definirAffiche, choix } from '../definir.ts'
import { D, K } from '../../noyau/ids.ts'
import { CODES } from '../../langues/registre.ts'
import type { ReglagesDeAffiche } from '../types.ts'

const definition = definirAffiche({
  id: 'jours',
  domaine: D.tempsEspace,
  emoji: '📅',
  autresDomaines: [D.histoire, D.regionaleMots],
  langues: CODES,
  bilingue: true,
  orientations: ['portrait', 'landscape'],
  formats: ['A4', 'A3'],
  police: { mode: 'parType', types: ['script', 'attache'], defauts: { script: 'Andika', attache: 'Playwrite FR Trad' } },
  // chaque variante garde celles qui sont au programme de toutes ses classes
  competences: [K.joursMois, K.calendrierMesureTemps, K.calendrierLangueRegionale],
  reglages: {
    attache: choix([false, true]),
  },
  formulaire: {
    visibleSi: { 'polices.attache': { reglage: 'attache', valeur: true } },
  },
  variantes: {
    maternelle: { classes: ['ms', 'gs'], slug: 'affiche-jours-de-la-semaine' },
    cp: { classes: ['cp'], slug: 'affiche-jours-de-la-semaine-attache', reglages: { attache: choix([true, false]) } },
  },
})

export default definition
export type Reglages = ReglagesDeAffiche<typeof definition>
