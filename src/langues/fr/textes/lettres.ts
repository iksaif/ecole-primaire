// Textes de l'interface — les lettres (français) : la page et le jeu. Source des clés : br/textes/lettres.ts doit avoir exactement les mêmes.
// La fiche (titre, consigne, alphabet) est dans le catalogue de contenu de l'exercice : src/exercices/lettres/textes.ts.
export default {
  titre: 'Les lettres',
  description: 'Reconnaître et associer majuscules et minuscules',
  exercice: 'Exercice',
  mode: { reconnaitre: 'Reconnaître', majuscule: 'Majuscule / Minuscule' },
  modeDesc: { reconnaitre: "Trouve la lettre qu'on te montre", majuscule: 'Associe la lettre à sa forme' },
  lettres: 'Lettres',
  groupe: { voyelles: 'Voyelles', consonnes: 'Consonnes', toutes: 'Toutes' },
  quelleLettre: 'Quelle lettre est-ce ?',
  quelleMinuscule: 'Quelle est la minuscule ?',
  quelleMajuscule: 'Quelle est la majuscule ?',
  cetait: "❌ C'était : {r}",
  noteFiche: 'Fiche : relie chaque majuscule à sa minuscule.',
} as const
