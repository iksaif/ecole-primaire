// Textes de l'interface — la monnaie (breton). Traduction automatique : les passages marqués « br: à relire » sont à faire vérifier
// par un brittophone (`npm run i18n:relecture`).
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/monnaie.ts'

export default {
  titre: 'Ar moneiz',
  description: 'Kontañ ha paeañ gant euroioù',
  options: 'Dibarzhioù',
  eurosEntiers: 'Euro hepken',
  avecCentimes: 'Gant santimoù',
  afficherTotal: 'Diskouez ar sammad e-keit ma lakaan an arc\'hant', // br: à relire
  aideFiche: 'Er fichenn e vo ar poelladennoù dibabet.', // br: à relire
  combienArgent: "Pegement a arc'hant a zo ?",
  exemple: 'sk. : 3,50 €',
  euros: 'Euroioù', // br: à relire
  centimes: 'Santimoù', // br: à relire
  tuPeuxEcrire: 'Gallout a rez skrivañ « 3,50 € » pe « 3 € 50 c ».',
  composer1: 'Klik war ar pezhioù moneiz hag ar bilhedoù evit ober',
  moins1: 'Paea',
  moins2: 'gant',
  moins3: 'an nebeutañ posubl',
  moins4: 'a bezhioù moneiz hag a vilhedoù',
  combienRendre: 'Pegement a vo distroet dit ? Diskouez anezhañ gant ar pezhioù moneiz hag ar bilhedoù.',
  plateauVide: 'Da voneiz a zeuio amañ',
  enlever: 'Tennañ',
  ajouter: 'Ouzhpennañ',
  total: 'Sammad',
  toutEnlever: '🗑 Tennañ pep tra',
  rappel: "Dalc'h soñj",
  quiPlus: "Piv en deus ar muiañ a arc'hant ?",
  autantDeux: 'Kement o-daou',
  ilYa: '{s} a zo.',
  astuceCompter: 'Tun : kont ar bilhedoù da gentañ, ha goude ar pezhioù moneiz bras.',
  noublie: "N'ankouaha ket",
  astuceConvertir: "1 € = 100 c : an euro a ya a-raok ar skej, ar santimoù war-lerc'h (atav 2 sifr : 2 € 5 c = 2,05 €).", // br: à relire
  aSomme: ' :',
  astuceComparer: "N'eo ket an niver a bezhioù a gont, met o zalvoudegezh !",
  avecMoins: 'Gant an nebeutañ a bezhioù hag a vilhedoù :',
  uneBonne: 'Ur respont mat :',
  astuceRendre: 'Kontañ a reer eus {prix} betek {paye} : mankout a ra {cible}.',
  astuceMoins: 'Tun : kemer da gentañ ar bilhed pe ar pezh moneiz brasañ posubl.',
  pasTout: "N'eo ket mat c'hoazh… Sell ouzh ar reizhadenn.",
  ecrisSomme: 'Skriv ar sammad evel « 3,50 € » pe « 3 € 50 c ».',
  auLieuDe: "Graet ec'h eus {t} e-lec'h {c}.",
  tropDePieces: "{t} eo, mat 👍 met gallout a reer paeañ gant {n} pezh pe bilhed hepken.", // br: à relire
  ilManque: "Graet ec'h eus {t} : mankout a ra {m}.",
  deTrop: "Graet ec'h eus {t} : {m} re a zo.", // br: à relire
  autantArgent: "Kement a arc'hant o deus o-daou : {s}.",
  lePlus: "Gant {nom} emañ ar muiañ a arc'hant.",
  passer: 'Tremen ⏭',
  passe: '(tremenet)',
  type_compter: '🔢 Kontañ ur sammad',
  type_composer: '🧩 Ober ur sammad',
  type_moins: '🪙 An nebeutañ a bezhioù',
  type_rendre: '🛒 Distreiñ ar moneiz',
  type_comparer: '👛 Keñveriañ',
  type_convertir: '🔁 1 € = 100 c',
} satisfies Traductions<typeof fr>
