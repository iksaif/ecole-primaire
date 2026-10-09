// La monnaie — textes de CONTENU : ce que les énoncés, la fiche et son corrigé écrivent. Lus par T (générateur, fiche) ; la vue
// passe par `traducteur(CONTENU, …)`. Les textes de l'INTERFACE (boutons, réglages, retours du jeu) sont dans
// src/langues/<langue>/textes/monnaie.ts. Les sommes (« 3 € 50 c ») sont écrites par le générateur : « € » et « c » s'écrivent
// pareil dans les deux langues. Paramètres : somme, prix, paye, items, ta, tb = sommes déjà écrites ; e = emoji de l'objet.
// `objet.<id>` : les objets à acheter, par prix plausible (les emojis et les pluriels sont dans generateur.ts, OBJETS) ;
// `prenoms.<i>` : un couple de prénoms par porte-monnaie à comparer ; `fiche.<id>` : titre court, titre et description d'une
// fiche par compétence (pages /telechargements/), la même clé que son `id` dans definition.ts.
import { catalogue } from '../../langues/catalogue.ts'

export const CONTENU = catalogue({
  titre: 'La monnaie',
  objet: {
    pomme: 'une pomme', crayon: 'un crayon', bonbons: 'des bonbons', jus: 'un jus de fruits', baguette: 'une baguette',
    chocolat: 'une tablette de chocolat', cahier: 'un cahier', ballon: 'un ballon', feutres: 'des feutres', voiture: 'une petite voiture',
    ours: 'un ours en peluche', puzzle: 'un puzzle', livre: 'un livre', peinture: 'une boîte de peinture',
    trottinette: 'une trottinette', rollers: 'des rollers', jeu: 'un grand jeu de société', casque: 'un casque audio',
  },
  // « Tu achètes une pomme qui coûte 2 € » / « des bonbons qui coûtent 2 € »
  coute: 'qui coûte',
  coutent: 'qui coûtent',
  prenoms: {
    p0: { a: 'Léa', b: 'Tom' }, p1: { a: 'Inès', b: 'Hugo' }, p2: { a: 'Jade', b: 'Noah' },
    p3: { a: 'Chloé', b: 'Lucas' }, p4: { a: 'Emma', b: 'Adam' }, p5: { a: 'Lina', b: 'Gabriel' },
  },
  // nom d'une pièce ou d'un billet (v en euros, n en centimes), pour les lecteurs d'écran et les infobulles
  nomBillet: 'billet de {v} €',
  nomPiece: 'pièce de {v} €',
  nomCentimes: { one: 'pièce de {n} centime', other: 'pièce de {n} centimes' },

  // ─── Questions (historique, corrections) ───
  compterQ: 'Compter : {items}',
  composerQ: 'Faire {somme}',
  moinsQ: 'Payer {somme} avec le moins possible',
  rendreQ: '{e} {prix}, payé avec {paye}',
  comparerQ: '{a} ({ta}) ou {b} ({tb}) ?',
  autant: 'Autant',
  tuAchetes: 'Tu achètes',
  tuDonnes: 'Tu donnes',
  // « 2 € 5 c = ? € (avec une virgule) »
  avecVirgule: 'avec une virgule',

  // ─── Fiche ───
  ficheEuros: 'Euros',
  ficheEurosCentimes: 'Euros et centimes',
  ficheIlYa: 'Il y a',
  ficheCompterTitre: "Compte l'argent.",
  ficheExempleVirgule: '(écris par exemple 3,50 €)',
  ficheEntoureTitre: 'Entoure les pièces et les billets.',
  ficheEntoure: "Entoure ce qu'il faut pour payer exactement",
  ficheMoinsTitre: 'Le moins de pièces et de billets.',
  // « Pour payer <somme>, entoure la lettre… »
  fichePourPayer: 'Pour payer',
  ficheMoinsConsigne: 'entoure la lettre de celui qui utilise le moins de pièces et de billets.',
  ficheComparerTitre: 'Compare les porte-monnaie.',
  ficheComparerConsigne: "Qui a le plus d'argent ? Entoure son prénom (ou les deux s'ils ont autant).",
  ficheRendreTitre: 'Combien te rend-on ?',
  // « Tu achètes une pomme à 2 € »
  ficheA: 'à',
  ficheOnTeRend: 'On te rend',
  ficheConvertirTitre: 'Complète.',
  // corrigé : après les sommes données pour « Entoure les pièces et les billets »
  corrigeUneSolution: "(une solution parmi d'autres)",

  fiche: {
    compter: {
      court: 'Compter et faire une somme',
      titre: 'Fiche de monnaie : compter et faire une somme en euros',
      description: "Compter l'argent, entourer les pièces et les billets pour payer, payer avec le moins de pièces possible et comparer deux porte-monnaie : fiche de monnaie gratuite à imprimer, avec corrigé.",
    },
    rendre: {
      court: 'Rendre la monnaie',
      titre: 'Fiche de monnaie : rendre la monnaie en euros',
      description: "Calculer la monnaie à rendre quand on paye avec un billet : fiche de problèmes de monnaie gratuite à imprimer, avec corrigé.",
    },
    centimes: {
      court: 'Les euros et les centimes',
      titre: 'Fiche de monnaie : les euros et les centimes (1 € = 100 c)',
      description: "Compter des sommes en euros et centimes, écrire 3,50 € et passer des centimes aux euros : fiche de monnaie gratuite à imprimer, avec corrigé.",
    },
  },
}, {
  br: {
    titre: 'Ar moneiz',
    objet: {
      pomme: 'un aval', crayon: "ur c'hreion", bonbons: 'bonbonoù', jus: 'chug frouezh', baguette: 'ur bara hir',
      chocolat: 'un dablezenn chokolad', cahier: "ur c'haier", ballon: 'ur volotenn', feutres: 'feltroù', voiture: "ur c'harr bihan",
      ours: 'un arzh pluch', puzzle: 'ur puzzle', livre: 'ul levr', peinture: 'ur voest livañ',
      trottinette: 'un trotinell', rollers: 'botoù-ruilh', jeu: "ur c'hoari-taol bras", casque: 'ur selaouer',
    }, // br: à relire
    coute: 'a goust',
    coutent: 'a goust',
    prenoms: {
      p0: { a: 'Nolwenn', b: 'Erwan' }, p1: { a: 'Maiwenn', b: 'Yann' }, p2: { a: 'Enora', b: 'Loig' },
      p3: { a: 'Gwenn', b: 'Malo' }, p4: { a: 'Azenor', b: 'Tudual' }, p5: { a: 'Lena', b: 'Gwenole' },
    },
    nomBillet: 'bilhed {v} euro',
    nomPiece: 'pezh {v} euro',
    nomCentimes: { other: 'pezh {n} santim' },

    compterQ: 'Kontañ : {items}',
    composerQ: 'Ober {somme}',
    moinsQ: 'Paeañ {somme} gant an nebeutañ posubl',
    rendreQ: '{e} {prix}, paeet gant {paye}',
    comparerQ: '{a} ({ta}) pe {b} ({tb}) ?',
    autant: 'Kement',
    tuAchetes: 'Prenañ a rez',
    tuDonnes: 'Reiñ a rez',
    avecVirgule: 'gant ur skej',

    ficheEuros: 'Euro',
    ficheEurosCentimes: 'Euro ha santimoù',
    ficheIlYa: 'Sammad',
    ficheCompterTitre: "Kont an arc'hant.",
    ficheExempleVirgule: '(skriv da skouer 3,50 €)',
    ficheEntoureTitre: "Kelc'h ar pezhioù moneiz hag ar bilhedoù.", // br: à relire (consigne : forme de l’académie de Rennes, « Kelc’h(it) », « Klok(ait) »)
    ficheEntoure: "Kelc'h ar pezh a zo ezhomm evit paeañ resis", // br: à relire (consigne : forme de l’académie de Rennes, « Kelc’h(it) », « Klok(ait) »)
    ficheMoinsTitre: 'An nebeutañ a bezhioù hag a vilhedoù.',
    fichePourPayer: 'Evit paeañ',
    ficheMoinsConsigne: "kelc'h lizherenn an hini a implij an nebeutañ a bezhioù hag a vilhedoù.", // br: à relire (consigne : forme de l’académie de Rennes, « Kelc’h(it) », « Klok(ait) »)
    ficheComparerTitre: "Keñveria ar yalc'hoù.",
    ficheComparerConsigne: "Piv en deus ar muiañ a arc'hant ? Kelc'h e anv (pe an daou ma o deus kement all).", // br: à relire (consigne : forme de l’académie de Rennes, « Kelc’h(it) », « Klok(ait) »)
    ficheRendreTitre: 'Pegement a vez distroet dit ?',
    ficheA: 'da',
    ficheOnTeRend: 'Distroet e vo dit',
    ficheConvertirTitre: 'Klok.', // br: à relire (consigne : forme de l’académie de Rennes, « Kelc’h(it) », « Klok(ait) »)
    corrigeUneSolution: '(un diskoulm e-touez re all)', // br: à relire

    fiche: {
      compter: {
        court: 'Kontañ ha ober ur sammad', // br: à relire
        titre: 'Fichenn moneiz : kontañ ha ober ur sammad en euroioù', // br: à relire
        description: "Kontañ an arc'hant, kelc'hia ar pezhioù moneiz hag ar bilhedoù evit paeañ, paeañ gant an nebeutañ a bezhioù ha keñveriañ daou yalc'h : fichenn voneiz digoust da voullañ, gant ar reizhadenn.", // br: à relire
      },
      rendre: {
        court: 'Distreiñ ar moneiz', // br: à relire
        titre: 'Fichenn moneiz : distreiñ ar moneiz en euroioù', // br: à relire
        description: "Jediñ ar moneiz da zistreiñ pa baeer gant ur bilhed : fichenn start-kudennoù moneiz digoust da voullañ, gant ar reizhadenn.", // br: à relire
      },
      centimes: {
        court: 'An euroioù hag ar santimoù', // br: à relire
        titre: 'Fichenn moneiz : an euroioù hag ar santimoù (1 € = 100 c)', // br: à relire
        description: "Kontañ sammadoù en euroioù ha santimoù, skrivañ 3,50 € ha tremen eus ar santimoù d'an euroioù : fichenn voneiz digoust da voullañ, gant ar reizhadenn.", // br: à relire
      },
    },
  },
})
