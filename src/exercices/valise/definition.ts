// La valise — définition : QUI peut faire quoi (modèle : ../exemple/definition.ts, qui commente chaque mécanisme).
// Programme (src/data/programme.ts) : composer et décomposer les petits nombres (PS : jusqu'à 3, voire 4 ; MS : 6 ; GS : 10) et résoudre de petits
// problèmes avec du matériel (la valise : « deux peluches et encore une », BO n° 41 p. 66 ; Eduscol, « éléments de progressivité », juin 2023). Quatre sortes
// de problèmes, d'après les variables d'Eduscol : l'état final après un ajout ou un retrait (PS, 3 ans : ≤ 3), la transformation (« il en faut 6, il y en a
// 4 : combien en mettre ? », MS), l'état initial (« j'en ai enlevé 2, il en reste 3 : combien au début ? », GS). Chaque problème est une bande en
// trois images (avant, action, après) dont l'état cherché est dans une valise fermée : on ne recompte jamais ce qu'on voit.
// Les valeurs du réglage `reponse` (« ecrire », « entourer ») sont aussi celles des réglages mémorisés des visiteurs : elles ne changent pas.
import { definir, choix, cases, herite, NB_LIBRE } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'

export default definir({
  id: 'valise',
  route: '/maternelle/valise',
  domaine: D.nombresCalcul,
  emoji: 'chiffres',
  niveauDefaut: 'ms',
  competences: [K.problemesMaternelle, K.composerDecomposer],

  reglages: { nbQ: choix([5, 10], { defaut: 10, libre: NB_LIBRE }) },

  // ajoute : l'état final après un ajout ; retire : après un retrait ; complete : la transformation (combien en mettre) ; initial : l'état initial
  niveaux: {
    ps: { reglages: { nbQ: choix([5, 10], { defaut: 5, libre: NB_LIBRE }), types: cases(['ajoute', 'retire']), reponse: choix(['entourer']) } },
    // MS : on entoure par défaut (les chiffres s'écrivent surtout en GS)
    ms: { reglages: { types: cases(['ajoute', 'retire', 'complete']), reponse: choix(['entourer', 'ecrire'], { defaut: 'entourer' }) } },
    gs: herite('ms', { reglages: { types: cases(['ajoute', 'retire', 'complete', 'initial']), reponse: choix(['ecrire', 'entourer'], { defaut: 'ecrire' }) } }),
  },

  // une fiche par classe, les sortes de problèmes de la classe (la PS : peu de fiches, manipuler d'abord)
  fiches: [
    { id: 'valise', competence: K.problemesMaternelle, niveau: 'ms', classes: ['ms', 'gs'], reglages: {} },
  ],
})
