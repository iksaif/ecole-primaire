// Les lettres — définition : QUI peut faire quoi (modèle : ../exemple/definition.ts, qui commente chaque mécanisme).
// Programme (src/data/programme.ts, « nom-lettres », BO n° 41 p. 52) : « À partir de 5 ans : connaître le nom des lettres de l'alphabet
// (capitale, scripte, cursive) » : toutes les lettres, associer capitale et scripte, à la GS ; au CP, la compétence continue (reconnaître et
// nommer les lettres). L'exercice n'existe pas en PS (lettres du prénom, capitales) ni en MS (lettres du prénom).
// Manquent (audit, docs/TODO.md) : la cursive, le son des lettres (GS-CP), les confusions b/d, p/q.
// Les valeurs de `mode` et de `groupe` sont aussi celles des réglages mémorisés des visiteurs : elles ne changent pas.
//   mode « reconnaitre » : retrouver la lettre montrée ; « majuscule » : associer majuscule et minuscule.
import { definir, choix } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'

export default definir({
  id: 'lettres',
  route: '/maternelle/lettres',
  domaine: D.lecture,
  emoji: '🔡',
  niveauDefaut: 'gs',
  competences: [K.nomLettres],

  reglages: {
    mode: choix(['reconnaitre', 'majuscule'], { defaut: 'reconnaitre' }),
    groupe: choix(['voyelles', 'consonnes', 'toutes'], { defaut: 'toutes' }),
  },

  niveaux: { gs: {}, cp: {} },

  // le bilan est la seule fiche publiée (relier majuscules et minuscules) ; son adresse date d'avant les niveaux : celle du niveau par défaut
  fiches: [{ id: 'gs-cp', slug: 'exercices-lettres-gs-cp', competence: K.nomLettres, niveau: 'gs', reglages: {} }],
})
