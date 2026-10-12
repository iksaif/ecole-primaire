// Les icônes d'interface, par rôle : une action ou une notion de l'interface (y compris les identités du catalogue : domaines, matières,
// exercices, profils) = une icône, la même partout ; deux rôles peuvent montrer le même emoji (📚 : le programme et le vocabulaire) (« imprimer » porte toujours
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
  // les retours : juste, faux, presque, bravos, messages de fin
  coche: '2705', croix: '274C', attention: '26A0', fete: '1F389', applaudissements: '1F44F', etoileBrillante: '1F31F', trophee: '1F3C6',
  muscle: '1F4AA', intello: '1F913',
  // les modes, niveaux et types des exercices, les boutons du jeu
  arbre: '1F333', passer: '23ED', pouce: '1F44D', clin: '1F609', yeux: '1F440', crayonCire: '1F58D', biscuit: '1F36A', egal: '1F7F0',
  glacon: '1F9CA', cercle: '2B55', presseFeuilles: '1F4CB', reflexion: '1F914', verreDeLait: '1F95B', briques: '1F9F1', carreBleu: '1F7E6',
  flecheDroite: '27A1', piece: '1FA99', caddie: '1F6D2', portemonnaie: '1F45B', panier: '1F9FA', gateau: '1F370', echelle: '1FA9C',
  flecheDouble: '2194', chrono: '23F1', majuscules: '1F520', oreille: '1F442', question: '2753', interdit: '1F6AB', coureur: '1F3C3',
  doigtDroite: '1F449', doigtGauche: '1F448', reveil: '23F0', feminin: '2640', lettreA: '1F170', livreFerme: '1F4D5', loupeDroite: '1F50E',
  masques: '1F3AD', fin: '1F51A', detective: '1F575', tortue: '1F422', lievre: '1F407', singeYeux: '1F648', stop: '23F9', pincee: '1F90F',
  ampoule: '1F4A1', papillon: '1F98B', lion: '1F981', microscope: '1F52C', parchemin: '1F4DC',
  // la page des réglages
  profil: '1F464', chantier: '1F6A7',
  // les identités du catalogue : domaines, matières, exercices et affiches, badges, profils, site (src/ressources/emojis.ts…)
  equerre: '1F4D0', balance: '2696', chiffres: '1F522', mainQuiEcrit: '270D', stylo: '1F58A', losange: '1F537', pizza: '1F355',
  poigneeDeMains: '1F91D', punaise: '1F4CD', etiquette: '1F3F7', bulle: '1F4AC', silhouette: '1F464', horloge: '1F550',
  regle: '1F4CF', livreOuvert: '1F4D6', minuscules: '1F521', billets: '1F4B6', boucle: '1F501', cent: '1F4AF', lettres: '1F524',
  puzzle: '1F9E9', terre: '1F30D', barres: '1F4F6', multiplication: '2716', livres: '1F4DA', personneDebout: '1F9CD',
  palette: '1F3A8', poussin: '1F423', goutte: '1F4A7', carton: '1F4E6', savon: '1F9FC', leverDeSoleil: '1F305',
  calendrier: '1F4C5', meteo: '1F326', calendrierSpirale: '1F5D3', dix: '1F51F', silhouettes: '1F465', boulier: '1F9EE',
  graphique: '1F4CA', ordinateur: '1F4BB', boussole: '1F9ED', parole: '1F5E3', pousse: '1F331', coeur: '1FAC0',
  eprouvette: '1F9EA', engrenage: '2699', monument: '1F3DB', carte: '1F5FA', tableau: '1F5BC', notes: '1F3B6', etoile: '2B50',
  blocNotes: '1F4DD', manette: '1F3AE', imprimante: '1F5A8', feuille: '1F4C4', travaux: '1F6A7', enfant: '1F9D2',
  famille: '1F468-200D-1F469-200D-1F467', enseignant: '1F9D1-200D-1F3EB', de: '1F3B2',
} as const

/** Le nom d'une icône de la table. */
export type NomIcone = keyof typeof ICONES

/** En emojis de l'appareil, le caractère d'une icône qui n'a pas d'emoji (le menu : ☰, un trigramme, n'en est pas un). */
export const CARACTERES: Readonly<Partial<Record<NomIcone, string>>> = { menu: '☰' }
