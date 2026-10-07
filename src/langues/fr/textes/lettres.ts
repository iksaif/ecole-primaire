// Textes de l'interface — les lettres (français) : la page et le jeu. Source des clés : br/textes/lettres.ts doit avoir exactement les mêmes.
// La fiche (titre, consigne, alphabet) est dans le catalogue de contenu de l'exercice : src/exercices/lettres/textes.ts.
export default {
  titre: 'Les lettres',
  description: 'Reconnaître les lettres et les associer en capitale, script et attaché',
  exercice: 'Exercice',
  mode: { reconnaitre: 'Écoute et trouve', majuscule: 'Associe les écritures' },
  modeDesc: { reconnaitre: 'On dit le nom d’une lettre, tu la montres', majuscule: 'Trouve la même lettre dans une autre écriture' },
  lettres: 'Lettres',
  groupe: { voyelles: 'Voyelles', consonnes: 'Consonnes', toutes: 'Toutes' },
  ecritures: 'Écritures',
  ecriture: { 'capitale-script': 'Capitale et script (A, a)', 'script-cursive': 'Script et attaché' },
  en: { capitale: 'en capitale', script: 'en script', cursive: 'en attaché' },
  // la voix dit le nom de la lettre ; l'écran ne la montre pas (sinon on la retrouverait sans la connaître)
  montreMoi: 'Montre-moi la lettre {l}.',
  ecouteEtTrouve: 'Écoute, et montre la lettre.',
  trouveEn: 'Trouve cette lettre {en}.',
  cEst: 'C’est la lettre {l}.',
  cetait: "❌ C'était : {r}",
  noteFiche: 'Fiche : relie chaque majuscule à sa minuscule.',
} as const
