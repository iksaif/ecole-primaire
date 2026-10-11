// Les icônes d'interface, par rôle : une action ou une notion de l'interface = une icône, la même partout (« imprimer » porte toujours
// l'imprimante). Ce sont des emojis OpenMoji en couleur (décision du 2026-10-11 : une interface pour enfants en couleur, plutôt que
// des pictogrammes au trait), dans une table à part de celle des contenus (tables.ts) : leurs dessins sont dans un lot léger
// (donnees/interface.ts) que charge le paquet principal, sans les dessins des fiches. Le nom de gauche est celui qu'on écrit dans le
// code (<Icone nom>), le code de droite celui du fichier OpenMoji (comme dans tables.ts). Une icône de plus : l'écrire ici, puis
// `node scripts/generer/icones.ts` (src/images/README.md).
export const ICONES = {
  // la barre, le menu et le pied de page ; E250 : « hamburger menu » (extras d'OpenMoji, même licence)
  recherche: '1F50D', langue: '1F5E3', classe: '1F392', verrou: '1F512', reglages: '2699', accueil: '1F3E0', tous: '1F310',
  outils: '1F6E0', fiches: '1F4C4', programme: '1F4DA', menu: 'E250', fermer: '2716', nouveautes: '1F195', info: '2139',
  bug: '1F41B', code: '1F4BB', courriel: '2709', mentions: '1F4DC',
  // les pages Programme et Compétence, les types de ressources
  competence: '1F3AF', lien: '1F517', references: '1F4D6', ressources: '1F9F0', exercice: '1F3AE', affiche: '1F5BC', page: '1F9ED',
  // les vues (cartes, liste, tableau), reprendre où l'on en était
  vueCartes: '1F5C2', vueListe: '1F4CB', vueTableau: '1F4D1', reprendre: '23EF',
  // les boutons d'action
  commencer: '25B6', rejouer: '1F504', annuler: '21A9', imprimer: '1F5A8', nouvelle: '1F3B2', ajouter: '2795', dossier: '1F4C2',
  telecharger: '2B07', personnaliser: '1F39B', indice: '1F441', ecouter: '1F50A', effacer: '1F9FD', vider: '1F5D1', appareil: '1F4F1',
  automatique: '1F916', valide: '2714', crayon: '270F', visite: '1F5FA',
  // les rubriques de « À propos »
  police: '1F524', contribuer: '1F91D',
  // la page des réglages
  profil: '1F464', chantier: '1F6A7',
} as const

/** Le nom d'une icône de la table. */
export type NomIcone = keyof typeof ICONES

/** En emojis de l'appareil, le caractère d'une icône qui n'a pas d'emoji (le menu : ☰, un trigramme, n'en est pas un). */
export const CARACTERES: Readonly<Partial<Record<NomIcone, string>>> = { menu: '☰' }
