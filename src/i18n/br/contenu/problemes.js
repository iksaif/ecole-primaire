// Contenu généré — problèmes (breton). Traduction automatique : les passages marqués « br: à relire »
// sont à faire vérifier par un brittophone (`npm run i18n:relecture`).
// Nombres en chiffres, nom au singulier après un nombre, tournures simples avec « kaout » (en deus / he deus).
// Paramètres : voir src/i18n/fr/contenu/problemes.js.
import { regles } from '../../regles.js'

const R = regles('br')
const deus = p => (p.g === 'f' ? 'he deus' : 'en deus')   // il/elle a
const doa = p => (p.g === 'f' ? 'he doa' : 'en doa')      // il/elle avait
const gant = p => (p.g === 'f' ? 'ganti' : 'gantañ')      // avec lui/elle
const nb = R.nombre

export default {
  // langue du contenu (accords des unités : regles(langue))
  langue: 'br',
  // prénoms bretons (aucun ne commence par une consonne mutable après « da »)
  prenoms: [
    { nom: 'Yann', g: 'm' }, { nom: 'Nolwenn', g: 'f' }, { nom: 'Erwan', g: 'm' }, { nom: 'Aziliz', g: 'f' },
    { nom: 'Ronan', g: 'm' }, { nom: 'Enora', g: 'f' }, { nom: 'Elouan', g: 'm' }, { nom: 'Lena', g: 'f' },
    { nom: 'Lomig', g: 'm' }, { nom: 'Yuna', g: 'f' }, { nom: 'Riwal', g: 'm' }, { nom: 'Sterenn', g: 'f' },
    { nom: 'Iwan', g: 'm' }, { nom: 'Soazig', g: 'f' }, { nom: 'Noan', g: 'm' }, { nom: 'Anna', g: 'f' },
  ],
  // br: à relire (« skritell » = autocollant)
  objets: [
    { id: 'bille', s: 'bilhenn' }, { id: 'carte', s: 'kartenn' }, { id: 'image', s: 'skeudenn' }, { id: 'perle', s: 'perlezenn' },
    { id: 'autocollant', s: 'skritell' }, { id: 'coquillage', s: 'kregenn' }, { id: 'bonbon', s: 'bonbon' }, { id: 'timbre', s: 'timbr' },
  ],
  // br: à relire (« gwispidenn » = biscuit)
  paquets: [
    { id: 'gateau', s: 'gwastell' }, { id: 'image', s: 'skeudenn' }, { id: 'carte', s: 'kartenn' },
    { id: 'biscuit', s: 'gwispidenn' }, { id: 'crayon', s: 'kreion' }, { id: 'bonbon', s: 'bonbon' },
  ],
  // un : « un/une … » avec mutation, s : nom, g : genre (kaout), partie — pas de tricycle en breton
  chosesAParties: { // br: à relire
    velo: { un: "Ur marc'h-houarn", s: "marc'h-houarn", g: 'm', partie: 'rod' },
    voiture: { un: 'Ur wetur', s: 'gwetur', g: 'f', partie: 'rod' },
    chien: { un: "Ur c'hi", s: 'ki', g: 'm', partie: 'pav' },
    main: { un: 'Un dorn', s: 'dorn', g: 'm', partie: 'biz' },
    etoile: { un: 'Ur steredenn-vor', s: 'steredenn-vor', g: 'f', partie: "brec'h" },
  },
  // possessif « e » (à lui) / « he » (à elle) avec la mutation correspondante
  parents: [['e vamm', 'he mamm'], ['e dad', 'he zad'], ['e voereb', 'he moereb'], ['e eontr', 'he eontr']],
  // le nom reste au singulier après un nombre
  unites: {
    timbre: 'timbr', passager: 'beajour', page: 'pajenn', bonbon: 'bonbon', livre: 'levr', enfant: 'bugel',
    euro: 'euro', point: 'poent', eleve: 'skoliad', poire: 'perenn', animal: 'loen',
    chaise: 'kador', carre: 'karrez', feutre: 'kreion', equipe: 'skipailh', boite: 'boest', voiture: 'karr',
    morceau: 'tamm', feuille: 'follenn', an: 'bloaz', ballon: 'balon', image: 'skeudenn', pomme: 'aval',
  },
  donc: 'neuze',

  // ─── Ajout / retrait ───
  ajoutGain: ({ p, o, a, b }) => `${p.nom} ${deus(p)} ${a} ${o.s}. E-pad ar ratre e c'hounez ${b} all.`,
  ajoutGainQ: ({ p, o }) => `Pet ${o.s} ${deus(p)} bremañ ?`,
  // br: à relire (mutations après e/he)
  timbres: ({ p, a, b }) => `${p.nom} ${deus(p)} ${a} timbr en ${p.g === 'f' ? 'he dastumad' : 'e zastumad'}. Evit ${p.g === 'f' ? 'he deiz-ha-bloaz' : 'e zeiz-ha-bloaz'} e resev ${b} timbr all.`,
  timbresQ: ({ p }) => `Pet timbr ${deus(p)} bremañ ?`,
  busRetrait: ({ a, b }) => `Er bus ez eus ${a} beajour. En arsav e ziskenn ${b} beajour.`,
  busRetraitQ: 'Pet beajour a chom er bus ?',
  livrePages: ({ p, a, b }) => `En ul levr ez eus ${a} pajenn. ${p.nom} ${deus(p)} lennet ${b} anezho dija.`,
  livrePagesQ: 'Pet pajenn a chom da lenn ?',
  initialGain: ({ p, o, b, c }) => `${p.nom} ${deus(p)} gounezet ${b} ${o.s}. Bremañ ${deus(p)} ${c} ${o.s}.`,
  initialGainQ: ({ p, o }) => `Pet ${o.s} ${doa(p)} da gentañ ?`,
  initialPerte: ({ p, b, c }) => `${p.nom} ${deus(p)} debret ${b} bonbon. Chom a ra ${c} bonbon ${gant(p)}.`,
  initialPerteQ: ({ p }) => `Pet bonbon ${doa(p)} da gentañ ?`,
  bibliotheque: ({ b, c }) => `Ar miz-mañ ez eus bet prestet ${b} levr gant levraoueg ar skol. Chom a ra ${c} levr el levraoueg.`,
  bibliothequeQ: 'Pet levr a oa el levraoueg e deroù ar miz ?',
  cour: ({ a, c }) => `E deroù ar ratre ez eus ${a} bugel er porzh. Bugale all a zeu. Bremañ ez eus ${c} bugel er porzh.`,
  courQ: 'Pet bugel a zo deuet ?',
  tirelire: ({ p, a, c }) => `${p.nom} ${doa(p)} ${a} euro. Prenet ${deus(p)} ur c'hoari. Bremañ e chom ${c} euro ${gant(p)}.`,
  tirelireQ: "Pegement e koust ar c'hoari ?",
  partiePoints: ({ p, a, c }) => `E deroù ar c'hoari ${deus(p)} ${p.nom} ${a} poent. E dibenn ar c'hoari ${deus(p)} ${c} poent.`,
  partiePointsQ: ({ p }) => `Pet poent ${deus(p)} gounezet e-pad ar c'hoari ?`,

  // ─── Comparaison ───
  combienA2: ({ p2, o }) => `Pet ${o.s} ${deus(p2)} ${p2.nom} ?`,
  compPlus: ({ p1, p2, o, a, b }) => `${p1.nom} ${deus(p1)} ${a} ${o.s}. ${p2.nom} ${deus(p2)} ${b} ${o.s} muioc'h eget ${p1.nom}.`,
  compMoins: ({ p1, p2, o, a, b }) => `${p1.nom} ${deus(p1)} ${a} ${o.s}. ${p2.nom} ${deus(p2)} ${b} ${o.s} nebeutoc'h eget ${p1.nom}.`,
  compEcart: ({ p1, p2, o, a, c }) => `${p1.nom} ${deus(p1)} ${a} ${o.s}. ${p2.nom} ${deus(p2)} ${c} ${o.s}.`,
  compEcartQ: ({ p1, p2, o }) => `Pet ${o.s} ${deus(p2)} ${p2.nom} muioc'h eget ${p1.nom} ?`,
  compInverse: ({ p1, p2, o, a, b }) => `${p1.nom} ${deus(p1)} ${a} ${o.s}. ${p1.nom} ${deus(p1)} ${b} ${o.s} muioc'h eget ${p2.nom}.`,
  ecoles: ({ a, b }) => `E skol Kerlann ez eus ${a} skoliad. E skol Penhoat ez eus ${b} skoliad muioc'h.`,
  ecolesQ: 'Pet skoliad a zo e skol Penhoat ?',
  velo: ({ a, b }) => `Ur marc'h-houarn bras a goust ${a} euro. Ur marc'h-houarn bihan a goust ${b} euro nebeutoc'h.`,
  veloQ: "Pegement e koust ar marc'h-houarn bihan ?",

  // ─── Parties et tout ───
  classe: ({ a, b }) => `Er c'hlas ez eus ${a} plac'h ha ${b} paotr.`,
  classeQ: "Pet skoliad a zo er c'hlas ?",
  // br: à relire (« frouezhenn », « perenn » au singulatif)
  panier: ({ a, c }) => `En ur paner ez eus ${c} frouezhenn : avaloù ha per. ${a} aval a zo.`,
  panierQ: 'Pet perenn a zo ?',
  couleurs: ({ p, o, a, c }) => `${p.nom} ${deus(p)} ${c} ${o.s}. ${a} anezho a zo ruz hag ar re all a zo glas.`,
  couleursQ: 'Pet anezho a zo glas ?',
  ferme: ({ a, b }) => `Ur feurmer en deus ${a} yar ha ${b} houad.`,
  fermeQ: 'Pet loen en deus en holl ?',
  // br: à relire (« oadour » = adulte)
  cinema: ({ a, c }) => `Er sinema ez eus ${c} arvester : oadourien ha bugale. ${a} oadour a zo.`,
  cinemaQ: 'Pet bugel a zo ?',

  // ─── Multiplication ───
  paquetsAchat: ({ p, o, n, k }) => `${p.nom} a bren ${n} pakad. E pep pakad ez eus ${k} ${o.s}.`,
  paquetsAchatQ: ({ p, o }) => `Pet ${o.s} ${deus(p)} en holl ?`,
  chaises: ({ n, k }) => `Evit an abadenn ez eus ${n} renkad kadorioù. E pep renkad ez eus ${k} kador.`,
  chaisesQ: 'Pet kador a zo en holl ?',
  parties: ({ ch, k }) => `${ch.un} ${ch.g === 'f' ? 'he deus' : 'en deus'} ${k} ${ch.partie}.`,
  partiesQ: ({ ch, n }) => `Pet ${ch.partie} o deus ${n} ${ch.s} ?`, // br: à relire
  feutres: ({ p, n, k }) => `Ur voestad kreion a goust ${k} euro. ${p.nom} a bren ${n} boestad kreion.`,
  feutresQ: ({ p }) => `Pet euro a rank ${p.nom} paeañ ?`,
  // br: à relire (« tablezenn » = tablette)
  chocolat: ({ n, k }) => `Ur dablezenn chokolad he deus ${n} renkad. E pep renkad ez eus ${k} karrez.`,
  chocolatQ: 'Pet karrez chokolad a zo en dablezenn ?',
  feuilles: ({ k }) => `En ur pakad ez eus ${k} follenn.`,
  feuillesQ: ({ n }) => `Pet follenn a zo e ${n} pakad ?`,

  // ─── Partage / groupements ───
  partageAmis: ({ p, o, k, t }) => `${p.nom} ${deus(p)} ${t} ${o.s}. Rannañ a ra anezho etre ${k} mignon. Pep mignon a resev ar memes niver.`,
  partageAmisQ: ({ o }) => `Pet ${o.s} a resev pep mignon ?`,
  partageAmisC: ({ o, q, k, t }) => `${k} × ${q} = ${t}, neuze pep mignon a resev ${nb(q, o)}`,
  partageGroupes: ({ fem, k, t }) => `${fem ? 'Ar skolaerez' : 'Ar skolaer'} a ro ${t} kreion da ${k} strollad. Pep strollad a resev ar memes niver.`,
  partageGroupesQ: 'Pet kreion a resev pep strollad ?',
  partageGroupesC: ({ q, k, t }) => `${k} × ${q} = ${t}, neuze pep strollad a resev ${nb(q, 'kreion')}`,
  groupementC: ({ q, k, t, u }) => `${q} × ${k} = ${t}, neuze ${nb(q, u)}`,
  album: ({ p, k, t }) => `${p.nom} a stag ${t} luc'hskeudenn en un albom. Lakaat a ra ${k} luc'hskeudenn war pep pajenn.`,
  albumQ: ({ p }) => `Pet pajenn a leunia ${p.nom} ?`,
  equipes: ({ k, t }) => `Evit ur c'hoari, ${t} bugel a ra skipailhoù. E pep skipailh ez eus ${k} bugel.`,
  equipesQ: 'Pet skipailh a zo ?',
  livresAchat: ({ p, k, t }) => `${p.nom} ${deus(p)} ${t} euro. Ul levr a goust ${k} euro. Gant ${p.g === 'f' ? 'he' : 'e'} holl arc'hant e pren levrioù.`,
  livresAchatQ: ({ p }) => `Pet levr a bren ${p.nom} ?`,
  oeufs: ({ p, k, t }) => `${p.nom} ${deus(p)} ${t} vi. Lakaat a ra anezho e boestoù. E pep boest e lak ${k} vi.`,
  oeufsQ: ({ p }) => `Pet boest a c'hall ${p.nom} leuniañ penn-da-benn ?`,
  oeufsC: ({ q, k, reste }) => `${q} × ${k} = ${q * k} ; chom a ra ${reste} vi, re nebeut evit ur voest ouzhpenn`,
  sortie: ({ k, t }) => `${t} bugel a ya e baleadenn. Pep karr a c'hall kas ${k} bugel.`,
  sortieQ: 'Pet karr a zo ezhomm evit kas an holl vugale ?',
  sortieC: ({ q, k, reste }) => `${q} × ${k} = ${q * k} ; chom a ra ${reste} bugel, ret eo kaout ur c'harr ouzhpenn : ${q} + 1 = ${q + 1}`,
  ruban: ({ k, t }) => `Ur seizenn he deus ${t} cm a hirder. Troc'hañ a reer anezhi e tammoù a ${k} cm.`, // br: à relire
  rubanQ: 'Pet tamm a vo ?',

  // ─── « Fois plus » ───
  // br: à relire (« gwech kement ha » = fois plus que)
  foisPlus: ({ p1, p2, o, a, k }) => `${p1.nom} ${deus(p1)} ${a} ${o.s}. ${p2.nom} ${deus(p2)} ${k} gwech kement ha ${p1.nom}.`,
  manteau: ({ a, k }) => `Ur roched a goust ${a} euro. Ur vantell a goust ${k} gwech kement hag ar roched.`, // br: à relire
  manteauQ: 'Pegement e koust ar vantell ?',
  // br: à relire (« bloaz » sans mutation après le chiffre ; « gwech koshoc'h »)
  age: ({ p, a, k, parent }) => {
    const x = parent[p.g === 'f' ? 1 : 0]
    return `${p.nom} ${deus(p)} ${a} bloaz. ${x[0].toUpperCase() + x.slice(1)} a zo ${k} gwech koshoc'h ${p.g === 'f' ? 'egeti' : 'egetañ'}.`
  },
  ageQ: ({ p, parent }) => `Pe oad eo ${parent[p.g === 'f' ? 1 : 0]} ?`,

  // ─── Plusieurs étapes ───
  resteEurosQ: ({ p }) => `Pet euro a chom ${gant(p)} ?`,
  busMaintenantQ: 'Pet beajour a zo er bus bremañ ?',
  achats: ({ p, a, b, c }) => `${p.nom} ${deus(p)} ${a} euro. Prenañ a ra ul levr a goust ${b} euro hag ur stilo a goust ${c} euro.`,
  bus2: ({ a, b, c }) => `Er bus ez eus ${a} beajour. Er c'hentañ arsav e pign ${b} beajour. En eil arsav e ziskenn ${c} beajour.`,
  imagesDon: ({ p1, p2, n, k, d }) => `${p1.nom} a bren ${n} pakad. E pep pakad ez eus ${k} skeudenn. ${p1.nom} a ro ${d} skeudenn da ${p2.nom}.`,
  imagesDonQ: ({ p1 }) => `Pet skeudenn a chom gant ${p1.nom} ?`,
  total2: ({ p1, p2, o, a, b }) => `${p1.nom} ${deus(p1)} ${a} ${o.s}. ${p2.nom} ${deus(p2)} ${b} ${o.s} muioc'h eget ${p1.nom}.`,
  total2Q: ({ p1, p2, o }) => `Pet ${o.s} o deus ${p1.g === 'f' && p2.g === 'f' ? 'o-div' : 'o-daou'} ?`,
  pommes: ({ a, b, c }) => `Ur feurmer a zastum ${a} aval d'al Lun ha ${b} aval d'ar Meurzh. D'ar Merc'her e werzh ${c} anezho.`,
  pommesQ: 'Pet aval a chom gantañ ?',
  achats3: ({ p, a, n, k, c }) => `${p.nom} ${deus(p)} ${a} euro. Prenañ a ra ${n} kaier a goust ${k} euro pep hini, hag ur reolenn a goust ${c} euro.`,
  bus3: ({ a, b, c, d }) => `Er bus ez eus ${a} beajour. Er c'hentañ arsav e pign ${b} beajour. En eil arsav e ziskenn ${c} beajour. En trede arsav e pign ${d} beajour.`,
  ballons: ({ fem, n, k, b, c }) => `Evit ar fest, ${fem ? 'ar skolaerez' : 'ar skolaer'} a bren ${n} pakad. E pep pakad ez eus ${k} balon. ${b} balon a darzh. Goude-se e pren ${c} balon all.`,
  ballonsQ: 'Pet balon a zo bremañ ?',
}
