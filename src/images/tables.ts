// Les emojis que le site affiche, par nom : une faute de frappe ne compile pas, et le script `scripts/generer/images.ts` n'importe
// que ces fichiers-là. Deux sources : OpenMoji (code = nom du fichier de la version d'OpenMoji, en majuscules, sans le sélecteur FE0F final ; une touche garde le sien au milieu :
// `0031-FE0F-20E3`),
// et nos dessins « maison » au même style quand OpenMoji n'a pas ce qu'il faut (code `maison:<nom>` = src/images/maison/<nom>.svg ;
// règles de dessin : src/images/maison/README.md). Un emoji se rend avec le rendu que reçoit le dessin (`ctx.images` d'une affiche,
// `images` d'une fiche : `svg(…)` ou `html(…)`, src/images/rendu.ts). Un emoji de plus : l'écrire ici, puis
// `node scripts/generer/images.ts` (src/images/README.md). Il garde un seul sens : jamais un même nom pour deux choses différentes à l'écran.
export const EMOJIS = {
  // objets à compter, à nommer
  pomme: '1F34E', etoile: '2B50', fleur: '1F338', coccinelle: '1F41E', chat: '1F431', arbre: '1F333',
  // couleurs (un objet de la couleur)
  baleine: '1F433', citron: '1F34B', grenouille: '1F438', carotte: '1F955', raisin: '1F347', cochon: '1F437', chataigne: '1F330',
  chatNoir: '1F408-200D-2B1B', bonhommeDeNeige: '2603', elephant: '1F418',
  // la journée
  bol: '1F963', soleil: '2600', lune: '1F319', doudou: '1F9F8', bain: '1F6C1', toboggan: '1F6DD',
  croissant: '1F950', repas: '1F37D', gouter: '1F36A', pates: '1F35D', lit: '1F6CF', brosseADents: '1FAA5', ecole: '1F3EB',
  // le corps et les cinq sens
  visage: '1F642', deuxYeux: '1F440', oeil: '1F441', oreille: '1F442', nez: '1F443', bouche: '1F444', langue: '1F445', sourire: '1F601',
  mainOuverte: '1F590', main: '270B', bras: '1F4AA', jambe: '1F9B5', pied: '1F9B6',
  // dessins maison : OpenMoji n'a ni le cou, ni le tronc, ni le ventre
  cou: 'maison:cou', tronc: 'maison:tronc', ventre: 'maison:ventre',
  // les pronoms personnels sujets
  leveLaMain: '1F64B', montreDuDoigt: '1F449', petitEnfant: '1F9D2', garcon: '1F466', fille: '1F467', quelquun: '1F464',
  // l'hygiène
  mainsOuvertes: '1F450', goutte: '1F4A7', savon: '1F9FC', bulles: '1FAE7', eclaboussures: '1F4A6', papier: '1F9FB', coureur: '1F3C3', salade: '1F957', eternuement: '1F927',
  // les cycles de vie, l'eau
  oeuf: '1F95A', poussinQuiEclot: '1F423', poussin: '1F425', poule: '1F414', graine: '1FAD8', pousse: '1F331', plantePot: '1FAB4', tournesol: '1F33B',
  glacon: '1F9CA',
  // les objets des solides
  de: '1F3B2', boite: '1F4E6', ballon: '26BD', conserve: '1F96B', glace: '1F366', pyramide: 'E20F', // E20F : « great pyramid of giza » (extras d'OpenMoji, même licence)
  // l'alphabet (français : src/affiches/alphabet/lettres.ts ; breton : src/langues/br/donnees.ts) ; pomme, soleil, maison, étoile, glace
  // (« crème »), pâtes, glaçon, œuf, goutte (« dour »), lune, école, poule et zèbre sont plus haut ou partagés
  abeille: '1F41D', ballonDeBaudruche: '1F388', canard: '1F986', dauphin: '1F42C', escargot: '1F40C', fraise: '1F353', gorille: '1F98D',
  hibou: '1F989', tableau: '1F5BC', jus: '1F9C3', koala: '1F428', lion: '1F981', maison: '1F3E0', nuage: '2601', orange: '1F34A',
  quilles: '1F3B3', renard: '1F98A', tortue: '1F422', usine: '1F3ED', vache: '1F404', wagon: '1F683', taxi: '1F695', stylo: '1F58A',
  zebre: '1F993', fete: '1F389', sapinDeNoel: '1F384', repere: '1F4CD', ile: '1F3DD', mais: '1F33D', hotel: '1F3E8', boussole: '1F9ED',
  myrtilles: '1FAD0', medaille: '1F947',
  pain: '1F35E', chocolat: '1F36B', scarabee: '1FAB2', flocon: '2744', chevre: '1F410', eglise: '26EA', girafe: '1F992', chien: '1F415',
  vague: '1F30A', nid: '1FABA', oignon: '1F9C5', poisson: '1F41F', roue: '1F6DE', chiffreUn: '0031-FE0F-20E3', calendrier: '1F4C5',
  // la météo et les saisons (soleil, nuage, flocon et pousse sont plus haut)
  pluie: '1F327', vent: '1F4A8', feuillesMortes: '1F342',
  // les objets à compter et comparer (src/dessins/collections.ts) ; pomme, étoile, chat, fleur, grenouille, fraise, lune, goûter
  // (le biscuit) et ballon de baudruche sont plus haut
  voiture: '1F697', papillon: '1F98B', poissonTropical: '1F420',
  // les frises à continuer (src/exercices/motifs/) ; étoile, lune, soleil, nuage, pomme, raisin, fraise, chat, fleur, tournesol sont plus haut
  rondRouge: '1F534', rondBleu: '1F535', rondJaune: '1F7E1', rondVert: '1F7E2', carreRouge: '1F7E5', carreBleu: '1F7E6', carreJaune: '1F7E8',
  carreVert: '1F7E9', banane: '1F34C', chiot: '1F436', lapin: '1F430', ours: '1F43B', trefle: '1F340', champignon: '1F344',
  coeurRouge: '2764', coeurBleu: '1F499', coeurJaune: '1F49B', coeurVert: '1F49A', triangleRouge: '1F53A',
  // les achats de la monnaie (src/exercices/monnaie/) ; pomme, jus, chocolat, ballon, voiture, doudou et dé sont plus haut
  billetEuro: '1F4B6', crayon: '270F', bonbon: '1F36C', baguette: '1F956', cahier: '1F4D2', feutre: '1F58D', puzzle: '1F9E9',
  livre: '1F4D5', peinture: '1F3A8', trottinette: '1F6F4', rollers: '1F6FC', casque: '1F3A7',
  // les marqueurs des titres des fiches (géométrie, mesures, heure, ranger) ; papillon, crayon, repère, glaçon, dé, calendrier plus haut
  losangeBleu: '1F537', equerre: '1F4D0', presseFeuilles: '1F4CB', cercleRouge: '2B55', attention: '26A0', regle: '1F4CF',
  reflexion: '1F914', repetition: '1F501', egal: '1F7F0', balance: '2696', verreDeLait: '1F95B', horloge: '1F550', flecheHaut: '2B06',
  flecheBas: '2B07',
  // les objets de la balance (src/exercices/mesures/masses.ts) ; boîte, doudou, bonbon, orange plus haut
  cadeau: '1F381', cle: '1F511', pasteque: '1F349', citrouille: '1F383',
  // trier les images (src/exercices/trier/) ; les animaux, fruits, objets et nourritures déjà plus haut ne sont pas répétés
  patte: '1F43E', pas: '1F463', plume: '1FAB6', panier: '1F9FA', cintre: '1FA9D', route: '1F6E3',
  tshirt: '1F455', pantalon: '1F456', robe: '1F457', echarpe: '1F9E3', gant: '1F9E4', chaussette: '1F9E6',
  bus: '1F68C', velo: '1F6B2', avion: '2708', bateau: '26F5',
  aigle: '1F985', requin: '1F988', cheval: '1F434', souris: '1F401', singe: '1F412',
  buche: '1FAB5', chaise: '1FA91', porte: '1F6AA', echelle: '1FA9C', engrenage: '2699', cloche: '1F514', cuillere: '1F944',
  pageBlanche: '1F4C4', journal: '1F4F0', enveloppe: '2709', pelote: '1F9F6', fenetre: '1FA9F', lunettes: '1F453', ampoule: '1F4A1', pot: '1FAD9',
  os: '1F9B4', herbe: '1F33F', miel: '1F36F', fromage: '1F9C0',
  // corrections après relecture : exemples des boîtes de « trier », valise, balance
  chapeau: '1F452', chaussure: '1F45F', viande: '1F356', flacon: '1F9F4', seau: '1FAA3', gobelet: '1F964', ancre: '2693', ecrou: '1F529', verreAVin: '1F377',
  pierre: '1FAA8', valise: '1F9F3',
} as const

/** Les emojis qui sont une scène en carré plein (la ville au coucher du soleil) : rendus aux coins arrondis, pas comme un objet détouré. */
export const SCENES: readonly NomEmoji[] = []

/** Le nom d'un emoji de la table. */
export type NomEmoji = keyof typeof EMOJIS
