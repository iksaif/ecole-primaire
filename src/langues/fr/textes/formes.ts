// Textes de l'interface — les formes (français) : la page et le jeu. Source des clés : br/textes/formes.ts doit avoir exactement les mêmes.
// Le nom des formes, les couleurs et la fiche (titre, consignes) sont dans le catalogue de contenu de l'exercice : src/exercices/formes/
// textes.ts. Mots communs (niveau, nombre de questions…) : section `communs`.
export default {
  titre: 'Les formes',
  description: 'Trier, reconnaître puis nommer le disque, le carré, le triangle et le rectangle',
  niveau: {
    ps: '🐣 PS — trier',
    ms: '🌱 MS — reconnaître',
    gs: '🌳 GS — nommer',
  },
  exercice: 'Exercice',
  // les quatre exercices : nom et description
  mode: { meme: 'La même forme', reconnaitre: 'Reconnaître', compter: 'Compter les côtés', trouver: 'Trouver la forme' },
  modeDesc: {
    meme: 'Trouve la forme pareille au modèle',
    reconnaitre: 'Trouve le nom de la forme',
    compter: 'Combien de côtés a cette forme ?',
    trouver: "Montre la forme qu'on te demande",
  },
  noteFichePS: 'Fiche : colorie toutes les formes pareilles au modèle.',
  noteFiche: 'Fiche : colorie chaque forme de sa couleur, puis compte-les.',
  consigneMeme: 'Touche la forme qui est pareille.',
  commentSappelle: "Comment s'appelle cette forme ?",
  combienCotes: 'Combien de côtés a cette forme ?',
  montre: 'Montre le {nom}',
  // corrections ; {nom} : le nom de la forme dans la langue du contenu
  erreurMeme: '❌ Regarde bien la forme du modèle',
  erreurNom: "❌ C'est un {nom}",
  erreurForme: "❌ C'était le {nom}",
  erreurAucunCote: "❌ Un {nom} n'a aucun côté droit",
  erreurCotes: { one: '❌ Un {nom} a {n} côté', other: '❌ Un {nom} a {n} côtés' },
  // nom accessible des formes à choisir (sans trahir la réponse)
  choixForme: 'Forme {n}',
} as const
