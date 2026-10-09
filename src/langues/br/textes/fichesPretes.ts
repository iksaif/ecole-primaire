// Textes de l'interface — fiches toutes prêtes (breton). Traduction automatique : tout est à faire relire par un brittophone
// (`npm run i18n:relecture`).
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/fichesPretes.ts'

export default {
  titre: 'Fichennoù prest — {matiere}', // br: à relire
  titreIndex: 'An holl fichennoù da voullañ', // br: à relire
  intro: 'PDF da bellgargañ ha da voullañ, hep reglañ netra. Evit cheñch ur fichenn, digorit anezhi ha klikit war « Personelaat ».', // br: à relire
  introIndex: 'Holl fichennoù prest al lec’hienn, danvez dre zanvez, eus A betek Z.', // br: à relire
  fil: 'Roudenn', // br: à relire
  accueil: 'Degemer',
  fichesPretes: 'Fichennoù prest', // br: à relire
  matieres: { maths: 'Matematik', francais: 'Galleg', monde: 'Ar Bed', regionale: 'Yezh rannvroel' }, // br: à relire
  filtres: 'Silañ ar fichennoù', // br: à relire
  rechercher: 'Klask', // br: à relire
  exemple: 'sk. eur, taolennoù, boas', // br: à relire
  classe: 'Klas', // br: à relire
  toutesClasses: '🌐 An holl glasoù', // br: à relire
  usage: 'Implij', // br: à relire
  tous: '🌐 An holl', // br: à relire
  apprendre: '🖼️ Da ziskouez', // br: à relire
  sentrainer: '✏️ Evit en em ober', // br: à relire
  domaine: 'Domani', // br: à relire
  tousDomaines: '🌐 An holl zomanioù', // br: à relire
  langue: 'Yezh', // br: à relire
  toutesLangues: '🌐 An holl', // br: à relire
  bilingue: 'Divyezhek', // br: à relire
  compteurClasses: { other: '{n} fichenn evit {classes}' }, // br: à relire
  compteurToutes: { other: '{n} fichenn, an holl glasoù' }, // br: à relire
  liste: 'Fichennoù', // br: à relire
  pdfPages: { other: 'PDF · {n} pajenn' }, // br: à relire
  pages: { other: '{n} pajenn' }, // br: à relire
  badgeExemple: 'skouer', // br: à relire
  colonnes: { titre: 'Titl', domaine: 'Domani', classes: 'Klasoù', pages: 'Pajennoù', actions: 'Obererezhioù' }, // br: à relire
  ouvrir: 'Digeriñ', // br: à relire
  ouvrirTitre: 'Digeriñ : {titre}', // br: à relire
  chargement: 'O kargañ ar fichennoù…', // br: à relire
  vide: 'Ar fichennoù prest a zeu : n’eus ket c’hoazh war al lec’hienn-mañ. An ekzersizoù da voullañ a c’haller personelaat dija eus pep danvez.', // br: à relire
  videMatiere: 'N’eus fichenn brest ebet c’hoazh en danvez-mañ.', // br: à relire
  absent: 'N’eo ket bet kavet roll ar fichennoù evit poent.', // br: à relire
  absentDev: 'E-pad an diorren, krouit anezhi gant « npm run fiches:dev », ha kargit ar bajenn en-dro.', // br: à relire
  erreur: 'Ne c’helled ket lenn ar fichennoù : {message}', // br: à relire
  reessayer: 'Klask en-dro', // br: à relire
  aucune: 'N’eus fichenn ebet gant ar silioù-mañ.', // br: à relire
  effacer: 'Adlakaat pep tra evel a-raok', // br: à relire
  personnaliserTitre: 'Ur fichenn diouzh ho ment ho peus ezhomm ?', // br: à relire
  personnaliserTexte: 'Dibabit an niveroù, niver al linennoù, ouzhpennit ur reizhadur : an ekzersizoù a c’haller personelaat diwar pajenn an danvez.', // br: à relire
  personnaliser: 'Personelaat ho fichennoù →', // br: à relire
  toutesLesFiches: 'An holl fichennoù, eus A betek Z', // br: à relire
  lienPied: 'Fichennoù prest', // br: à relire
} satisfies Traductions<typeof fr>
