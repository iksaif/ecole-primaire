// Assemblages de formes — définition : QUI peut faire quoi (modèle : ../exemple/definition.ts, qui commente chaque mécanisme).
// Programme : « reproduire un assemblage » (BO n° 41 p. 69) : PS jusqu'à 4 éléments, jusqu'à 8 formes planes à 5 ans. Une fiche
// seule (pas de jeu) : on découpe les formes, puis on les pose sur un modèle (PS) ou on reproduit un modèle (MS, GS).
// PS : peu de fiches (BO n° 19 : manipuler d'abord), mais du matériel à découper, comme ici.
import { definir, choix } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'

const NB_MODELES = { min: 1, max: 6 }

export default definir({
  id: 'assemblages',
  route: '/maternelle/assemblages',
  domaine: D.espaceGeometrie,
  emoji: 'puzzle',
  niveauDefaut: 'ms',
  jeu: false,
  competences: [K.assemblagesMaternelle],

  reglages: {},

  niveaux: {
    ps: { reglages: { nbFiche: choix([2, 3, 4], { defaut: 3, libre: NB_MODELES }) } },
    ms: { reglages: { nbFiche: choix([2, 3, 4, 6], { defaut: 4, libre: NB_MODELES }) } },
    gs: { reglages: { nbFiche: choix([2, 3, 4, 6], { defaut: 4, libre: NB_MODELES }) } },
  },

  // une fiche par classe : la PS pose les formes sur le modèle, la MS et la GS le reproduisent
  fiches: [
    { id: 'ps', competence: K.assemblagesMaternelle, niveau: 'ps', reglages: {} },
    { id: 'ms', competence: K.assemblagesMaternelle, niveau: 'ms', reglages: {} },
    { id: 'gs', competence: K.assemblagesMaternelle, niveau: 'gs', reglages: {} },
  ],
})
