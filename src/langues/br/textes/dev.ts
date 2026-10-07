// Textes de l'interface — pages de développement (breton). Traduction automatique : les passages marqués « br: à relire »
// sont à faire vérifier par un brittophone. Pages visibles seulement avec `npm run dev`.
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/dev.ts'

export default {
  titre: 'Diorren', // br: à relire
  intro: 'N’emañ ar bajenn-mañ hag he skouerioù nemet gant <code>npm run dev</code> : na chom netra anezho er build.', // br: à relire
  exemples: 'Skouerioù evit kregiñ', // br: à relire
  documentation: 'Teuliadur', // br: à relire
  exerciceSimpleTitre: 'Skouer ur boelladenn simpl', // br: à relire
  exerciceSimpleDescription: 'un heuliad niveroù da glokaat : livioù, bonus, er-maez ar programm, fichenn dre barregezh, c’hoari ha fichenn da voullañ ; etrefas e yezh ar skramm, danvez ar fichenn troet ivez', // br: à relire
  exerciceCorpusTitre: 'Skouer ur boelladenn gant korpus', // br: à relire
  exerciceCorpusDescription: 'ar gerioù kenster : poelladenn c’hallek (danvez e galleg atav, katalog e galleg hepken), korpus e src/data/, QCM, testennoù an etrefas troet a-ziforc’h', // br: à relire
  afficheTitre: 'Skouer ur skritell', // br: à relire
  afficheDescription: 'ar vandenn niveroù : stummoù MS ha GS, dibaboù, furmskrid hollek, moullañ A4 / A3', // br: à relire
  docExercice: 'krouiñ ur boelladenn (npm run nouveau -- exercice <id> "<Titre>" --modele simple|corpus, pe eilañ ur skouer)', // br: à relire
  docAffiche: 'krouiñ ur skritell (npm run nouveau -- affiche <id> "<Titre>", pe eilañ exemple/)', // br: à relire
  afficheDevTitre: 'Skouer skritell (dev)', // br: à relire
  afficheDevIntro: 'Gwelit src/affiches/README.md. N’eus ket eus ar bajenn-mañ er produiñ.', // br: à relire
  composantsTitre: 'Elfennoù ar c’hreiz', // br: à relire
  composantsDescription: 'fichenn hepken, mizerez, reiñ un urzh dre glikañ, c’hemenn lavaret : elfennoù diret ar c’hreiz, unan dre unan', // br: à relire
  composantsIntro: 'Gwelit src/noyau/ : un tamm doare-implij zo e penn pep restr. Ar bajenn-mañ a servij ivez da vlanket evit an taolioù haeladusted.', // br: à relire
  composantsFicheSeule: 'Kadre « fichenn hepken »', // br: à relire
  composantsFicheSeuleAide: 'fiche-seule, aleatoire false, police false : n’eus na diell, na « Fichenn nevez », na dibab nodrezh.', // br: à relire
  composantsFicheTexte: 'Ur fichenn ne cheñch morse', // br: à relire
  composantsChrono: 'Mizerez', // br: à relire
  composantsDemarrer: 'Kregiñ gant 10 eilenn', // br: à relire
  composantsOrdonner: 'Reiñ un urzh dre glikañ', // br: à relire
  composantsOrdonnerConsigne: 'Laka an niverennoù en urzh, eus ar bihanañ d’ar brasañ.', // br: à relire
  composantsOrdonnerJuste: 'Bravo, en urzh emañ.', // br: à relire
  composantsOrdonnerFaux: 'N’emañ ket c’hoazh en urzh : nullañ ha adkregiñ.', // br: à relire
  composantsConsigne: 'Kemenn lavaret', // br: à relire
  composantsConsigneFr: 'Compte les billes dans la boîte.',   // français voulu : lu avec la voix française, même dans l'interface en breton
  composantsConsigneBr: 'Kontit ar billoù er voest.', // br: à relire
  assistantTitre: 'Gweladenn heñchet an degemer', // br: à relire
  assistantDescription: 'addigeriñ skoazeller ar weladenn gentañ war an degemer, ha pa vefe bet gwelet dija (netra n’eo diverket)', // br: à relire
  couvertureTitre: 'Golo ar programm', // br: à relire
  couvertureDescription: 'pep barregezh eus ar programm × pep klas : ar pezh a c’holo anezhi en diazez, ar pezh a c’hortoz bezañ dizougen, an toulloù', // br: à relire
  couvertureIntro: 'Ur gaslig evit pep barregezh ha pep klas ma’z eo er programm (src/data/programme.ts). Tremen war ur gaslig : an danvezioù a c’holo anezhi.', // br: à relire
  couvertureBase: '{n} kaslig golo diwar {total} en diazez', // br: à relire
  couvertureTrous: 'kaslig hep netra', // br: à relire
  couvertureSansFiches: 'N’eus ket eus meneger ar fichennoù prest : an danvezioù eus ar marilhoù hepken a vez kontet. `npm run fiches:dev` evit ar fichennoù.', // br: à relire
  couvertureFiltres: 'Siloù', // br: à relire
  couvertureToutes: 'An holl zanvezioù', // br: à relire
  couvertureSorte: { tout: 'An holl zanvezioù', exercice: 'Poelladennoù', affiche: 'Skritelloù', fiche: 'Fichennoù prest' }, // br: à relire
  couvertureTrousSeuls: 'Ar barregezhioù gant toulloù hepken', // br: à relire
  couvertureLegende: { couvert: 'golo gant an diazez', trou: 'netra', hors: 'n’emañ ket e programm ar c’hlas' }, // br: à relire
  couvertureCompetence: 'Barregezh', // br: à relire
} satisfies Traductions<typeof fr>
