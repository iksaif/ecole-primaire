// Contenu généré — la monnaie (breton). Traduction automatique : les passages marqués « br: à relire »
// sont à faire vérifier par un brittophone (`npm run i18n:relecture`). Paramètres : voir src/i18n/fr/contenu/monnaie.js.

export default {
  // mêmes objets qu'en français, dans le même ordre (br: à relire)
  objets: {
    pasCher: [{ nom: 'un aval' }, { nom: "ur c'hreion" }, { nom: 'bonbonoù' }, { nom: 'chug frouezh' }, { nom: 'ur bara hir' }],
    moyen: [{ nom: 'un dablezenn chokolad' }, { nom: "ur c'haier" }, { nom: 'ur volotenn' }, { nom: 'feltroù' }, { nom: "ur c'harr bihan" }],
    cher: [{ nom: 'un arzh pluch' }, { nom: 'ur puzzle' }, { nom: 'ul levr' }, { nom: 'ur voest livañ' }],
    tresCher: [{ nom: 'un trotinell' }, { nom: 'botoù-ruilh' }, { nom: "ur c'hoari-taol bras" }, { nom: 'ur selaouer' }],
  },
  coute: 'a goust',
  prenoms: [['Nolwenn', 'Erwan'], ['Maiwenn', 'Yann'], ['Enora', 'Loig'], ['Gwenn', 'Malo'], ['Azenor', 'Tudual'], ['Lena', 'Gwenole']],
  nomArgent: ({ v }) => {
    if (v >= 500) return `bilhed ${v / 100} euro`
    if (v >= 100) return `pezh ${v / 100} euro`
    return `pezh ${v} santim`
  },

  // ─── Questions (historique, corrections) ───
  compterQ: 'Kontañ : {items}',
  composerQ: 'Ober {somme}',
  moinsQ: 'Paeañ {somme} gant an nebeutañ posubl',
  rendreQ: '{e} {prix}, paeet gant {paye}',
  comparerQ: '{a} ({ta}) pe {b} ({tb}) ?',
  avecVirgule: 'gant ur skej',

  // ─── Fiche ───
  ficheEuros: 'Euro',
  ficheEurosCentimes: 'Euro ha santimoù',
  ficheIlYa: 'Sammad',
  ficheCompterTitre: "Kont an arc'hant.",
  ficheExempleVirgule: '(skriv da skouer 3,50 €)',
  ficheEntoureTitre: "Kelc'hia ar pezhioù moneiz hag ar bilhedoù.",
  ficheEntoure: "Kelc'hia ar pezh a zo ezhomm evit paeañ resis",
  ficheMoinsTitre: 'An nebeutañ a bezhioù hag a vilhedoù.',
  fichePourPayer: 'Evit paeañ',
  ficheMoinsConsigne: "kelc'hia lizherenn an hini a implij an nebeutañ a bezhioù hag a vilhedoù.",
  ficheComparerTitre: "Keñveria ar yalc'hoù.",
  ficheComparerConsigne: "Piv en deus ar muiañ a arc'hant ? Kelc'hia e anv (pe an daou ma o deus kement all).",
  ficheRendreTitre: 'Pegement a vez distroet dit ?',
  ficheA: 'da',
  ficheOnTeRend: 'Distroet e vo dit',
  ficheConvertirTitre: 'Leunia.',
  // corrigé : après les sommes données pour « Entoure les pièces et les billets »
  corrigeUneSolution: '(un diskoulm e-touez re all)', // br: à relire
}
