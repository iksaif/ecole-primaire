// Problèmes — définition : QUI peut faire quoi (modèle : ../exemple/definition.ts, qui commente chaque mécanisme).
// Programme (src/data/programme.ts) : problemes-additifs (parties-tout ; comparaison au CE1), problemes-multiplicatifs (CE2 :
// « fois plus »), problemes-etapes (CE1 : deux étapes ; CE2 : deux ou trois étapes). Champ numérique : celui du niveau, jusqu'à
// 1 000 au CE1 et 10 000 au CE2 ; les produits restent dans les tables du niveau.
// `plage` : plus grand nombre des données (donnees.ts, PLAGES). Les identifiants des catégories et des plages sont aussi les valeurs
// des réglages mémorisés des visiteurs (clé « problemes_config ») : ils ne changent pas ; les libellés sont dans
// src/langues/<langue>/textes/problemes.ts.
import { definir, choix, cases, fichesPourClasses } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'
import { CATEGORIES_CE1, CATEGORIES_CE2 } from './donnees.ts'

export default definir({
  id: 'problemes',
  route: '/maths/problemes',
  domaine: D.nombresCalcul,
  emoji: '🧩',
  niveauDefaut: 'ce1',
  competences: [K.problemesAdditifs, K.problemesMultiplicatifs, K.problemesEtapes],

  reglages: { nbQ: choix([3, 5, 10, 15], { defaut: 5 }) },

  niveaux: {
    ce1: { reglages: { categories: cases(CATEGORIES_CE1), plage: choix(['petits', 'moyens', 'grands'], { defaut: 'moyens' }) } },
    ce2: { reglages: { categories: cases(CATEGORIES_CE2), plage: choix(['moyens', 'grands', 'tresGrands'], { defaut: 'moyens' }) } },
  },

  // fiches par compétence (le bilan d'une classe : réglages par défaut du niveau)
  fiches: [
    ...fichesPourClasses('ce1-ce2', { id: 'additifs', competence: K.problemesAdditifs, reglages: { categories: ['ajoutRetrait', 'comparaison', 'partiesTout'] } }),
    ...fichesPourClasses('ce1-ce2', { id: 'multiplicatifs', competence: K.problemesMultiplicatifs, reglages: { categories: ['multiplication', 'partage'] } }),
    ...fichesPourClasses('ce1-ce2', { id: 'etapes', competence: K.problemesEtapes, reglages: { categories: ['deuxEtapes'] } }),
  ],
})
