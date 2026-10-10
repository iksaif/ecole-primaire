// Lecture — trois activités : compter les syllabes d'un mot, le reconstituer avec ses syllabes mélangées, lire un texte à voix haute
// (avec la voix pour écouter un mot ou tout le texte). Exercice de français : contenu et fiche toujours en français.
//
// Programme : le décodage (syllabes, mots) est au programme du CP et du CE1 ; la lecture à voix haute du CP au CM2. Au CE2, compter et
// reconstituer des mots longs restent proposés, hors programme (consolider le découpage des mots longs).
import { definir, choix, NB_LIBRE } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'

const HORS_CE2 = 'Le décodage est au programme du CP et du CE1 ; au CE2, découper des mots longs consolide la lecture.'

export default definir({
  id: 'lecture',
  route: '/francais/lecture',
  domaine: D.lecture,
  emoji: '📖',
  contenu: 'fr',
  // la lecture à voix haute n'a rien à corriger
  corrige: reglages => reglages.mode !== 'texte',
  competences: [K.decodage, K.fluence],
  reglages: {
    nb: choix([5, 10, 15], { defaut: 10, libre: NB_LIBRE }),
  },
  niveaux: {
    cp: { reglages: { mode: choix(['syllabes', 'mots', 'texte']) } },
    ce1: { reglages: { mode: choix(['syllabes', 'mots', 'texte']) } },
    ce2: {
      reglages: {
        mode: choix(['texte'], { horsProgramme: [{ option: 'syllabes', raison: HORS_CE2 }, { option: 'mots', raison: HORS_CE2 }] }),
      },
    },
  },
})
