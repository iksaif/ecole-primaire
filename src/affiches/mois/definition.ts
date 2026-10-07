// Les mois de l'année et les saisons : une affiche pour le mur de la classe, en français, en breton, ou les deux sur la même feuille.
// Programme (src/data/programme.ts) : les mois et les saisons en GS (jours-mois), l'année et ses saisons au CP (calendrier-mesure-temps,
// jour-nuit-saisons), et dans la langue régionale (calendrier-langue-regionale). Deux variantes, l'écriture de la classe : en script en
// GS, en script et en attaché au CP. Les saisons sont à part, sous les mois : elles ne commencent pas avec un mois.
import { definirAffiche, choix } from '../definir.ts'
import { D, K } from '../../noyau/ids.ts'
import { CODES } from '../../langues/registre.ts'
import type { ReglagesDeAffiche } from '../types.ts'

const definition = definirAffiche({
  id: 'mois',
  domaine: D.tempsEspace,
  emoji: '🗓️',
  autresDomaines: [D.histoire, D.regionaleMots],
  langues: CODES,
  bilingue: true,
  orientations: ['portrait', 'landscape'],
  formats: ['A4', 'A3'],
  police: { mode: 'parType', types: ['script', 'attache'], defauts: { script: 'Andika', attache: 'Playwrite FR Trad' } },
  // chaque variante garde celles qui sont au programme de toutes ses classes
  competences: [K.joursMois, K.calendrierMesureTemps, K.jourNuitSaisons, K.calendrierLangueRegionale],
  reglages: {
    attache: choix([false, true]),
    saisons: choix([true, false]),
  },
  formulaire: {
    visibleSi: { 'polices.attache': { reglage: 'attache', valeur: true } },
  },
  variantes: {
    gs: { classes: ['gs'], slug: 'affiche-mois-de-l-annee' },
    cp: { classes: ['cp'], slug: 'affiche-mois-de-l-annee-attache', reglages: { attache: choix([true, false]) } },
  },
})

export default definition
export type Reglages = ReglagesDeAffiche<typeof definition>
