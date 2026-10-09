// Compter les objets — textes de CONTENU : le nom des objets comptés (au pluriel, tel qu'il s'écrit après « Combien y a-t-il de … ? »)
// et ce que la fiche écrit (titre, consignes). Lus par T (générateur, fiche) ; la vue passe par `traducteur(CONTENU, …)`. Les
// textes de l'INTERFACE (réglages, retours du jeu) sont dans src/langues/<langue>/textes/compter.ts.
// En breton, le nom d'un objet est au singulier après « pet » : « Pet aval a zo ? ».
import { catalogue } from '../../langues/catalogue.ts'

export const CONTENU = catalogue({
  titre: 'Compter les objets',
  consigneEcrire: 'Compte les objets et écris le nombre dans la case.',
  consigneEntourer: 'Compte les objets et entoure le bon nombre.',
  objet: {
    pomme: 'pommes',
    etoile: 'étoiles',
    chat: 'chats',
    fleur: 'fleurs',
    voiture: 'voitures',
    papillon: 'papillons',
    grenouille: 'grenouilles',
    fraise: 'fraises',
    poisson: 'poissons',
    lune: 'lunes',
  },
}, {
  br: {
    titre: 'Kontañ an traoù',
    consigneEcrire: 'Kont an traoù ha skriv an niver er gaoued.',
    consigneEntourer: 'Kont an traoù ha kelc\'h an niver mat.', // br: à relire (consigne : forme de l’académie de Rennes, « Kelc’h(it) », « Klok(ait) »)
    objet: {
      pomme: 'aval',
      etoile: 'steredenn',
      chat: 'kazh',
      fleur: 'bleunienn',
      voiture: 'karr',
      papillon: 'balafenn',
      grenouille: 'glesker', // br: à relire (ou « ran »)
      fraise: 'sivienn',
      poisson: 'pesk',
      lune: 'loar',
    },
  },
})
