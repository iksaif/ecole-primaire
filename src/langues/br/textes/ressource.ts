// Textes de l'interface — cartes, lignes et groupes de ressources (breton). Traduction automatique : voir nav.ts.
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/ressource.ts'

export default {
  enLigne: 'enlinenn', // br: à relire
  imprimable: 'da voullañ', // br: à relire
  classes: 'Klasoù', // br: à relire
  classeChoisie: '(klas dibabet)', // br: à relire
  ouvrir: 'Digeriñ', // br: à relire
  imprimer: 'Moullañ', // br: à relire
  ouvrirTitre: 'Digeriñ : {titre}', // br: à relire
  imprimerTitre: 'Moullañ : {titre}', // br: à relire
  apprendre: 'Evit deskiñ', // br: à relire
  sentrainer: 'Evit en em zudiañ', // br: à relire
  rien: 'Netra er rummad-mañ evit an dibab-mañ.', // br: à relire
  ressources: { one: '{n} danvez', other: '{n} danvez' }, // br: à relire
  horsClasse: { one: 'Er-maez eus ar c\'hlas {classes} : {total}', other: 'Er-maez eus ar c\'hlasoù {classes} : {total}' }, // br: à relire
  genre: { exercice: 'poelladenn', generateur: 'krouer', affiche: 'kinnig', fiche: 'fichenn prest' }, // br: à relire
  vue: { titre: 'Diskouez', cartes: 'Kartennoù', liste: 'Roll' }, // br: à relire
  videAction: 'Gwelet ar programm', // br: à relire
} satisfies Traductions<typeof fr>
