// Quiz — la banque de questions en breton, par thème, dans l'ordre des questions françaises (fr.ts). Les questions absentes (noms propres,
// nuances délicates) ne sont proposées qu'en français. « bonne » doit figurer dans « choix ». Traduction automatique : les passages
// marqués « br: à relire » sont à faire vérifier par un brittophone.
import type { Banque } from './types.ts'

export default {
  'geo-france': [
    { q: "Pehini eo kêr-benn Bro-C'hall ?", bonne: 'Pariz', choix: ['Pariz', 'Lyon', 'Marseilh', 'Bourdel'] },
    { q: "Pehini eo ar stêr hirañ e Bro-C'hall ?", bonne: 'Al Liger', choix: ['Al Liger', 'Ar Sen', 'Ar Rodan', 'Ar Garonn'] },
    { q: 'Peseurt stêr a dreuz Pariz ?', bonne: 'Ar Sen', choix: ['Ar Sen', 'Al Liger', 'Ar Rodan', 'Ar Garonn'] },
    // br: à relire (Menez Gwenn, Alpoù, Pireneoù)
    { q: 'E peseurt menezioù emañ ar Menez Gwenn ?', bonne: 'An Alpoù', choix: ['An Alpoù', 'Ar Pireneoù', 'Ar Jura', 'Menez Are'] },
    { q: "Peseurt mor a zo e su Bro-C'hall ?", bonne: 'Ar Mor Kreizdouar', choix: ['Ar Mor Kreizdouar', 'Mor Breizh', 'Ar Meurvor Atlantel', 'Mor an Hanternoz'] },
    // br: à relire (« Meurvor Arktik »)
    { q: "Peseurt meurvor a zo e kornôg Bro-C'hall ?", bonne: 'Ar Meurvor Atlantel', choix: ['Ar Meurvor Atlantel', 'Ar Mor Kreizdouar', 'Mor Breizh', 'Ar Meurvor Arktik'] },
    { q: "Peseurt menezioù a zispartia Bro-C'hall diouzh Spagn ?", bonne: 'Ar Pireneoù', choix: ['Ar Pireneoù', 'An Alpoù', 'Ar Jura', 'Menez Are'] },
    { q: 'Peseurt departamant a zo un enez er Mor Kreizdouar ?', bonne: 'Korsika', choix: ['Korsika', 'Ar Reunion', 'Gwadeloup', 'Penn-ar-Bed'] },
    { q: 'E peseurt kêr emañ tour Eiffel ?', bonne: 'Pariz', choix: ['Pariz', 'Lyon', 'Marseilh', 'Tolosa'] },
    // br: à relire (« prefeti »)
    { q: 'Pe gêr eo prefeti Penn-ar-Bed ?', bonne: 'Kemper', choix: ['Kemper', 'Brest', 'Roazhon', 'Sant-Brieg'] },
  ],
  'geo-monde': [
    { q: 'Pehini eo kêr-benn Alamagn ?', bonne: 'Berlin', choix: ['Berlin', 'München', 'Hamburg', 'Frankfurt'] },
    { q: 'Pehini eo kêr-benn Spagn ?', bonne: 'Madrid', choix: ['Madrid', 'Barcelona', 'Sevilla', 'Valencia'] },
    { q: 'Pehini eo kêr-benn Italia ?', bonne: 'Roma', choix: ['Roma', 'Milano', 'Napoli', 'Torino'] },
    { q: 'Pehini eo kêr-benn ar Rouantelezh-Unanet ?', bonne: 'Londrez', choix: ['Londrez', 'Manchester', 'Edinbourg', 'Kerdiz'] },
    { q: 'Pehini eo kêr-benn ar Stadoù-Unanet ?', bonne: 'Washington', choix: ['Washington', 'New York', 'Los Angeles', 'Chicago'] },
    { q: 'Pehini eo kêr-benn Brazil ?', bonne: 'Brasília', choix: ['Brasília', 'Rio de Janeiro', 'São Paulo', 'Salvador'] },
    { q: 'Pehini eo kêr-benn Japan ?', bonne: 'Tokyo', choix: ['Tokyo', 'Osaka', 'Kyoto', 'Hiroshima'] },
    { q: 'Pehini eo kêr-benn Sina ?', bonne: 'Beijing', choix: ['Beijing', 'Shanghai', 'Guangzhou', 'Chongqing'] },
    { q: 'Pehini eo ar meurvor brasañ er bed ?', bonne: 'Ar Meurvor Habask', choix: ['Ar Meurvor Habask', 'Ar Meurvor Atlantel', 'Ar Meurvor Indez', 'Ar Meurvor Arktik'] },
    { q: 'Pehini eo ar stêr hirañ er bed ?', bonne: 'An Nil', choix: ['An Nil', 'An Amazon', 'Ar Mississippi', 'Ar Yangzi'], info: 'An Nil a zo war-dro 6 650 km hed dezhañ.' }, // br: à relire (info)
    { q: 'War peseurt kevandir emañ Egipt ?', bonne: 'Afrika', choix: ['Afrika', 'Azia', 'Europa', 'Ar Reter-Kreiz'] },
    { q: 'Pet kevandir a zo ?', bonne: '7', choix: ['7', '5', '6', '8'] },
    { q: 'Pehini eo kêr-benn Aostralia ?', bonne: 'Canberra', choix: ['Canberra', 'Sydney', 'Melbourne', 'Brisbane'] },
    { q: 'War peseurt kevandir emañ Brazil ?', bonne: 'Amerika ar Su', choix: ['Amerika ar Su', 'Amerika an Norzh', 'Afrika', 'Europa'] },
    { q: 'Pe vro eo ar brasañ er bed ?', bonne: 'Rusia', choix: ['Rusia', 'Kanada', 'Ar Stadoù-Unanet', 'Sina'] },
  ],
  'sciences': [
    { q: 'Pet planedenn a zo er reizhiad-heol ?', bonne: '8', choix: ['8', '9', '7', '10'], info: "Merc'her, Gwener, an Douar, Meurzh, Yaou, Sadorn, Ouranos, Neizhan." },
    { q: "Pehini eo ar blanedenn tostañ d'an Heol ?", bonne: "Merc'her", choix: ["Merc'her", 'Gwener', 'Meurzh', 'An Douar'] },
    // br: à relire (« kelc'hioù »)
    { q: "Pe blanedenn he deus kelc'hioù a weler mat ?", bonne: 'Sadorn', choix: ['Sadorn', 'Yaou', 'Meurzh', 'Ouranos'] },
    { q: 'War peseurt planedenn e vevomp ?', bonne: 'An Douar', choix: ['An Douar', 'Meurzh', 'Gwener', "Merc'her"] },
    // br: à relire
    { q: "Petra a zo ezhomm d'ar plant evit kreskiñ ?", bonne: 'Dour, gouloù ha mineraloù', choix: ['Dour, gouloù ha mineraloù', 'Dour hepken', 'Gouloù hepken', 'Sukr ha holen'] },
    // br: à relire
    { q: 'E keitad, pet litrad dour a evomp bemdez ?', bonne: '1,5 litrad', choix: ['1,5 litrad', '5 litrad', '0,5 litrad', '3 litrad'] },
    { q: 'Peseurt gaz a analomp ?', bonne: 'An oksigen', choix: ['An oksigen', 'Ar CO₂', 'An azot', 'An hidrogen'] },
    { q: 'Da beseurt temperadur e teu an dour da vezañ skorn ?', bonne: '0°C', choix: ['0°C', '-10°C', '4°C', '100°C'] },
    { q: 'Da beseurt temperadur e verv an dour ?', bonne: '100°C', choix: ['100°C', '80°C', '120°C', '60°C'] },
    // br: à relire
    { q: "Peseurt organ a bomp ar gwad en hor c'horf ?", bonne: 'Ar galon', choix: ['Ar galon', 'Ar skevent', 'An avu', 'An empenn'] },
    // br: à relire (info)
    { q: 'Pet askorn en deus korf un den deuet ?', bonne: '206', choix: ['206', '150', '300', '100'], info: 'Ar babigoù a zo war-dro 270 askorn ganto pa vezont ganet.' },
    { q: 'Pe blanedenn a vez graet « ar blanedenn ruz » anezhi ?', bonne: 'Meurzh', choix: ['Meurzh', 'Yaou', "Merc'her", 'Gwener'] }, // br: à relire
  ],
  // Istor Bro-C'hall : bloavezhioù hepken, pe dost
  'histoire': [
    { q: "Pe vloaz e krogas an Dispac'h gall ?", bonne: '1789', choix: ['1789', '1815', '1750', '1848'] },
    { q: 'Pe vloaz e voe emgann Marignan ?', bonne: '1515', choix: ['1515', '1415', '1618', '1792'] },
    { q: 'Pe vloaz e krogas ar Brezel-bed kentañ ?', bonne: '1914', choix: ['1914', '1918', '1939', '1900'] },
    { q: 'Pe vloaz e echuas an Eil Brezel-bed ?', bonne: '1945', choix: ['1945', '1944', '1918', '1939'] },
    // br: à relire
    { q: 'Pe vloaz e savas Charles de Gaulle ar Pempvet Republik ?', bonne: '1958', choix: ['1958', '1945', '1944', '1962'] },
    // br: à relire
    { q: 'Peseurt kêr a voe diazezet gant Romulus, hervez ar vojenn ?', bonne: 'Roma', choix: ['Roma', 'Kartago', 'Atena', 'Sparta'] },
    { q: "Peseurt deiz eo gouel broadel Bro-C'hall ?", bonne: '14 a viz Gouere', choix: ['14 a viz Gouere', '11 a viz Du', '8 a viz Mae', '1añ a viz Mae'] },
    { q: 'Pe vloaz e tizhas Kristol Kolomb Amerika ?', bonne: '1492', choix: ['1492', '1502', '1415', '1512'] },
  ],
  // br: à relire, anvioù loened gant ar ger-mell
  'animaux': [
    { q: 'Pehini eo al loen brasañ er bed ?', bonne: 'Ar balum glas', choix: ['Ar balum glas', 'An olifant', 'Ar rinkin', 'Ar jirafenn'] },
    { q: 'Pehini eo al loen buanañ war an douar ?', bonne: 'Ar gepard', choix: ['Ar gepard', 'Al leon', "Ar marc'h", "Ar c'had"] },
    { q: 'Peseurt loen a ra mel ?', bonne: 'Ar wenanenn', choix: ['Ar wenanenn', 'Ar wespedenn', 'Ar verienn', 'Ar valafenn'] },
    { q: 'Pet pav he deus ur gevnidenn ?', bonne: '8', choix: ['8', '6', '10', '4'] },
    { q: 'Pet pav en deus un amprevan ?', bonne: '6', choix: ['6', '8', '4', '10'] },
    { q: 'Peseurt loen a gousk a-hed ar goañv ?', bonne: 'An arzh', choix: ['An arzh', 'Ar bleiz', "Ar c'harv", 'Al louarn'] },
    { q: 'Pehini eo al loen pounnerañ war an douar ?', bonne: 'An olifant', choix: ['An olifant', 'Ar jirafenn', "Ar marc'h", 'An arzh'] },
    { q: "Peseurt stlejvil a c'hall cheñch liv ?", bonne: "Ar c'hameleon", choix: ["Ar c'hameleon", 'Ar glazard', 'Ar gekko', 'An iguana'] },
  ],
} satisfies Banque
