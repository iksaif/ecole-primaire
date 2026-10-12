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
} as const
