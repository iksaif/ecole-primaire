// Compter les objets — définition : QUI peut faire quoi (modèle : ../exemple/definition.ts, qui commente chaque mécanisme).
// Programme (src/data/programme.ts), repris dans les compétences de chaque niveau :
//   PS : collection jusqu'à 3 (« voire 4 » : pas systématique), réponse en constellation de points, jamais de chiffre à écrire ;
//   MS : jusqu'à 6 ; GS : jusqu'à 10 (« voire au-delà »). Sur la fiche, l'enfant écrit le nombre ou entoure le bon.
// Les valeurs du réglage `reponse` (« ecrire », « entourer ») sont aussi celles des réglages mémorisés des visiteurs : elles ne changent pas.
import { definir, choix, NB_LIBRE } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'

export default definir({
  id: 'compter',
  route: '/maternelle/compter',
  domaine: D.nombresCalcul,
  emoji: '🔢',
  niveauDefaut: 'ms',
  competences: [K.denombrer3, K.denombrer6, K.denombrer10],

  reglages: { nbQ: choix([5, 10], { defaut: 10, libre: NB_LIBRE }) },

  // reponse (fiche) : « ecrire » le nombre dans une case, ou « entourer » le bon nombre
  niveaux: {
    // PS : 5 questions (enfants de 3 ans) ; on entoure toujours la bonne constellation
    ps: { reglages: { nbQ: choix([5, 10], { defaut: 5, libre: NB_LIBRE }), reponse: choix(['entourer']) } },
    ms: { reglages: { reponse: choix(['ecrire', 'entourer'], { defaut: 'ecrire' }) } },
    gs: { reglages: { reponse: choix(['ecrire', 'entourer'], { defaut: 'ecrire' }) } },
  },

  // aucune fiche par compétence : le bilan d'une classe (réglages par défaut) est la seule fiche publiée
  fiches: [],
})
