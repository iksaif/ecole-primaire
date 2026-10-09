// Textes de l'interface — confiance dans les traductions (français) : le réglage, la pastille des fiches. Échelle : src/langues/confiance.ts.
// Source des clés : br/textes/confiance.ts doit avoir exactement les mêmes.
export default {
  titre: 'Fiabilité des traductions',
  aide: 'Les fiches en {langue} sont traduites automatiquement ou relues, à des degrés divers. Choisissez le niveau minimum des fiches à montrer.',
  minimum: 'Montrer les fiches traduites au moins :',
  niveaux: {
    enseignant: { nom: 'Relue par un·e enseignant·e', court: 'Relue ens.', aide: 'Relue et validée par un·e enseignant·e de {langue}.' },
    brittophone: { nom: 'Relue par un·e locuteur·rice', court: 'Relue', aide: 'Relue par une personne qui parle {langue}.' },
    dictionnaire: { nom: 'Mots vérifiés', court: 'Mots vérifiés', aide: 'Mots et expressions simples, chacun vérifié dans un dictionnaire ou une source en ligne.' },
    simple: { nom: 'Automatique, très simple', court: 'Auto simple', aide: 'Traduction automatique de mots et de phrases très courts : très probablement correcte.' },
    automatique: { nom: 'Automatique, non vérifiée', court: 'Auto', aide: 'Traduction automatique, phrases longues ou grammaire : des erreurs sont probables.' },
  },
  pastille: 'Traduction {niveau}/4',
  masquee: 'masquée',
  masquees: '{n} fiches cachées : leur traduction n’est pas assez sûre.',
  regler: 'Régler',
} as const
