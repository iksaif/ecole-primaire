// Les ceintures — activité de FICHES (pas de partie à l'écran) : livret, ceintures à découper, diplôme, passeport, d'une piste fournie ou libre
// (plans/15-ceintures.md §3). Les couleurs, le dessin et le noir et blanc viennent des réglages communs des ceintures (src/ceintures/reglages.ts :
// page des réglages et « Sur la fiche »). Sans hasard : la même configuration donne la même fiche (le brevet papier, qui tire ses questions, est l'activité `ceintures-brevet`).
// Programme : ce n'est pas une compétence des programmes ; l'activité s'appuie sur l'EMC (même matière que ses pistes de comportement et la piste libre) :
// les règles de l'école (CP à CE2), les émotions et le respect (CP, CE1, CM1), la participation aux décisions (CE2 à CM2). Pas de GS : l'EMC commence au cycle 2
// (à reprendre quand les pistes dépendront d'un exercice : tables, lettres… voir plans/15-ceintures.md §11).
import { definir, choix } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'
import { CHOIX_PISTE } from '../../ceintures/pistes.ts'
import { COPIES, NUMEROS, OBJECTIFS_LIBRES, SUPPORTS } from './donnees.ts'

export default definir({
  id: 'ceintures',
  route: '/monde/ceintures',
  domaine: D.emc,
  emoji: 'trophee',
  jeu: false,
  extensions: ['ceintures'],
  aleatoire: false,
  bilanParClasse: false,
  corrige: false,
  competences: [K.reglesVieEcole, K.emotionsRespect, K.democratieVote],
  niveauDefaut: 'ce1',
  reglages: {
    support: choix(SUPPORTS),
    piste: choix(CHOIX_PISTE, { defaut: 'tables' }),
    intitule: '' as string,
    objectifs: OBJECTIFS_LIBRES as string,
    copies: choix(COPIES, { defaut: 2 }),
    ceinture: choix(NUMEROS, { defaut: 1 }),
    prenom: '' as string,
  },
  niveaux: {
    cp: {},
    ce1: {},
    ce2: {},
    cm1: {},
    cm2: {},
  },
  fiches: [],
})
