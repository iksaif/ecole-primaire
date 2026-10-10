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
} as const

/** Les emojis qui sont une scène en carré plein (la ville au coucher du soleil) : rendus aux coins arrondis, pas comme un objet détouré. */
export const SCENES: readonly NomEmoji[] = []

/** Le nom d'un emoji de la table. */
export type NomEmoji = keyof typeof EMOJIS
