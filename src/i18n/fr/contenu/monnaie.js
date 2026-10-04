// Contenu généré — la monnaie (français) : énoncés, objets à acheter, prénoms, fiche.
// Mêmes clés que src/i18n/br/contenu/monnaie.js (vérifier avec `npm run i18n`).
// Paramètres : somme, prix, paye, items, ta, tb = sommes déjà écrites (« 3 € 50 c ») ; e = emoji de l'objet.

export default {
  // objets à acheter, rangés par prix plausible (même ordre dans chaque langue, emojis dans la vue) ;
  // pluriel : « des bonbons qui coûtent »
  objets: {
    pasCher: [{ nom: 'une pomme' }, { nom: 'un crayon' }, { nom: 'des bonbons', pluriel: true }, { nom: 'un jus de fruits' }, { nom: 'une baguette' }],
    moyen: [{ nom: 'une tablette de chocolat' }, { nom: 'un cahier' }, { nom: 'un ballon' }, { nom: 'des feutres', pluriel: true }, { nom: 'une petite voiture' }],
    cher: [{ nom: 'un ours en peluche' }, { nom: 'un puzzle' }, { nom: 'un livre' }, { nom: 'une boîte de peinture' }],
    tresCher: [{ nom: 'une trottinette' }, { nom: 'des rollers', pluriel: true }, { nom: 'un grand jeu de société' }, { nom: 'un casque audio' }],
  },
  // « Tu achètes une pomme qui coûte 2 € »
  coute: ({ pluriel }) => (pluriel ? 'qui coûtent' : 'qui coûte'),
  // deux porte-monnaie à comparer
  prenoms: [['Léa', 'Tom'], ['Inès', 'Hugo'], ['Jade', 'Noah'], ['Chloé', 'Lucas'], ['Emma', 'Adam'], ['Lina', 'Gabriel']],
  // nom d'une pièce ou d'un billet (v en centimes), pour les lecteurs d'écran et les infobulles
  nomArgent: ({ v }) => {
    if (v >= 500) return `billet de ${v / 100} €`
    if (v >= 100) return `pièce de ${v / 100} €`
    return `pièce de ${v} centime${v > 1 ? 's' : ''}`
  },

  // ─── Questions (historique, corrections) ───
  compterQ: 'Compter : {items}',
  composerQ: 'Faire {somme}',
  moinsQ: 'Payer {somme} avec le moins possible',
  rendreQ: '{e} {prix}, payé avec {paye}',
  comparerQ: '{a} ({ta}) ou {b} ({tb}) ?',
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
}
