// Textes de l'interface — les ceintures de compétences (français). Source des clés : br/textes/ceintures.ts doit avoir exactement les mêmes.
export default {
  titre: 'Ceintures',
  // le nom de chaque couleur, toujours écrit à côté de la ceinture (la couleur ne porte jamais seule l'information) : « Ceinture verte »
  couleur: {
    blanche: 'blanche', jaune: 'jaune', orange: 'orange', verte: 'verte', bleue: 'bleue', marron: 'marron', noire: 'noire', rouge: 'rouge',
    rose: 'rose', violette: 'violette',
    palier1: 'niveau 1', palier2: 'niveau 2', palier3: 'niveau 3', palier4: 'niveau 4', palier5: 'niveau 5',
  },
  ceinture: 'Ceinture {couleur}',
  palette: {
    judo: 'Judo (7) : blanche à noire',
    'judo-rouge': 'Judo et rouge (8)',
    'rose-violet': 'Rose à violette (6)',
    paliers: 'Sans couleur : cinq niveaux',
  },
  style: { ruban: 'Ruban noué', bandeau: 'Bandeau', rond: 'Rond (gommette)' },
  // l'option (onglet « Appareil » des réglages) : cachée par défaut, comme le mode enseignant
  activer: {
    titre: 'Ceintures de compétences (en option)',
    aide: 'Des paliers de couleur pour suivre ses progrès : des fiches à imprimer (livret, brevets, ceintures à découper, tableau de la classe) et, plus tard, des brevets à passer à l’écran. Cachées tant qu’on ne les active pas.',
    case: 'Proposer les ceintures sur cet appareil',
    parSite: 'Ce site les propose d’office.',
  },
  // les réglages communs : page des réglages (onglet « Fiches ») et « Sur la fiche » des exercices
  reglage: {
    titre: 'Ceintures',
    aide: 'La palette et le dessin des ceintures, pour toutes les fiches de ceintures. Le nom de la couleur est toujours écrit à côté.',
    palette: 'Couleurs',
    style: 'Dessin',
    noirEtBlanc: 'Noir et blanc (des motifs à la place des couleurs)',
    nb: 'Nombre de ceintures',
    seuil: 'Pour réussir un brevet',
    seuilValeur: '{n} % de bonnes réponses',
    questions: 'Questions d’un brevet',
    chronometre: 'Chronomètre',
    chrono: { aucun: 'Aucun', doux: 'Doux', strict: 'Strict' },
  },
} as const
