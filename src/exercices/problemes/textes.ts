// Problèmes — textes de CONTENU : les énoncés, leurs questions et leurs corrections, et les données qu'ils racontent (prénoms,
// objets, unités). Lus par T (générateur, fiche) ; la vue passe par `traducteur(CONTENU, …)`. Les textes de l'INTERFACE (réglages,
// boutons du jeu) sont dans src/langues/<langue>/textes/problemes.ts.
//
// Un énoncé est un texte à trous `{nom}`, écrit pour sa langue : le générateur ne branche jamais sur la langue, il donne à chaque
// texte les mêmes paramètres, et chaque langue prend ceux dont elle a besoin (le breton n'a pas les mêmes accords que le français).
//   pb.<id>   l'énoncé ; pb.<id>Q la question ; pb.<id>C la correction (le calcul avec sa phrase) ; paramètres communs :
//   p, p1, p2  prénoms ; o  l'objet au pluriel (« billes ») ; deO  « de billes » ; bo, qo  « 3 billes » ; a, b, c, d, n, k, q, t  nombres ;
//   nu  « 4 pages » (nombre et unité de la réponse) ; et les mots qui s'accordent avec le genre (voir `genre`).
//   genre.<m|f>.<mot>  les mots qui changent avec le genre du prénom (il/elle, « a » / « en deus »…) : suffixe 1 ou 2 pour deux prénoms ;
//   frag.<mot>  un morceau de phrase à pluriel (« 1 passager descend », « 5 passagers descendent »), selon n ;
//   unite.<mot>  un nom commun à pluriel, qui sert d'unité à la réponse ou se compte dans l'énoncé (n : le nombre) ;
//   objet.<id>  { s, p, g } ce que l'on collectionne ; paquet.<id>  { s, p } le contenu d'un paquet ;
//   chose.<id>  « un vélo a 2 roues » : { un, p, g, partie, partieS } ; chaîne vide = pas proposé dans cette langue (pas de tricycle en breton) ;
//   parent.<i> (enfant) et parentF.<i> (enfant fille) : « sujet:nom:accord » de « âgé » ; prenoms : « nom:genre|nom:genre… ».
import { catalogue } from '../../langues/catalogue.ts'

export const CONTENU = catalogue({
  titre: 'Problèmes',
  pCalcul: 'Calcul :',
  pReponse: 'Réponse :',
  pNbProblemes: '{n} problèmes',

  // élision : « que Léo », « qu'Emma » ; « de billes », « d'images » (mot : ce qui suit)
  elision: {
    que: { consonne: 'que {mot}', voyelle: "qu'{mot}" },
    de: { consonne: 'de {mot}', voyelle: "d'{mot}" },
  },

  prenoms: 'Léo:m|Emma:f|Inès:f|Noah:m|Jade:f|Adam:m|Lina:f|Hugo:m|Chloé:f|Yanis:m|Mila:f|Sacha:m|Zoé:f|Malo:m|Aya:f|Nathan:m|Louise:f|Gabriel:m|Rose:f|Mohamed:m|Ambre:f|Timéo:m|Lou:f|Éliott:m',
  // « Sa maman est 3 fois plus âgée qu'elle » : sujet, nom (« l'âge de la maman »), accord de « âgé »
  parent: {
    p0: 'Sa maman:la maman:e', p1: 'Son papa:le papa:', p2: 'Sa tante:la tante:e', p3: "Son oncle:l'oncle:",
  },
  parentF: {
    p0: 'Sa maman:la maman:e', p1: 'Son papa:le papa:', p2: 'Sa tante:la tante:e', p3: "Son oncle:l'oncle:",
  },

  // les mots qui suivent le genre du prénom (m : masculin, f : féminin)
  genre: {
    m: {
      il: 'il', Il: 'Il', deus: 'a', doa: 'avait', gant: 'avec lui', son: 'son', queLui: 'que lui',
      collection: 'sa collection', anniversaire: 'son anniversaire', maitre: 'le maître', Maitre: 'Le maître', bleus: 'bleus', ils: 'ils', eux: 'eux',
    },
    f: {
      il: 'elle', Il: 'Elle', deus: 'a', doa: 'avait', gant: 'avec elle', son: 'son', queLui: "qu'elle", collection: 'sa collection',
      anniversaire: 'son anniversaire', maitre: 'la maîtresse', Maitre: 'La maîtresse', bleus: 'bleues', ils: 'elles', eux: 'elles',
    },
  },

  // morceaux de phrase à pluriel (n : le nombre)
  frag: {
    monte: { one: '{n} passager monte', other: '{n} passagers montent' },
    descend: { one: '{n} passager descend', other: '{n} passagers descendent' },
    eclate: { one: '{n} ballon éclate', other: '{n} ballons éclatent' },
    rouge: { one: 'est rouge', other: 'sont rouges' },
  },

  // noms communs : l'unité d'une réponse, ou ce qu'on compte dans un énoncé
  unite: {
    timbre: { one: 'timbre', other: 'timbres' }, passager: { one: 'passager', other: 'passagers' }, page: { one: 'page', other: 'pages' },
    bonbon: { one: 'bonbon', other: 'bonbons' }, livre: { one: 'livre', other: 'livres' }, enfant: { one: 'enfant', other: 'enfants' },
    euro: { one: 'euro', other: 'euros' }, point: { one: 'point', other: 'points' }, eleve: { one: 'élève', other: 'élèves' },
    poire: { one: 'poire', other: 'poires' }, animal: { one: 'animal', other: 'animaux' }, chaise: { one: 'chaise', other: 'chaises' },
    carre: { one: 'carré', other: 'carrés' }, feutre: { one: 'feutre', other: 'feutres' }, equipe: { one: 'équipe', other: 'équipes' },
    boite: { one: 'boîte', other: 'boîtes' }, voiture: { one: 'voiture', other: 'voitures' }, morceau: { one: 'morceau', other: 'morceaux' },
    feuille: { one: 'feuille', other: 'feuilles' }, an: { one: 'an', other: 'ans' }, ballon: { one: 'ballon', other: 'ballons' },
    image: { one: 'image', other: 'images' }, pomme: { one: 'pomme', other: 'pommes' }, fille: { one: 'fille', other: 'filles' },
    garcon: { one: 'garçon', other: 'garçons' }, poule: { one: 'poule', other: 'poules' }, canard: { one: 'canard', other: 'canards' },
    adulte: { one: 'adulte', other: 'adultes' },
  },

  // ce que l'on collectionne ou échange
  objet: {
    bille: { s: 'bille', p: 'billes', g: 'f' }, carte: { s: 'carte', p: 'cartes', g: 'f' }, image: { s: 'image', p: 'images', g: 'f' },
    perle: { s: 'perle', p: 'perles', g: 'f' }, autocollant: { s: 'autocollant', p: 'autocollants', g: 'm' },
    coquillage: { s: 'coquillage', p: 'coquillages', g: 'm' }, bonbon: { s: 'bonbon', p: 'bonbons', g: 'm' }, timbre: { s: 'timbre', p: 'timbres', g: 'm' },
  },
  // contenu d'un paquet
  paquet: {
    gateau: { s: 'gâteau', p: 'gâteaux' }, image: { s: 'image', p: 'images' }, carte: { s: 'carte', p: 'cartes' },
    biscuit: { s: 'biscuit', p: 'biscuits' }, crayon: { s: 'crayon', p: 'crayons' }, bonbon: { s: 'bonbon', p: 'bonbons' },
  },
  // « Un vélo a 2 roues » : un (avec l'article), p (pluriel), g (genre), partie et partieS (la partie, au pluriel et au singulier)
  chose: {
    velo: { un: 'Un vélo', p: 'vélos', g: 'm', partie: 'roues', partieS: 'roue' },
    tricycle: { un: 'Un tricycle', p: 'tricycles', g: 'm', partie: 'roues', partieS: 'roue' },
    voiture: { un: 'Une voiture', p: 'voitures', g: 'f', partie: 'roues', partieS: 'roue' },
    chien: { un: 'Un chien', p: 'chiens', g: 'm', partie: 'pattes', partieS: 'patte' },
    main: { un: 'Une main', p: 'mains', g: 'f', partie: 'doigts', partieS: 'doigt' },
    etoile: { un: 'Une étoile de mer', p: 'étoiles de mer', g: 'f', partie: 'bras', partieS: 'bras' },
  },

  pb: {
    // ─── Ajout / retrait ───
    ajoutGain: '{p} a {a} {o}. À la récréation, {il} en gagne {b}.',
    ajoutGainQ: 'Combien {deO} a-t-{il} maintenant ?',
    timbres: '{p} a {a} timbres dans {collection}. Pour {anniversaire}, on lui offre {b} timbres.',
    timbresQ: 'Combien de timbres a-t-{il} maintenant ?',
    busRetrait: "Dans le bus, il y a {a} passagers. À l'arrêt, {descend}.",
    busRetraitQ: 'Combien de passagers reste-t-il dans le bus ?',
    livrePages: 'Un livre a {a} pages. {p} en a déjà lu {b}.',
    livrePagesQ: 'Combien de pages lui reste-t-il à lire ?',
    initialGain: '{p} avait des {o}. {Il} en a gagné {b}. Maintenant, {il} en a {c}.',
    initialGainQ: 'Combien {deO} avait-{il} au début ?',
    initialPerte: '{p} a mangé {b} bonbons. Il lui en reste {c}.',
    initialPerteQ: 'Combien de bonbons avait-{il} au début ?',
    bibliotheque: "Ce mois-ci, la bibliothèque de l'école a prêté {b} livres. Il reste {c} livres sur les étagères.",
    bibliothequeQ: 'Combien de livres y avait-il sur les étagères au début du mois ?',
    cour: "Au début de la récréation, il y a {a} enfants dans la cour. D'autres enfants arrivent. Maintenant, il y a {c} enfants dans la cour.",
    courQ: "Combien d'enfants sont arrivés ?",
    tirelire: "{p} avait {a} euros dans sa tirelire. {Il} a acheté un jeu. Maintenant, il lui reste {c} euros.",
    tirelireQ: 'Combien a coûté le jeu ?',
    partiePoints: 'Au début de la partie, {p} a {a} points. À la fin de la partie, {il} a {c} points.',
    partiePointsQ: 'Combien de points a-t-{il} gagnés pendant la partie ?',

    // ─── Comparaison ───
    // « Combien de billes a Emma ? » (p2)
    combienA2: 'Combien {deO} a {p2} ?',
    compPlus: '{p1} a {a} {o}. {p2} a {bo} de plus {que1}.',
    compMoins: '{p1} a {a} {o}. {p2} a {bo} de moins {que1}.',
    compEcart: '{p1} a {a} {o}. {p2} en a {c}.',
    compEcartQ: 'Combien {deO} {p2} a-t-{il2} de plus {que1} ?',
    // comparaison « inversée » : l'énoncé parle de p1, la question de p2
    compInverse: '{p1} a {a} {o}. {Il1} a {bo} de plus {que2}.',
    ecoles: "L'école des Tilleuls a {a} élèves. L'école des Lilas a {eleves} de plus.",
    ecolesQ: "Combien d'élèves y a-t-il à l'école des Lilas ?",
    velo: 'Un vélo coûte {a} euros. Une trottinette coûte {euros} de moins que le vélo.',
    veloQ: 'Combien coûte la trottinette ?',

    // ─── Parties et tout ───
    classe: 'Dans la classe, il y a {filles} et {garcons}.',
    classeQ: "Combien d'élèves y a-t-il dans la classe ?",
    panier: 'Dans un panier, il y a {c} fruits : des pommes et des poires. Il y a {pommes}.',
    panierQ: 'Combien y a-t-il de poires ?',
    couleurs: '{p} a {c} {o}. Parmi ces {o}, {a} {rouge} et les autres sont {bleus}.',
    couleursQ: 'Combien {deO} {bleus} {p} a-t-{il} ?',
    ferme: 'Dans sa ferme, un fermier a {poules} et {canards}.',
    fermeQ: "Combien d'animaux a-t-il en tout ?",
    cinema: 'Au cinéma, il y a {c} spectateurs : des adultes et des enfants. Il y a {adultes}.',
    cinemaQ: "Combien d'enfants y a-t-il ?",

    // ─── Multiplication ───
    paquetsAchat: '{p} achète {n} paquets de {k} {o}.',
    paquetsAchatQ: 'Combien {deO} a-t-{il} en tout ?',
    chaises: 'Pour le spectacle, on installe {n} rangées de {k} chaises.',
    chaisesQ: 'Combien de chaises y a-t-il en tout ?',
    // « Un vélo a 2 roues » : Un (avec l'article), partie, dePartie, ch (les objets au pluriel)
    parties: '{Un} a {k} {partie}.',
    partiesQ: 'Combien {dePartie} ont {n} {ch} ?',
    feutres: 'Une boîte de feutres coûte {k} euros. {p} achète {n} boîtes de feutres.',
    feutresQ: "Combien d'euros {p} doit-{il} payer ?",
    chocolat: 'Une tablette de chocolat a {n} rangées de {k} carrés.',
    chocolatQ: 'Combien de carrés de chocolat y a-t-il dans la tablette ?',
    feuilles: 'Un paquet contient {k} feuilles.',
    feuillesQ: 'Combien de feuilles y a-t-il dans {n} paquets ?',

    // ─── Partage / groupements ───
    partageAmis: '{p} a {t} {o}. {Il} les partage entre ses {k} amis. Chaque ami reçoit le même nombre {deO}.',
    partageAmisQ: 'Combien {deO} reçoit chaque ami ?',
    partageAmisC: '{k} × {q} = {t}, donc chaque ami reçoit {qo}',
    partageGroupes: '{Maitre} distribue {t} feutres à {k} groupes. Chaque groupe reçoit le même nombre de feutres.',
    partageGroupesQ: 'Combien de feutres reçoit chaque groupe ?',
    partageGroupesC: '{k} × {q} = {t}, donc chaque groupe reçoit {nu}',
    // « 4 × 5 = 20, donc 4 pages » (nu : le nombre et l'unité de la réponse)
    groupementC: '{q} × {k} = {t}, donc {nu}',
    album: '{p} colle {t} photos dans un album. {Il} met {k} photos sur chaque page.',
    albumQ: 'Combien de pages {p} remplit-{il} ?',
    equipes: 'Pour un jeu, {t} enfants forment des équipes de {k} enfants.',
    equipesQ: "Combien d'équipes y a-t-il ?",
    livresAchat: '{p} a {t} euros. Un livre coûte {k} euros. {Il} dépense tout {son} argent en livres.',
    livresAchatQ: 'Combien de livres {p} achète-t-{il} ?',
    oeufs: '{p} a {t} œufs. {Il} les range dans des boîtes de {k} œufs.',
    oeufsQ: 'Combien de boîtes {p} peut-{il} remplir complètement ?',
    // n : le reste
    oeufsC: {
      one: '{q} × {k} = {qk} ; il reste {reste} œuf, pas assez pour une boîte de plus',
      other: '{q} × {k} = {qk} ; il reste {reste} œufs, pas assez pour une boîte de plus',
    },
    sortie: '{t} enfants partent en sortie. Chaque voiture peut transporter {k} enfants.',
    sortieQ: 'Combien de voitures faut-il pour emmener tous les enfants ?',
    // n : le reste
    sortieC: {
      one: '{q} × {k} = {qk} ; il reste {reste} enfant, il faut une voiture de plus : {q} + 1 = {q1}',
      other: '{q} × {k} = {qk} ; il reste {reste} enfants, il faut une voiture de plus : {q} + 1 = {q1}',
    },
    ruban: 'Un ruban mesure {t} cm. On le coupe en morceaux de {k} cm.',
    rubanQ: 'Combien de morceaux obtient-on ?',

    // ─── « Fois plus » ───
    foisPlus: '{p1} a {a} {o}. {p2} a {k} fois plus {deO} {que1}.',
    manteau: 'Un tee-shirt coûte {a} euros. Un manteau coûte {k} fois plus cher que le tee-shirt.',
    manteauQ: 'Combien coûte le manteau ?',
    age: '{p} a {a} ans. {parentSujet} est {k} fois plus âgé{parentAccord} {queLui}.',
    ageQ: 'Quel âge a {parentNom} {dePrenom} ?',

    // ─── Plusieurs étapes ───
    resteEurosQ: "Combien d'euros lui reste-t-il ?",
    busMaintenantQ: 'Combien de passagers y a-t-il maintenant dans le bus ?',
    achats: '{p} a {a} euros. {Il} achète un livre à {euroB} et un stylo à {euroC}.',
    bus2: "Dans le bus, il y a {a} passagers. Au premier arrêt, {monteB}. Au deuxième arrêt, {descendC}.",
    imagesDon: '{p1} achète {n} paquets de {k} images. {Il1} en donne {d} à {p2}.',
    imagesDonQ: "Combien d'images reste-t-il à {p1} ?",
    // « à eux deux », « à elles deux »
    total2: '{p1} a {a} {o}. {p2} en a {b} de plus {que1}.',
    total2Q: 'Combien {deO} ont-{ils} à {eux} deux ?',
    pommes: 'Un fermier ramasse {a} pommes lundi et {b} pommes mardi. Mercredi, il en vend {c}.',
    pommesQ: 'Combien de pommes lui reste-t-il ?',
    achats3: '{p} a {a} euros. {Il} achète {n} cahiers à {k} euros chacun et une trousse à {c} euros.',
    bus3: "Dans le bus, il y a {a} passagers. Au premier arrêt, {monteB}. Au deuxième arrêt, {descendC}. Au troisième arrêt, {monteD}.",
    ballons: 'Pour la fête, {maitre} achète {n} paquets de {k} ballons. {eclateB}. Ensuite, {il} en achète {c} autres.',
    ballonsQ: 'Combien de ballons y a-t-il maintenant ?',
    // « 3 × 2 = 6, donc… » : le détail d'une multiplication par addition répétée
    additionRepetee: '{somme} = {r}, donc {n} × {k} = {r}',
  },
}, {
  br: {
    titre: 'Kudennoù', // br: à relire
    pCalcul: 'Jedadur :', // br: à relire
    pReponse: 'Respont :', // br: à relire
    pNbProblemes: '{n} kudenn', // br: à relire

    elision: {
      que: { consonne: 'eget {mot}', voyelle: 'eget {mot}' }, // br: à relire
      de: { consonne: '{mot}', voyelle: '{mot}' }, // br: à relire
    },

    // prénoms bretons (aucun ne commence par une consonne mutable après « da »)
    prenoms: 'Yann:m|Nolwenn:f|Erwan:m|Aziliz:f|Ronan:m|Enora:f|Elouan:m|Lena:f|Lomig:m|Yuna:f|Riwal:m|Sterenn:f|Iwan:m|Soazig:f|Noan:m|Anna:f', // br: à relire
    // le possessif suit le genre de l'enfant : « e vamm » (sa mère à lui), « he mamm » (à elle)
    parent: { // br: à relire
      p0: 'E vamm:e vamm:', p1: 'E dad:e dad:', p2: 'E voereb:e voereb:', p3: 'E eontr:e eontr:',
    },
    parentF: { // br: à relire
      p0: 'He mamm:he mamm:', p1: 'He zad:he zad:', p2: 'He moereb:he moereb:', p3: 'He eontr:he eontr:',
    },

    genre: { // br: à relire
      m: {
        il: 'eñ', Il: 'Eñ', deus: 'en deus', doa: 'en doa', gant: 'gantañ', son: 'e', queLui: 'egetañ',
        collection: 'e zastumad', anniversaire: 'e zeiz-ha-bloaz', maitre: 'ar skolaer', Maitre: 'Ar skolaer', bleus: 'glas', ils: 'o-daou', eux: 'o-daou',
      },
      f: {
        il: 'hi', Il: 'Hi', deus: 'he deus', doa: 'he doa', gant: 'ganti', son: 'he', queLui: 'egeti',
        collection: 'he dastumad', anniversaire: 'he deiz-ha-bloaz', maitre: 'ar skolaerez', Maitre: 'Ar skolaerez', bleus: 'glas', ils: 'o-div', eux: 'o-div',
      },
    },

    frag: { // br: à relire
      monte: { other: 'e pign {n} beajour' },
      descend: { other: 'e ziskenn {n} beajour' },
      eclate: { other: '{n} balon a darzh' },
      rouge: { other: 'a zo ruz' },
    },

    // le nom reste au singulier après un nombre
    unite: { // br: à relire
      timbre: { other: 'timbr' }, passager: { other: 'beajour' }, page: { other: 'pajenn' }, bonbon: { other: 'bonbon' },
      livre: { other: 'levr' }, enfant: { other: 'bugel' }, euro: { other: 'euro' }, point: { other: 'poent' }, eleve: { other: 'skoliad' },
      poire: { other: 'perenn' }, animal: { other: 'loen' }, chaise: { other: 'kador' }, carre: { other: 'karrez' }, feutre: { other: 'kreion' },
      equipe: { other: 'skipailh' }, boite: { other: 'boest' }, voiture: { other: 'karr' }, morceau: { other: 'tamm' }, feuille: { other: 'follenn' },
      an: { other: 'bloaz' }, ballon: { other: 'balon' }, image: { other: 'skeudenn' }, pomme: { other: 'aval' }, fille: { other: "plac'h" },
      garcon: { other: 'paotr' }, poule: { other: 'yar' }, canard: { other: 'houad' }, adulte: { other: 'oadour' },
    },

    // « skritell » = autocollant
    objet: { // br: à relire
      bille: { s: 'bilhenn', p: 'bilhenn', g: 'f' }, carte: { s: 'kartenn', p: 'kartenn', g: 'f' }, image: { s: 'skeudenn', p: 'skeudenn', g: 'f' },
      perle: { s: 'perlezenn', p: 'perlezenn', g: 'f' }, autocollant: { s: 'skritell', p: 'skritell', g: 'f' },
      coquillage: { s: 'kregenn', p: 'kregenn', g: 'f' }, bonbon: { s: 'bonbon', p: 'bonbon', g: 'm' }, timbre: { s: 'timbr', p: 'timbr', g: 'm' },
    },
    // « gwispidenn » = biscuit
    paquet: { // br: à relire
      gateau: { s: 'gwastell', p: 'gwastell' }, image: { s: 'skeudenn', p: 'skeudenn' }, carte: { s: 'kartenn', p: 'kartenn' },
      biscuit: { s: 'gwispidenn', p: 'gwispidenn' }, crayon: { s: 'kreion', p: 'kreion' }, bonbon: { s: 'bonbon', p: 'bonbon' },
    },
    // un : « ur … » avec sa mutation ; pas de tricycle en breton (chaînes vides : jamais proposé)
    chose: { // br: à relire
      velo: { un: "Ur marc'h-houarn", p: "marc'h-houarn", g: 'm', partie: 'rod', partieS: 'rod' },
      tricycle: { un: '', p: '', g: 'm', partie: '', partieS: '' },
      voiture: { un: 'Ur wetur', p: 'gwetur', g: 'f', partie: 'rod', partieS: 'rod' },
      chien: { un: "Ur c'hi", p: 'ki', g: 'm', partie: 'pav', partieS: 'pav' },
      main: { un: 'Un dorn', p: 'dorn', g: 'm', partie: 'biz', partieS: 'biz' },
      etoile: { un: 'Ur steredenn-vor', p: 'steredenn-vor', g: 'f', partie: "brec'h", partieS: "brec'h" },
    },

    pb: {
      // ─── Ajout / retrait ───
      ajoutGain: "{p} {deus} {a} {o}. E-pad ar ratre e c'hounez {b} all.", // br: à relire
      ajoutGainQ: 'Pet {o} {deus} bremañ ?', // br: à relire
      timbres: '{p} {deus} {a} timbr en {collection}. Evit {anniversaire} e resev {b} timbr all.', // br: à relire (mutations après e/he)
      timbresQ: 'Pet timbr {deus} bremañ ?', // br: à relire
      busRetrait: 'Er bus ez eus {a} beajour. En arsav {descend}.', // br: à relire
      busRetraitQ: 'Pet beajour a chom er bus ?', // br: à relire
      livrePages: 'En ul levr ez eus {a} pajenn. {p} {deus} lennet {b} anezho dija.', // br: à relire
      livrePagesQ: 'Pet pajenn a chom da lenn ?', // br: à relire
      initialGain: '{p} {deus} gounezet {b} {o}. Bremañ {deus} {c} {o}.', // br: à relire
      initialGainQ: 'Pet {o} {doa} da gentañ ?', // br: à relire
      initialPerte: '{p} {deus} debret {b} bonbon. Chom a ra {c} bonbon {gant}.', // br: à relire
      initialPerteQ: 'Pet bonbon {doa} da gentañ ?', // br: à relire
      bibliotheque: 'Ar miz-mañ ez eus bet prestet {b} levr gant levraoueg ar skol. Chom a ra {c} levr el levraoueg.', // br: à relire
      bibliothequeQ: 'Pet levr a oa el levraoueg e deroù ar miz ?', // br: à relire
      cour: 'E deroù ar ratre ez eus {a} bugel er porzh. Bugale all a zeu. Bremañ ez eus {c} bugel er porzh.', // br: à relire
      courQ: 'Pet bugel a zo deuet ?', // br: à relire
      tirelire: "{p} {doa} {a} euro. Prenet {deus} ur c'hoari. Bremañ e chom {c} euro {gant}.", // br: à relire
      tirelireQ: "Pegement e koust ar c'hoari ?", // br: à relire
      partiePoints: "E deroù ar c'hoari {deus} {p} {a} poent. E dibenn ar c'hoari {deus} {c} poent.", // br: à relire
      partiePointsQ: "Pet poent {deus} gounezet e-pad ar c'hoari ?", // br: à relire

      // ─── Comparaison ───
      combienA2: 'Pet {o} {deus2} {p2} ?', // br: à relire
      compPlus: "{p1} {deus1} {a} {o}. {p2} {deus2} {b} {o} muioc'h eget {p1}.", // br: à relire
      compMoins: "{p1} {deus1} {a} {o}. {p2} {deus2} {b} {o} nebeutoc'h eget {p1}.", // br: à relire
      compEcart: '{p1} {deus1} {a} {o}. {p2} {deus2} {c} {o}.', // br: à relire
      compEcartQ: "Pet {o} {deus2} {p2} muioc'h eget {p1} ?", // br: à relire
      compInverse: "{p1} {deus1} {a} {o}. {p1} {deus1} {b} {o} muioc'h eget {p2}.", // br: à relire
      ecoles: "E skol Kerlann ez eus {a} skoliad. E skol Penhoat ez eus {eleves} muioc'h.", // br: à relire
      ecolesQ: 'Pet skoliad a zo e skol Penhoat ?', // br: à relire
      velo: "Ur marc'h-houarn bras a goust {a} euro. Ur marc'h-houarn bihan a goust {euros} nebeutoc'h.", // br: à relire
      veloQ: "Pegement e koust ar marc'h-houarn bihan ?", // br: à relire

      // ─── Parties et tout ───
      classe: "Er c'hlas ez eus {filles} ha {garcons}.", // br: à relire
      classeQ: "Pet skoliad a zo er c'hlas ?", // br: à relire
      panier: 'En ur paner ez eus {c} frouezhenn : avaloù ha per. {pommes} a zo.', // br: à relire (« frouezhenn », « perenn » au singulatif)
      panierQ: 'Pet perenn a zo ?', // br: à relire
      couleurs: '{p} {deus} {c} {o}. {a} anezho {rouge} hag ar re all a zo {bleus}.', // br: à relire
      couleursQ: 'Pet anezho a zo glas ?', // br: à relire
      ferme: 'Ur feurmer en deus {poules} ha {canards}.', // br: à relire
      fermeQ: 'Pet loen en deus en holl ?', // br: à relire
      cinema: 'Er sinema ez eus {c} arvester : oadourien ha bugale. {adultes} a zo.', // br: à relire (« oadour » = adulte)
      cinemaQ: 'Pet bugel a zo ?', // br: à relire

      // ─── Multiplication ───
      paquetsAchat: '{p} a bren {n} pakad. E pep pakad ez eus {k} {o}.', // br: à relire
      paquetsAchatQ: 'Pet {o} {deus} en holl ?', // br: à relire
      chaises: 'Evit an abadenn ez eus {n} renkad kadorioù. E pep renkad ez eus {k} kador.', // br: à relire
      chaisesQ: 'Pet kador a zo en holl ?', // br: à relire
      parties: '{Un} {deus} {k} {partie}.', // br: à relire
      partiesQ: 'Pet {partie} o deus {n} {ch} ?', // br: à relire
      feutres: 'Ur voestad kreion a goust {k} euro. {p} a bren {n} boestad kreion.', // br: à relire
      feutresQ: 'Pet euro a rank {p} paeañ ?', // br: à relire
      chocolat: 'Ur dablezenn chokolad he deus {n} renkad. E pep renkad ez eus {k} karrez.', // br: à relire (« tablezenn » = tablette)
      chocolatQ: 'Pet karrez chokolad a zo en dablezenn ?', // br: à relire
      feuilles: 'En ur pakad ez eus {k} follenn.', // br: à relire
      feuillesQ: 'Pet follenn a zo e {n} pakad ?', // br: à relire

      // ─── Partage / groupements ───
      partageAmis: '{p} {deus} {t} {o}. Rannañ a ra anezho etre {k} mignon. Pep mignon a resev ar memes niver.', // br: à relire
      partageAmisQ: 'Pet {o} a resev pep mignon ?', // br: à relire
      partageAmisC: '{k} × {q} = {t}, neuze pep mignon a resev {qo}', // br: à relire
      partageGroupes: '{Maitre} a ro {t} kreion da {k} strollad. Pep strollad a resev ar memes niver.', // br: à relire
      partageGroupesQ: 'Pet kreion a resev pep strollad ?', // br: à relire
      partageGroupesC: '{k} × {q} = {t}, neuze pep strollad a resev {nu}', // br: à relire
      groupementC: '{q} × {k} = {t}, neuze {nu}', // br: à relire
      album: "{p} a stag {t} luc'hskeudenn en un albom. Lakaat a ra {k} luc'hskeudenn war pep pajenn.", // br: à relire
      albumQ: 'Pet pajenn a leunia {p} ?', // br: à relire
      equipes: "Evit ur c'hoari, {t} bugel a ra skipailhoù. E pep skipailh ez eus {k} bugel.", // br: à relire
      equipesQ: 'Pet skipailh a zo ?', // br: à relire
      livresAchat: "{p} {deus} {t} euro. Ul levr a goust {k} euro. Gant {son} holl arc'hant e pren levrioù.", // br: à relire
      livresAchatQ: 'Pet levr a bren {p} ?', // br: à relire
      oeufs: '{p} {deus} {t} vi. Lakaat a ra anezho e boestoù. E pep boest e lak {k} vi.', // br: à relire
      oeufsQ: "Pet boest a c'hall {p} leuniañ penn-da-benn ?", // br: à relire
      oeufsC: { other: '{q} × {k} = {qk} ; chom a ra {reste} vi, re nebeut evit ur voest ouzhpenn' }, // br: à relire
      sortie: "{t} bugel a ya e baleadenn. Pep karr a c'hall kas {k} bugel.", // br: à relire
      sortieQ: 'Pet karr a zo ezhomm evit kas an holl vugale ?', // br: à relire
      sortieC: { other: "{q} × {k} = {qk} ; chom a ra {reste} bugel, ret eo kaout ur c'harr ouzhpenn : {q} + 1 = {q1}" }, // br: à relire
      ruban: "Ur seizenn he deus {t} cm a hirder. Troc'hañ a reer anezhi e tammoù a {k} cm.", // br: à relire
      rubanQ: 'Pet tamm a vo ?', // br: à relire

      // ─── « Fois plus » ───
      foisPlus: '{p1} {deus1} {a} {o}. {p2} {deus2} {k} gwech kement ha {p1}.', // br: à relire (« gwech kement ha » = fois plus que)
      manteau: 'Ur roched a goust {a} euro. Ur vantell a goust {k} gwech kement hag ar roched.', // br: à relire
      manteauQ: 'Pegement e koust ar vantell ?', // br: à relire
      age: "{p} {deus} {a} bloaz. {parentSujet} a zo {k} gwech koshoc'h {queLui}.", // br: à relire (« bloaz » sans mutation après le chiffre)
      ageQ: 'Pe oad eo {parentNom} ?', // br: à relire

      // ─── Plusieurs étapes ───
      resteEurosQ: 'Pet euro a chom {gant} ?', // br: à relire
      busMaintenantQ: 'Pet beajour a zo er bus bremañ ?', // br: à relire
      achats: '{p} {deus} {a} euro. Prenañ a ra ul levr a goust {euroB} hag ur stilo a goust {euroC}.', // br: à relire
      bus2: "Er bus ez eus {a} beajour. Er c'hentañ arsav {monteB}. En eil arsav {descendC}.", // br: à relire
      imagesDon: '{p1} a bren {n} pakad. E pep pakad ez eus {k} skeudenn. {p1} a ro {d} skeudenn da {p2}.', // br: à relire
      imagesDonQ: 'Pet skeudenn a chom gant {p1} ?', // br: à relire
      total2: "{p1} {deus1} {a} {o}. {p2} {deus2} {b} {o} muioc'h eget {p1}.", // br: à relire
      total2Q: 'Pet {o} o deus {ils} ?', // br: à relire
      pommes: "Ur feurmer a zastum {a} aval d'al Lun ha {b} aval d'ar Meurzh. D'ar Merc'her e werzh {c} anezho.", // br: à relire
      pommesQ: 'Pet aval a chom gantañ ?', // br: à relire
      achats3: '{p} {deus} {a} euro. Prenañ a ra {n} kaier a goust {k} euro pep hini, hag ur reolenn a goust {c} euro.', // br: à relire
      bus3: "Er bus ez eus {a} beajour. Er c'hentañ arsav {monteB}. En eil arsav {descendC}. En trede arsav {monteD}.", // br: à relire
      ballons: "Evit ar fest, {maitre} a bren {n} pakad. E pep pakad ez eus {k} balon. {eclateB}. Goude-se e pren {c} balon all.", // br: à relire
      ballonsQ: 'Pet balon a zo bremañ ?', // br: à relire
        additionRepetee: '{somme} = {r}, neuze {n} × {k} = {r}', // br: à relire
    },
  },
})
