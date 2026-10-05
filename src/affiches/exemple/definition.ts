// L'affiche d'exemple : la bande numérique (MS : 1 à 6, GS : 0 à 10). Point de départ de toute affiche : on copie ce
// dossier (`npm run nouveau -- affiche <id> "<Titre>"`) et on change ce qui change. Format : src/affiches/README.md.
// Ce fichier est de la donnée, pas du code : le formulaire, le catalogue, le dessin et les tests la lisent.
import { definirAffiche, choix } from '../definir.ts'
import { D, K } from '../../noyau/ids.ts'
import type { ReglagesDeAffiche } from '../types.ts'

// Hors programme à toutes les classes de l'exemple : proposé « (hors programme) », jamais par défaut, la raison en infobulle
const lettres = choix([false], { horsProgramme: [{ option: true, raison: 'Le programme du cycle 1 demande d’écrire les nombres en chiffres, pas en lettres.' }] })

const definition = definirAffiche({
  id: 'exemple',
  // domaine et compétences fictifs, dev seulement (src/data/programme.ts) ; une vraie affiche : D.nombresCalcul, K.bandeNumerique…
  domaine: D.exemple,
  orientation: 'landscape',
  // une feuille par langue dans le catalogue ; le titre et les noms sont dans textes.ts (clés : voir textes.ts du dossier affiches)
  langues: ['fr', 'br'],
  // route du formulaire « Personnaliser » ; une vraie affiche garde le défaut (/imprimer/affiches)
  route: '/dev/affiches',
  // toutes les compétences de l'affiche : chaque variante garde celles qui sont au programme de TOUTES ses classes
  // (ici exempleCompter, du CP, n'est dans aucune variante : on ne l'écrit pas variante par variante)
  competences: [K.exempleLire, K.exempleCompter],
  // réglage à choix, commun aux variantes
  reglages: { points: choix([false, true]) },
  variantes: {
    // `max` et `debut` : réglages sans choix, propres à la variante, que lit le dessin
    jusqua6: { niveaux: ['ms'], reglages: { max: 6, debut: 1, lettres } },
    // `slug` : une affiche reportée garde son slug publié ; sinon `affiche-exemple-jusqua10`
    jusqua10: { niveaux: ['gs'], reglages: { max: 10, debut: 0, lettres }, slug: 'affiche-exemple-bande-de-0-a-10' },
  },
})

export default definition
/** Les réglages que lit le dessin : ceux de la définition (points, lettres, max, debut) et ceux de la feuille. */
export type Reglages = ReglagesDeAffiche<typeof definition>
