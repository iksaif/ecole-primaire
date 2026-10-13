// Le repérage — textes de CONTENU : les questions, les retours et ce que la fiche écrit. Lus par T (générateur, fiche) ; la vue passe par
// `traducteur(CONTENU, …)`. Les textes de l'INTERFACE (réglages, boutons) sont dans src/langues/<langue>/textes/reperage.ts.
// Les mots des instructions sont ceux du BO : « avancer d'une case », « pivoter d'un quart de tour à droite / à gauche » (c2maths p. 33).
import { catalogue } from '../../langues/catalogue.ts'

export const CONTENU = catalogue({
  titre: 'Le repérage',

  // ─── Questions ───
  suivreQ: 'Le robot suit le programme. Sur quelle case arrive-t-il ?',
  coderQ: 'Écris le programme qui mène le robot jusqu’à l’étoile.',
  instruction: {
    avancer: 'avancer d’une case',
    avancerDe: 'avancer de plusieurs cases',
    droite: 'pivoter d’un quart de tour à droite',
    gauche: 'pivoter d’un quart de tour à gauche',
  },

  // ─── Retours ───
  suivreFaux: 'Le robot arrive sur la case verte : suis le programme une instruction après l’autre, avec ton doigt.',
  coderFaux: 'Le robot n’arrive pas sur l’étoile. Un programme qui marche (le chemin vert) :',
  coderSorti: 'Le robot sort du quadrillage ! Un programme qui marche (le chemin vert) :',
  coderBloque: 'Le robot se cogne contre un rocher ! Un programme qui marche (le chemin vert) :',
  tourneLaTete: 'Astuce : mets-toi à la place du robot (tourne la tête, ou la tablette) pour trouver sa droite et sa gauche.',
  tourneTaFeuille: 'Astuce : tourne ta feuille pour regarder dans le même sens que le robot.',

  // ─── Fiche ───
  legende: 'Les instructions',
  legendeAvancerDe: 'Un nombre à côté de la flèche : avancer de ce nombre de cases.',
  ficheSuivre: 'Suivre un programme',
  ficheSuivreConsigne: 'Trace le chemin du robot et colorie la case où il arrive.',
  ficheCoder: 'Écrire un programme',
  ficheCoderConsigne: 'Dessine les flèches du programme qui mène le robot jusqu’à l’étoile, sans passer sur les rochers.',
  ficheCoderConsigneSansRochers: 'Dessine les flèches du programme qui mène le robot jusqu’à l’étoile.',
  corrigeCoder: 'un programme possible (il y en a d’autres)',
  ficheDecouper: 'Découpe les flèches et colle-les dans les cases du programme (ou dessine-les).',
  ficheDecouperCE1: 'Découpe les flèches et colle-les dans les cases du programme (le nombre : de combien de cases le robot avance).',
}, {
  br: {
    titre: 'En em lec’hiañ', // br: à relire
    suivreQ: 'Heuliañ a ra ar robot ar programm. War peseurt karrezenn ec’h erru ?', // br: à relire
    coderQ: 'Skriv ar programm a gas ar robot betek ar steredenn.', // br: à relire
    instruction: { // br: à relire
      avancer: 'mont war-raok ur garrezenn',
      avancerDe: 'mont war-raok meur a garrezenn',
      droite: 'treiñ ur c’hard tro a-zehou',
      gauche: 'treiñ ur c’hard tro a-gleiz',
    },
    suivreFaux: 'Erruout a ra ar robot war ar garrezenn c’hlas : heul ar programm ur gourc’hemenn goude egile, gant da viz.', // br: à relire
    coderFaux: 'Ne erru ket ar robot war ar steredenn. Ur programm a dro mat (an hent glas) :', // br: à relire
    coderSorti: 'Mont a ra ar robot er-maez eus ar c’harrezennoù ! Ur programm a dro mat (an hent glas) :', // br: à relire
    coderBloque: 'Stokañ a ra ar robot ouzh ur roc’h ! Ur programm a dro mat (an hent glas) :', // br: à relire
    tourneLaTete: 'Tun : en em lak e plas ar robot (tro da benn, pe an dablezenn) evit kavout e zehou hag e gleiz.', // br: à relire
    tourneTaFeuille: 'Tun : tro da follenn evit sellet en hevelep tu hag ar robot.', // br: à relire
    legende: 'Ar gourc’hemennoù', // br: à relire
    legendeAvancerDe: 'Un niver e-kichen ar bir : mont war-raok kement a garrezennoù.', // br: à relire
    ficheSuivre: 'Heuliañ ur programm', // br: à relire
    ficheSuivreConsigne: 'Tres hent ar robot ha liv ar garrezenn ma erru.', // br: à relire
    ficheCoder: 'Skrivañ ur programm', // br: à relire
    ficheCoderConsigne: 'Tres biroù ar programm a gas ar robot betek ar steredenn, hep tremen war ar reier.', // br: à relire
    ficheCoderConsigneSansRochers: 'Tres biroù ar programm a gas ar robot betek ar steredenn.', // br: à relire
    corrigeCoder: 'ur programm posupl (bez ez eus re all)', // br: à relire
    ficheDecouper: 'Troc’h ar biroù ha peg anezho e karrezennoù ar programm (pe tres anezho).', // br: à relire
    ficheDecouperCE1: 'Troc’h ar biroù ha peg anezho e karrezennoù ar programm (an niver : a bet karrezenn ez a ar robot war-raok).', // br: à relire
  },
})
