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
  sansRessource: {
    message: 'Danvez ebet c’hoazh evit ar vareghezh-mañ : labourat a reomp warnañ.', // br: à relire
    aide: 'Ur goulenn, un ide evit ar vareghezh-mañ ? Skrivit deomp :', // br: à relire
    sujet: 'Danvez evit ar vareghezh « {competence} »', // br: à relire
    suite: 'Da c’hortoz, ar skrid ofisiel a zo a-us, ha barregezhioù an domani a-is a ziskouez an re o deus dija danvez.', // br: à relire
  },
  position: {
    rang: 'Barregezh {n} diwar {total} · {domaine} · {classe}', // br: à relire
    nav: 'Barregezh a-raok hag a-benn', // br: à relire
    precedente: 'A-raok', // br: à relire
    suivante: 'War-lerc’h', // br: à relire
  },
  domaineClasse: {
    titre: 'An domani a-bezh e {classe}', // br: à relire
    nombre: { one: '{n} barregezh', other: '{n} barregezh' }, // br: à relire
    bientot: 'a-benn nebeut', // br: à relire
    ici: 'amañ emaoc’h', // br: à relire
    toutes: 'Gwelout an domani er programm', // br: à relire
  },
  autresClasses: {
    titre: 'Er c’hlasoù all', // br: à relire
    avant: 'A-raok, e {classe}', // br: à relire
    apres: 'War-lerc’h, e {classe}', // br: à relire
    aucune: 'An domani-mañ ne gas netra a-raok pe war-lerc’h ar c’hlas-mañ.', // br: à relire
    toutes: 'An domani a-bezh e {classe}', // br: à relire
  },
  memeTexte: {
    titre: 'En hevelep skrid ofisiel', // br: à relire
    aide: 'Ar pezh a zo a-raok hag a-benn en « {texte} », hervez urzh pajennoù ar PDF.', // br: à relire
    page: 'War an hevelep pajenn eus ar PDF (p. {page})', // br: à relire
    precedente: 'A-raok er skrid', // br: à relire
    suivante: 'War-lerc’h er skrid', // br: à relire
    parcourir: 'Lenn ar skrid a-bezh, pajenn ha pajenn', // br: à relire
  },
  parcours: {
    titre: 'Lenn ar programm ofisiel', // br: à relire
    chapeau: 'Ar skridoù ofisiel a implij al lec’hienn, pajenn ha pajenn eus ar PDF : e pep pajenn ez eus ar barregezhioù a zo diazezet warni, hag ul liamm d’ar PDF.', // br: à relire
    sommaire: 'Skridoù', // br: à relire
    ouvrirPdf: 'Digeriñ ar PDF', // br: à relire
    presentation: 'Pajenn gelaouiñ', // br: à relire
    pages: { one: '{n} pajenn meneget', other: '{n} pajenn meneget' }, // br: à relire
    retour: 'Gwelout ar programm hervez ar c’hlas', // br: à relire
  },
  versTextes: 'Ar programm ofisiel, skrid ha skrid', // br: à relire
} satisfies Traductions<typeof fr>
