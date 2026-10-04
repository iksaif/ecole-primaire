// Contenu généré — problèmes (français) : énoncés, questions, données (prénoms, objets).
// Mêmes clés que src/i18n/br/contenu/problemes.js (vérifier avec `npm run i18n`).
// Chaque énoncé reçoit ses paramètres : p, p1, p2 = prénom { nom, g }, o = objet de `objets` ou `paquets`,
// a, b, c, d, n, k, q, t, reste = nombres. Clé « xxx » = énoncé, « xxxQ » = question, « xxxC » = calcul.
import { regles } from '../../regles.js'

const R = regles('fr')
const il = p => (p.g === 'f' ? 'elle' : 'il')
const Il = p => (p.g === 'f' ? 'Elle' : 'Il')
const de = R.de                 // « de billes », « d'images »
const que = p => R.que(p.nom)   // « que Léo », « qu'Emma »
const nb = R.nombre             // « 1 bille », « 3 billes »

export default {
  prenoms: [
    { nom: 'Léo', g: 'm' }, { nom: 'Emma', g: 'f' }, { nom: 'Inès', g: 'f' }, { nom: 'Noah', g: 'm' },
    { nom: 'Jade', g: 'f' }, { nom: 'Adam', g: 'm' }, { nom: 'Lina', g: 'f' }, { nom: 'Hugo', g: 'm' },
    { nom: 'Chloé', g: 'f' }, { nom: 'Yanis', g: 'm' }, { nom: 'Mila', g: 'f' }, { nom: 'Sacha', g: 'm' },
    { nom: 'Zoé', g: 'f' }, { nom: 'Malo', g: 'm' }, { nom: 'Aya', g: 'f' }, { nom: 'Nathan', g: 'm' },
    { nom: 'Louise', g: 'f' }, { nom: 'Gabriel', g: 'm' }, { nom: 'Rose', g: 'f' }, { nom: 'Mohamed', g: 'm' },
    { nom: 'Ambre', g: 'f' }, { nom: 'Timéo', g: 'm' }, { nom: 'Lou', g: 'f' }, { nom: 'Éliott', g: 'm' },
  ],
  // objets que l'on collectionne / échange (id commun aux langues)
  objets: [
    { id: 'bille', s: 'bille', p: 'billes', g: 'f' }, { id: 'carte', s: 'carte', p: 'cartes', g: 'f' },
    { id: 'image', s: 'image', p: 'images', g: 'f' }, { id: 'perle', s: 'perle', p: 'perles', g: 'f' },
    { id: 'autocollant', s: 'autocollant', p: 'autocollants', g: 'm' }, { id: 'coquillage', s: 'coquillage', p: 'coquillages', g: 'm' },
    { id: 'bonbon', s: 'bonbon', p: 'bonbons', g: 'm' }, { id: 'timbre', s: 'timbre', p: 'timbres', g: 'm' },
  ],
  // contenu d'un paquet
  paquets: [
    { id: 'gateau', s: 'gâteau', p: 'gâteaux', g: 'm' }, { id: 'image', s: 'image', p: 'images', g: 'f' },
    { id: 'carte', s: 'carte', p: 'cartes', g: 'f' }, { id: 'biscuit', s: 'biscuit', p: 'biscuits', g: 'm' },
    { id: 'crayon', s: 'crayon', p: 'crayons', g: 'm' }, { id: 'bonbon', s: 'bonbon', p: 'bonbons', g: 'm' },
  ],
  // « Un vélo a 2 roues » : objet → parties
  chosesAParties: {
    velo: { s: 'vélo', p: 'vélos', g: 'm', partie: { s: 'roue', p: 'roues' } },
    tricycle: { s: 'tricycle', p: 'tricycles', g: 'm', partie: { s: 'roue', p: 'roues' } },
    voiture: { s: 'voiture', p: 'voitures', g: 'f', partie: { s: 'roue', p: 'roues' } },
    chien: { s: 'chien', p: 'chiens', g: 'm', partie: { s: 'patte', p: 'pattes' } },
    main: { s: 'main', p: 'mains', g: 'f', partie: { s: 'doigt', p: 'doigts' } },
    etoile: { s: 'étoile de mer', p: 'étoiles de mer', g: 'f', partie: { s: 'bras', p: 'bras' } },
  },
  // « Sa maman est 3 fois plus âgée qu'elle » : sujet, complément, accord de « âgé »
  parents: [
    { sujet: 'Sa maman', nom: 'la maman', e: 'e' }, { sujet: 'Son papa', nom: 'le papa', e: '' },
    { sujet: 'Sa tante', nom: 'la tante', e: 'e' }, { sujet: 'Son oncle', nom: "l'oncle", e: '' },
  ],
  // unités des réponses (singulier, ou { s, p } si le pluriel n'est pas en -s)
  unites: {
    timbre: 'timbre', passager: 'passager', page: 'page', bonbon: 'bonbon', livre: 'livre', enfant: 'enfant',
    euro: 'euro', point: 'point', eleve: 'élève', poire: 'poire', animal: { s: 'animal', p: 'animaux' },
    chaise: 'chaise', carre: 'carré', feutre: 'feutre', equipe: 'équipe', boite: 'boîte', voiture: 'voiture',
    morceau: { s: 'morceau', p: 'morceaux' }, feuille: 'feuille', an: 'an', ballon: 'ballon', image: 'image', pomme: 'pomme',
  },
  // « 2 + 2 + 2 = 6, donc 3 × 2 = 6 »
  donc: 'donc',

  // ─── Ajout / retrait ───
  ajoutGain: ({ p, o, a, b }) => `${p.nom} a ${a} ${o.p}. À la récréation, ${il(p)} en gagne ${b}.`,
  ajoutGainQ: ({ p, o }) => `Combien ${de(o.p)} a-t-${il(p)} maintenant ?`,
  timbres: ({ p, a, b }) => `${p.nom} a ${a} timbres dans sa collection. Pour son anniversaire, on lui offre ${b} timbres.`,
  timbresQ: ({ p }) => `Combien de timbres a-t-${il(p)} maintenant ?`,
  busRetrait: ({ a, b }) => `Dans le bus, il y a ${a} passagers. À l'arrêt, ${b} ${b >= 2 ? 'passagers descendent' : 'passager descend'}.`,
  busRetraitQ: 'Combien de passagers reste-t-il dans le bus ?',
  livrePages: ({ p, a, b }) => `Un livre a ${a} pages. ${p.nom} en a déjà lu ${b}.`,
  livrePagesQ: 'Combien de pages lui reste-t-il à lire ?',
  initialGain: ({ p, o, b, c }) => `${p.nom} avait des ${o.p}. ${Il(p)} en a gagné ${b}. Maintenant, ${il(p)} en a ${c}.`,
  initialGainQ: ({ p, o }) => `Combien ${de(o.p)} avait-${il(p)} au début ?`,
  initialPerte: ({ p, b, c }) => `${p.nom} a mangé ${b} bonbons. Il lui en reste ${c}.`,
  initialPerteQ: ({ p }) => `Combien de bonbons avait-${il(p)} au début ?`,
  bibliotheque: ({ b, c }) => `Ce mois-ci, la bibliothèque de l'école a prêté ${b} livres. Il reste ${c} livres sur les étagères.`,
  bibliothequeQ: 'Combien de livres y avait-il sur les étagères au début du mois ?',
  cour: ({ a, c }) => `Au début de la récréation, il y a ${a} enfants dans la cour. D'autres enfants arrivent. Maintenant, il y a ${c} enfants dans la cour.`,
  courQ: "Combien d'enfants sont arrivés ?",
  tirelire: ({ p, a, c }) => `${p.nom} avait ${a} euros dans sa tirelire. ${Il(p)} a acheté un jeu. Maintenant, il lui reste ${c} euros.`,
  tirelireQ: 'Combien a coûté le jeu ?',
  partiePoints: ({ p, a, c }) => `Au début de la partie, ${p.nom} a ${a} points. À la fin de la partie, ${il(p)} a ${c} points.`,
  partiePointsQ: ({ p }) => `Combien de points a-t-${il(p)} gagnés pendant la partie ?`,

  // ─── Comparaison ───
  // « Combien de billes a Emma ? » (p2)
  combienA2: ({ p2, o }) => `Combien ${de(o.p)} a ${p2.nom} ?`,
  compPlus: ({ p1, p2, o, a, b }) => `${p1.nom} a ${a} ${o.p}. ${p2.nom} a ${nb(b, o)} de plus ${que(p1)}.`,
  compMoins: ({ p1, p2, o, a, b }) => `${p1.nom} a ${a} ${o.p}. ${p2.nom} a ${nb(b, o)} de moins ${que(p1)}.`,
  compEcart: ({ p1, p2, o, a, c }) => `${p1.nom} a ${a} ${o.p}. ${p2.nom} en a ${c}.`,
  compEcartQ: ({ p1, p2, o }) => `Combien ${de(o.p)} ${p2.nom} a-t-${il(p2)} de plus ${que(p1)} ?`,
  // comparaison « inversée » : l'énoncé parle de p1, la question de p2
  compInverse: ({ p1, p2, o, a, b }) => `${p1.nom} a ${a} ${o.p}. ${Il(p1)} a ${nb(b, o)} de plus ${que(p2)}.`,
  ecoles: ({ a, b }) => `L'école des Tilleuls a ${a} élèves. L'école des Lilas a ${nb(b, 'élève')} de plus.`,
  ecolesQ: "Combien d'élèves y a-t-il à l'école des Lilas ?",
  velo: ({ a, b }) => `Un vélo coûte ${a} euros. Une trottinette coûte ${nb(b, 'euro')} de moins que le vélo.`,
  veloQ: 'Combien coûte la trottinette ?',

  // ─── Parties et tout ───
  classe: ({ a, b }) => `Dans la classe, il y a ${nb(a, 'fille')} et ${nb(b, 'garçon')}.`,
  classeQ: "Combien d'élèves y a-t-il dans la classe ?",
  panier: ({ a, c }) => `Dans un panier, il y a ${c} fruits : des pommes et des poires. Il y a ${nb(a, 'pomme')}.`,
  panierQ: 'Combien y a-t-il de poires ?',
  couleurs: ({ p, o, a, c }) => `${p.nom} a ${c} ${o.p}. Parmi ces ${o.p}, ${a} ${a >= 2 ? 'sont rouges' : 'est rouge'} et les autres sont ${o.g === 'f' ? 'bleues' : 'bleus'}.`,
  couleursQ: ({ p, o }) => `Combien ${de(o.p)} ${o.g === 'f' ? 'bleues' : 'bleus'} ${p.nom} a-t-${il(p)} ?`,
  ferme: ({ a, b }) => `Dans sa ferme, un fermier a ${nb(a, 'poule')} et ${nb(b, 'canard')}.`,
  fermeQ: "Combien d'animaux a-t-il en tout ?",
  cinema: ({ a, c }) => `Au cinéma, il y a ${c} spectateurs : des adultes et des enfants. Il y a ${nb(a, 'adulte')}.`,
  cinemaQ: "Combien d'enfants y a-t-il ?",

  // ─── Multiplication ───
  paquetsAchat: ({ p, o, n, k }) => `${p.nom} achète ${n} paquets de ${k} ${o.p}.`,
  paquetsAchatQ: ({ p, o }) => `Combien ${de(o.p)} a-t-${il(p)} en tout ?`,
  chaises: ({ n, k }) => `Pour le spectacle, on installe ${n} rangées de ${k} chaises.`,
  chaisesQ: 'Combien de chaises y a-t-il en tout ?',
  // ch = élément de chosesAParties
  parties: ({ ch, k }) => `${ch.g === 'f' ? 'Une' : 'Un'} ${ch.s} a ${k} ${ch.partie.p}.`,
  partiesQ: ({ ch, n }) => `Combien ${de(ch.partie.p)} ont ${n} ${ch.p} ?`,
  feutres: ({ p, n, k }) => `Une boîte de feutres coûte ${k} euros. ${p.nom} achète ${n} boîtes de feutres.`,
  feutresQ: ({ p }) => `Combien d'euros ${p.nom} doit-${il(p)} payer ?`,
  chocolat: ({ n, k }) => `Une tablette de chocolat a ${n} rangées de ${k} carrés.`,
  chocolatQ: 'Combien de carrés de chocolat y a-t-il dans la tablette ?',
  feuilles: ({ k }) => `Un paquet contient ${k} feuilles.`,
  feuillesQ: ({ n }) => `Combien de feuilles y a-t-il dans ${n} paquets ?`,

  // ─── Partage / groupements ───
  partageAmis: ({ p, o, k, t }) => `${p.nom} a ${t} ${o.p}. ${Il(p)} les partage entre ses ${k} amis. Chaque ami reçoit le même nombre ${de(o.p)}.`,
  partageAmisQ: ({ o }) => `Combien ${de(o.p)} reçoit chaque ami ?`,
  partageAmisC: ({ o, q, k, t }) => `${k} × ${q} = ${t}, donc chaque ami reçoit ${nb(q, o)}`,
  // fem : la maîtresse (sinon le maître)
  partageGroupes: ({ fem, k, t }) => `${fem ? 'La maîtresse' : 'Le maître'} distribue ${t} feutres à ${k} groupes. Chaque groupe reçoit le même nombre de feutres.`,
  partageGroupesQ: 'Combien de feutres reçoit chaque groupe ?',
  partageGroupesC: ({ q, k, t }) => `${k} × ${q} = ${t}, donc chaque groupe reçoit ${nb(q, 'feutre')}`,
  // « 4 × 5 = 20, donc 4 pages » (u = unité de la réponse)
  groupementC: ({ q, k, t, u }) => `${q} × ${k} = ${t}, donc ${nb(q, u)}`,
  album: ({ p, k, t }) => `${p.nom} colle ${t} photos dans un album. ${Il(p)} met ${k} photos sur chaque page.`,
  albumQ: ({ p }) => `Combien de pages ${p.nom} remplit-${il(p)} ?`,
  equipes: ({ k, t }) => `Pour un jeu, ${t} enfants forment des équipes de ${k} enfants.`,
  equipesQ: "Combien d'équipes y a-t-il ?",
  livresAchat: ({ p, k, t }) => `${p.nom} a ${t} euros. Un livre coûte ${k} euros. ${Il(p)} dépense tout son argent en livres.`,
  livresAchatQ: ({ p }) => `Combien de livres ${p.nom} achète-t-${il(p)} ?`,
  oeufs: ({ p, k, t }) => `${p.nom} a ${t} œufs. ${Il(p)} les range dans des boîtes de ${k} œufs.`,
  oeufsQ: ({ p }) => `Combien de boîtes ${p.nom} peut-${il(p)} remplir complètement ?`,
  oeufsC: ({ q, k, reste }) => `${q} × ${k} = ${q * k} ; il reste ${reste} œuf${reste > 1 ? 's' : ''}, pas assez pour une boîte de plus`,
  sortie: ({ k, t }) => `${t} enfants partent en sortie. Chaque voiture peut transporter ${k} enfants.`,
  sortieQ: 'Combien de voitures faut-il pour emmener tous les enfants ?',
  sortieC: ({ q, k, reste }) => `${q} × ${k} = ${q * k} ; il reste ${reste} enfant${reste > 1 ? 's' : ''}, il faut une voiture de plus : ${q} + 1 = ${q + 1}`,
  ruban: ({ k, t }) => `Un ruban mesure ${t} cm. On le coupe en morceaux de ${k} cm.`,
  rubanQ: 'Combien de morceaux obtient-on ?',

  // ─── « Fois plus » ───
  foisPlus: ({ p1, p2, o, a, k }) => `${p1.nom} a ${a} ${o.p}. ${p2.nom} a ${k} fois plus ${de(o.p)} ${que(p1)}.`,
  manteau: ({ a, k }) => `Un tee-shirt coûte ${a} euros. Un manteau coûte ${k} fois plus cher que le tee-shirt.`,
  manteauQ: 'Combien coûte le manteau ?',
  age: ({ p, a, k, parent }) => `${p.nom} a ${a} ans. ${parent.sujet} est ${k} fois plus âgé${parent.e} ${p.g === 'f' ? "qu'elle" : 'que lui'}.`,
  ageQ: ({ p, parent }) => `Quel âge a ${parent.nom} ${de(p.nom)} ?`,

  // ─── Plusieurs étapes ───
  resteEurosQ: "Combien d'euros lui reste-t-il ?",
  busMaintenantQ: 'Combien de passagers y a-t-il maintenant dans le bus ?',
  achats: ({ p, a, b, c }) => `${p.nom} a ${a} euros. ${Il(p)} achète un livre à ${nb(b, 'euro')} et un stylo à ${nb(c, 'euro')}.`,
  bus2: ({ a, b, c }) => `Dans le bus, il y a ${a} passagers. Au premier arrêt, ${b} ${b >= 2 ? 'passagers montent' : 'passager monte'}. Au deuxième arrêt, ${c} ${c >= 2 ? 'passagers descendent' : 'passager descend'}.`,
  imagesDon: ({ p1, p2, n, k, d }) => `${p1.nom} achète ${n} paquets de ${k} images. ${Il(p1)} en donne ${d} à ${p2.nom}.`,
  imagesDonQ: ({ p1 }) => `Combien d'images reste-t-il à ${p1.nom} ?`,
  // « à eux deux », « à elles deux »
  total2: ({ p1, p2, o, a, b }) => `${p1.nom} a ${a} ${o.p}. ${p2.nom} en a ${b} de plus ${que(p1)}.`,
  total2Q: ({ p1, p2, o }) => {
    const elles = p1.g === 'f' && p2.g === 'f'
    return `Combien ${de(o.p)} ont-${elles ? 'elles' : 'ils'} à ${elles ? 'elles' : 'eux'} deux ?`
  },
  pommes: ({ a, b, c }) => `Un fermier ramasse ${a} pommes lundi et ${b} pommes mardi. Mercredi, il en vend ${c}.`,
  pommesQ: 'Combien de pommes lui reste-t-il ?',
  achats3: ({ p, a, n, k, c }) => `${p.nom} a ${a} euros. ${Il(p)} achète ${n} cahiers à ${k} euros chacun et une trousse à ${c} euros.`,
  bus3: ({ a, b, c, d }) => `Dans le bus, il y a ${a} passagers. Au premier arrêt, ${b} passagers montent. Au deuxième arrêt, ${nb(c, 'passager')} ${c >= 2 ? 'descendent' : 'descend'}. Au troisième arrêt, ${d} passagers montent.`,
  ballons: ({ fem, n, k, b, c }) => `Pour la fête, ${fem ? 'la maîtresse' : 'le maître'} achète ${n} paquets de ${k} ballons. ${nb(b, 'ballon')} ${b >= 2 ? 'éclatent' : 'éclate'}. Ensuite, ${fem ? 'elle' : 'il'} en achète ${c} autres.`,
  ballonsQ: 'Combien de ballons y a-t-il maintenant ?',
}
