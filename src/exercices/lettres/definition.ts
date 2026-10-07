// Les lettres — définition : QUI peut faire quoi (modèle : ../exemple/definition.ts, qui commente chaque mécanisme).
// Programme (src/data/programme.ts, « nom-lettres », BO n° 41 p. 52) : « À partir de 5 ans : connaître le nom des lettres de l'alphabet
// (capitale, scripte, cursive) » : toutes les lettres, associer capitale et scripte, à la GS ; au CP, la compétence continue (reconnaître et
// nommer les lettres). L'exercice n'existe pas en PS (lettres du prénom, capitales) ni en MS (lettres du prénom).
// Manquent (audit, docs/TODO.md) : la cursive, le son des lettres (GS-CP), les confusions b/d, p/q.
// Les valeurs de `mode` et de `groupe` sont aussi celles des réglages mémorisés des visiteurs : elles ne changent pas.
//   mode « reconnaitre » : la voix dit le nom d'une lettre, l'enfant la montre (sans voix : la lettre est montrée dans l'autre écriture) ;
//   « majuscule » : associer une lettre à la même lettre dans une autre écriture (l'id date du seul couple majuscule / minuscule).
// Écritures (BO n° 41 p. 52 : « capitale, scripte, cursive » ; la majuscule cursive est au CE1) : GS, capitale → script par défaut,
// puis script → cursive ; CP, script → cursive par défaut (la lecture en script, l'écriture en cursive), capitale → script en rappel.
// Revue du 2026-10-07 (plans/critique-lettres-2026-10-07.md) : « Reconnaître » montrait « R » à retrouver parmi des capitales.
import { definir, choix } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'

export default definir({
  id: 'lettres',
  route: '/maternelle/lettres',
  domaine: D.lecture,
  emoji: '🔡',
  niveauDefaut: 'gs',
  // dans la langue régionale, l'alphabet de cette langue (T('alphabet'), textes.ts)
  autresDomaines: [D.regionaleSons],
  competences: [K.nomLettres, K.alphabetLangueRegionale],

  reglages: {
    mode: choix(['reconnaitre', 'majuscule'], { defaut: 'reconnaitre' }),
    groupe: choix(['voyelles', 'consonnes', 'toutes'], { defaut: 'toutes' }),
  },

  // GS : 10 questions ; CP : 15
  niveaux: {
    gs: { reglages: { ecritures: choix(['capitale-script', 'script-cursive'], { defaut: 'capitale-script' }), nbQ: choix([10, 15], { defaut: 10 }) } },
    cp: { reglages: { ecritures: choix(['script-cursive', 'capitale-script'], { defaut: 'script-cursive' }), nbQ: choix([10, 15], { defaut: 15 }) } },
  },

  // le bilan est la seule fiche publiée (relier majuscules et minuscules) ; son adresse date d'avant les niveaux : celle du niveau par défaut
  fiches: [{ id: 'gs-cp', slug: 'exercices-lettres-gs-cp', competence: K.nomLettres, niveau: 'gs', reglages: {} }],
})
