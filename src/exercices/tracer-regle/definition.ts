// Tracer à la règle — définition : QUI peut faire quoi. Un des exercices de géométrie, le seul où l'on trace (les autres : figures, solides,
// symétrie, repérage). Programme (src/data/programme.ts) et exemples de réussite du BO (c2maths) :
//   alignes     CP, CE1 (alignements) : « dire si trois points sont alignés ou non en utilisant la règle dans les cas où la réponse n'est pas
//               perceptible de façon évidente » ; « tracer une droite passant par deux points » (p. 32) ; « repérer et tracer des points
//               alignés », « dire que des points ne sont pas alignés sans utiliser la règle quand il n'y a aucun doute » (p. 34)
//   completer   CP, CE1 (tracer-figures) : « compléter un rectangle dont deux côtés consécutifs sont déjà tracés, et compléter un carré dont
//               un côté est déjà tracé » (p. 32) ; au CE1, « les côtés peuvent suivre les lignes du quadrillage ou être obliques » (p. 34)
//   reproduire  CP, CE1, CE2 (tracer-figures) : reproduire un carré, un rectangle, un triangle ou un assemblage sur papier pointé (CP, CE1) ;
//               « reproduire sur papier quadrillé des figures usuelles […] avec la règle, en utilisant le quadrillage » (CE2, p. 36), le losange
//   construire  CE1, CE2 (tracer-figures) : CE1, « sur du papier quadrillé, pointé ou uni, l'élève sait compléter ou tracer un carré, un
//               rectangle, un triangle ou un triangle rectangle avec une règle (graduée ou non) et une équerre », le code de l'angle droit (p. 34) ;
//               CE2, des mesures données (« un rectangle de longueur 7 cm et de largeur 3 cm ») et le codage des longueurs égales (p. 36) ;
//               à l'écran sur papier pointé (CE1) ou quadrillé (CE2), sur la fiche sur papier uni, à la règle graduée et à l'équerre
// À l'écran, on touche des points ; sur la fiche, on trace à la règle. Les fiches « reproduction » gardent les adresses de l'ancien exercice
// « géométrie » (le contenu change : on trace des côtés au lieu de colorier des cases).
import { definir, cases, choix, NB_LIBRE } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'

export default definir({
  id: 'tracer-regle',
  route: '/maths/tracer-regle',
  domaine: D.espaceGeometrie,
  emoji: 'regle',
  niveauDefaut: 'ce1',
  competences: [K.alignements, K.tracerFigures],
  bilanParClasse: false,

  reglages: { nbQ: choix([4, 8, 12], { defaut: 8, libre: NB_LIBRE }) },

  niveaux: {
    cp: { reglages: { exercices: cases(['alignes', 'completer', 'reproduire']) } },
    ce1: { reglages: { exercices: cases(['alignes', 'completer', 'reproduire', 'construire']) } },
    ce2: { reglages: { exercices: cases(['reproduire', 'construire']) } },
  },

  fiches: [
    { id: 'alignes', competence: K.alignements, niveau: 'cp', reglages: { exercices: ['alignes'] } },
    { id: 'completer', competence: K.tracerFigures, niveau: 'cp', reglages: { exercices: ['completer'] } },
    { id: 'reproduire', competence: K.tracerFigures, niveau: 'cp', reglages: { exercices: ['reproduire'] } },
    { id: 'alignes', competence: K.alignements, niveau: 'ce1', reglages: { exercices: ['alignes'] } },
    { id: 'completer', competence: K.tracerFigures, niveau: 'ce1', reglages: { exercices: ['completer'] } },
    { id: 'reproduction', slug: 'exercices-geometrie-ce1-reproduction', competence: K.tracerFigures, niveau: 'ce1', reglages: { exercices: ['reproduire'] } },
    { id: 'reproduction', slug: 'exercices-geometrie-ce2-reproduction', competence: K.tracerFigures, niveau: 'ce2', reglages: { exercices: ['reproduire'] } },
    { id: 'construire', competence: K.tracerFigures, niveau: 'ce1', reglages: { exercices: ['construire'] } },
    { id: 'construire', competence: K.tracerFigures, niveau: 'ce2', reglages: { exercices: ['construire'] } },
  ],
})
