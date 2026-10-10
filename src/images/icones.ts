// Les icônes d'interface (Phosphor Icons, MIT : https://phosphoricons.com), par rôle : une action ou une notion de l'interface = une
// icône, la même partout (« imprimer » porte toujours l'imprimante). Le nom de gauche est celui qu'on écrit dans le code (<Icone nom>),
// celui de droite le nom Phosphor. Graisse bold ; la version pleine (fill) seulement pour un état actif ou sélectionné (REMPLIES).
// Une icône de plus : l'écrire ici, puis `node scripts/generer/icones.ts` (src/images/README.md). Les contenus (domaines, objets,
// retours) ne sont pas ici : ce sont des emojis (tables.ts).
export const ICONES = {
  // la barre, le menu et le pied de page
  recherche: 'magnifying-glass', langue: 'translate', classe: 'backpack', verrou: 'lock', reglages: 'gear', accueil: 'house',
  tous: 'globe', outils: 'wrench', fiches: 'file-text', programme: 'books', menu: 'list', fermer: 'x', nouveautes: 'sparkle',
  info: 'info', bug: 'bug', code: 'code', courriel: 'envelope', mentions: 'scales',
  // les pages Programme et Compétence, les types de ressources
  competence: 'target', lien: 'link', references: 'book-open', ressources: 'toolbox', exercice: 'game-controller', affiche: 'image',
  page: 'compass',
  // les vues (cartes, liste, tableau), reprendre où l'on en était
  vueCartes: 'squares-four', vueListe: 'list-bullets', vueTableau: 'table', reprendre: 'play',
} as const

/** Le nom d'une icône de la table. */
export type NomIcone = keyof typeof ICONES

/** Les icônes qui ont aussi leur version pleine (état actif ou sélectionné). */
export const REMPLIES: readonly NomIcone[] = []
