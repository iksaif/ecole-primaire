// Plus long, plus court — définition : QUI peut faire quoi (modèle : ../exemple/definition.ts, qui commente chaque mécanisme).
// Programme (src/data/programme.ts), « comparer-longueurs-maternelle » (BO n° 41 p. 69-70) : PS longueurs très différentes
// (rapport ≥ 2), ranger 3 objets ; MS écarts plus petits, 4 objets ; GS écarts fins, 5 objets. Les crayons partent tous du même bord.
import { definir, choix } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'

export default definir({
  id: 'longueurs',
  route: '/maternelle/longueurs',
  domaine: D.grandeursMesures,
  emoji: '📏',
  niveauDefaut: 'ms',
  competences: [K.comparerLongueursMaternelle],

  // mode : 'comparer' (le plus long / le plus court de deux crayons) ou 'ranger' (du plus court au plus long) ; nbQ : fixe, non proposé
  reglages: { mode: choix(['comparer', 'ranger']), nbQ: 6 },

  niveaux: { ps: {}, ms: {}, gs: {} },

  // aucune fiche par compétence : le bilan d'une classe (réglages par défaut) est la seule fiche publiée
  fiches: [],
})
