// Textes de l'interface — page d'une compétence du programme (breton). Traduction automatique : voir routeur.ts.
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/competence.ts'

export default {
  titre: 'Barregezh ar programm', // br: à relire
  inconnue: { titre: 'Barregezh ket kavet', message: 'N’eus ket eus ar vareghezh-mañ e programm al lec’hienn.', retour: 'Gwelout ar programm' }, // br: à relire
  fil: 'Roudenn', // br: à relire
  accueil: 'Degemer',
  programme: 'Ar programm', // br: à relire
  domaine: 'Domani', // br: à relire
  voirMatiere: 'Gwelout pajenn an danvez', // br: à relire
  classes: 'Klasoù e-mesk', // br: à relire
  classeVue: 'Emaoc’h o welout ar vareghezh evit ar c’hlas {classe}.', // br: à relire
  officiel: { titre: 'Programm ofisiel', page: 'pajenn PDF {page}', ouvre: 'digeriñ ar PDF en un ivinell nevez', extrait: 'Berradenn' }, // br: à relire
  interpretation: 'Hor lenn eus ar programm', // br: à relire
  ressources: { titre: 'An holl zanvezioù liammet', nombre: { one: '{n} danvez', two: '{n} zanvez', few: '{n} danvez', many: '{n} danvez', other: '{n} danvez' } }, // br: à relire
  groupes: { exercices: 'Poelladennoù ha produerien fichennoù', affiches: 'Skeudennoù ha gerioù-kaer', fiches: 'Fichennoù prest' }, // br: à relire
  vide: 'Danvez ebet c’hoazh evit ar vareghezh-mañ.', // br: à relire
  voisines: { titre: 'Barregezhioù tost', precision: 'memes domani', aucune: 'Barregezh all ebet er domani-mañ.', toutes: 'Gwelet an domani a-bezh er programm' }, // br: à relire
} satisfies Traductions<typeof fr>
