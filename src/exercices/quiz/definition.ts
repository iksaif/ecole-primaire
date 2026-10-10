// Quiz de culture générale (« Le Monde ») : des questions à choix sur un thème. Les questions sont dans la langue du contenu ; une
// question non traduite n'existe qu'en français (questions/br.ts).
//
// Programme : chaque thème est proposé dans les classes où le programme travaille ses notions (src/data/programme.ts) :
//   animaux     CP → CE2   observer les êtres vivants, chaînes alimentaires, déplacements, reproduction
//   sciences    CE1 → CM2  l'eau et ses états, l'électricité, besoins des plantes, le corps (cœur, os, digestion), la lumière
//   geo-france  CE2, CM2   la France sur une carte (villes, fleuves, massifs), les régions (pas au programme du CM1)
//   geo-monde   CM1, CM2   continents et océans, modes de vie dans le monde, pays de l'Union européenne
//   histoire    CM1, CM2   les grandes périodes de l'histoire, la frise chronologique
import { definir, choix, NB_LIBRE } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'

export default definir({
  id: 'quiz',
  route: '/monde/quiz',
  domaine: D.vivant,
  autresDomaines: [D.corpsSante, D.matiere, D.geographie, D.histoire],
  emoji: '🌍',
  competences: [
    K.observerEnvironnement, K.chainesAlimentaires, K.deplacementsAnimaux, K.croissanceReproduction,
    K.eauEtats, K.electricite, K.besoinsVivants, K.mouvementEffort, K.digestion, K.lumiereOmbres,
    K.franceCartes, K.regionsDepartements,
    K.planisphereContinents, K.modesDeVieMonde, K.unionEuropeenne,
    K.periodesHistoire, K.friseChronologique,
  ],
  reglages: {
    nb: choix([5, 10, 15], { defaut: 10, libre: NB_LIBRE }),
  },
  niveaux: {
    cp: { reglages: { theme: choix(['animaux']) } },
    ce1: { reglages: { theme: choix(['animaux', 'sciences']) } },
    ce2: { reglages: { theme: choix(['animaux', 'sciences', 'geo-france']) } },
    cm1: { reglages: { theme: choix(['sciences', 'geo-monde', 'histoire']) } },
    cm2: { reglages: { theme: choix(['sciences', 'geo-france', 'geo-monde', 'histoire']) } },
  },
})
