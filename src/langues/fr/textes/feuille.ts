// Textes de l'interface — feuille d'une fiche prête (français) : /telechargements/<slug>.
// Source des clés : br/textes/feuille.ts doit avoir exactement les mêmes.
export default {
  fil: 'Fil d’Ariane',
  accueil: 'Accueil',
  retour: '← Fiches toutes prêtes : {matiere}',
  retourIndex: '← Toutes les fiches à imprimer',
  // aperçu
  apercu: 'Aperçu',
  apercuPage: 'Aperçu de {titre}, page {n} sur {total}',
  apercuAide: 'Flèches gauche et droite : changer de page',
  page: 'Page {n} sur {total}',
  precedente: 'Page précédente',
  suivante: 'Page suivante',
  fiche: 'Fiche {n}',
  fiches: 'Exemplaires de la fiche',
  // actions
  telecharger: '⬇️ Télécharger',
  imprimer: '🖨️ Imprimer',
  format: 'Format',
  detailPdf: { one: 'PDF {format} · {n} page · {taille}', other: 'PDF {format} · {n} pages · {taille}' },
  imprimerAide: 'Imprimez en « taille réelle » (100 %), sans « ajuster à la page ».',
  personnaliser: '✏️ Personnaliser',
  personnaliserAide: '« Personnaliser » ouvre l’exercice avec ses réglages : changez-les, faites autant de fiches que vous voulez.',
  enLigne: '🎮 Faire en ligne',
  // même fiche, autres langues
  memeFiche: 'Même fiche :',
  bilingue: 'bilingue',
  // infos
  classes: 'Classes',
  imprimable: 'imprimable',
  exemple: 'exemple',
  competence: { one: '🎯 Compétence', other: '🎯 Compétences' },
  competenceToutes: 'Toutes les ressources de cette compétence',
  programmeOfficiel: '📚 programme officiel',
  programmePage: 'programme officiel, page {page}',
  nouvelOnglet: '(s’ouvre dans un nouvel onglet)',
  // voisines
  voisines: 'Fiches voisines',
  memeCompetence: 'Même compétence',
  memeDomaine: 'Même domaine : {domaine}',
  aucuneCompetence: 'Aucune autre fiche pour cette compétence.',
  aucuneDomaine: 'Aucune autre fiche dans ce domaine.',
  chargementVoisines: 'Recherche des fiches voisines…',
  // états
  titre: 'Fiche',
  chargement: 'Chargement de la fiche…',
  introuvable: 'Cette fiche n’existe pas (ou plus).',
  absent: 'La liste des fiches est introuvable pour le moment.',
  erreur: 'La fiche n’a pas pu être lue : {message}',
  reessayer: 'Réessayer',
  voirToutes: 'Voir toutes les fiches',
} as const
