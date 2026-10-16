// La valise — définition : QUI peut faire quoi (modèle : ../exemple/definition.ts, qui commente chaque mécanisme).
// Programme (src/data/programme.ts) : composer et décomposer les petits nombres (PS : jusqu'à 3, voire 4 ; MS : 6 ; GS : 10) et résoudre de petits
// problèmes avec du matériel (la valise : « deux peluches et encore une », BO n° 41 p. 66). Trois sortes de questions : on ajoute, on enlève,
// « il en faut n, combien en ajouter ? » (composer). PS : on ajoute seulement, tout est visible, et on entoure une quantité en points ; MS-GS : ce
// qui est déjà dans la valise est caché (on n'en voit que le nombre, en points), comme dans le BO : on raisonne sur le tout, on ne recompte pas.
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

  niveaux: {
    ps: { reglages: { nbQ: choix([5, 10], { defaut: 5, libre: NB_LIBRE }), types: cases(['ajoute']), reponse: choix(['entourer']) } },
    // MS : on entoure par défaut (les chiffres s'écrivent surtout en GS)
    ms: { reglages: { types: cases(['ajoute', 'retire', 'complete']), reponse: choix(['entourer', 'ecrire'], { defaut: 'entourer' }) } },
    gs: herite('ms', { reglages: { reponse: choix(['ecrire', 'entourer'], { defaut: 'ecrire' }) } }),
  },

  // une fiche par classe, les trois sortes de problèmes (la PS : peu de fiches, manipuler d'abord)
  fiches: [
    { id: 'valise', competence: K.problemesMaternelle, niveau: 'ms', classes: ['ms', 'gs'], reglages: {} },
  ],
})
