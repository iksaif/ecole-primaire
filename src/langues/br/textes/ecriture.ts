// Textes de l'interface — écriture (breton). Mêmes clés que fr/textes/ecriture.ts. Traduction automatique : chaque texte marqué
// « br: à relire » est à faire vérifier par un brittophone (`npm run i18n:relecture`).
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/ecriture.ts'

export default {
  titre: 'Fichennoù skrivañ',
  description: "Linennoù Seyès : ar skouer, lizherennoù da dremen warno, linennoù evit skrivañ e-unan", // br: à relire
  // br: à relire (« repasser » = tremen war, « copier seul » = eilskrivañ e-unan)
  intro: "Linennoù Seyès (evel er c'haier klas), ur skouer e du e penn pep linenn, lizherennoù gris da dremen warno ha goude linennoù da eilskrivañ e-unan.",
  ecritures: "Doare skrivañ (meur a zibab a c'haller ober)", // br: à relire
  style: {
    'script-maj': 'Skript, pennlizherennoù',
    'script-min': 'Skript, lizherennoù bihan',
    'attache-maj': 'A-stag, pennlizherennoù',
    'attache-min': 'A-stag, lizherennoù bihan',
  },
  contenu: 'Danvez', // br: à relire
  contenus: { lettres: '🔤 Lizherennoù ha sifroù', mots: '📝 Gerioù', texte: '📄 Frazennoù' },
  lettres: 'Lizherennoù',
  familles: 'Familhoù lizherennoù', // br: à relire
  famille: {
    alphabet: 'Lizherenneg',
    voyelles: 'Vogalennoù',
    rondes: 'Lizherennoù ront (c o a d g q)',
    boucles: 'Lagadennoù (e l b h k f)',
    coupes: 'Kopoù (i u t)', // br: à relire — « coupe » (trait en creux de l'écriture), traduit littéralement par kop (coupe, gobelet)
    ponts: 'Pontoù (m n v w x y)',
    jambages: 'Lostoù (j p g q y f z)', // br: à relire — « jambage » (trait qui descend sous la ligne), rendu par lost (queue)
    particulieres: 'Dibar (r s z x)',
    accents: 'Lizherennoù gant tired ha œ', // br: à relire — « tired » pour accent, à confirmer (pourrait être « sin »)
    chiffres: 'Sifroù',
  },
  alphabetRegional: 'Lizherenneg ar {nom}', // br: à relire
  lier: 'En a-stag lizherennoù bihan, liammañ al lizherennoù a dri e tri (aaa)', // br: à relire
  mots: 'Gerioù (unan dre linenn : anv-bihan, gerioù ar sizhun…)',
  listes: 'Rolloù prest', // br: à relire
  liste: { jours: 'Deizioù ar sizhun', mois: 'Mizioù ar bloaz', nombres: 'Niveroù 1 → 10', couleurs: 'Livioù', famille: 'Familh' },
  listeEnFrancais: '🇫🇷 {nom} e galleg', // br: à relire
  texte: 'Frazennoù pe un destennig (ur rannbennad dre linenn)', // br: à relire
  titreFiche: 'Titl ar fichenn', // br: à relire
  titreAuto: 'Emgefre : « Skrivañ — » hag an doareoù skrivañ dibabet', // br: à relire
  taille: 'Ment al linennoù',
  interligne: { i2: "2 mm (CE2 ha muioc'h)", i25: '2,5 mm (CE1)', i3: '3 mm (CP)', i4: '4 mm (evit kregiñ)' }, // br: à relire (débutant)
  espacement: 'Esaouiñ', // br: à relire (espacement)
  uneSurDeux: 'Ul linenn diwar zaou', // br: à relire
  chaqueLigne: 'Pep linenn',
  repasser: 'Linennoù da dremen warno (gris)', // br: à relire
  copie: 'Linennoù da eilskrivañ e-unan', // br: à relire
  couleurLignes: 'Liv al linennoù',
  couleur: 'Liv',
  gris: 'Gris (moullerez du ha gwenn)',
  polices: 'Nodrezhoù', // br: à relire — « nodrezh » (terme officiel pour police de caractères)
  policeScript: 'Skript',
  policeAttache: 'A-stag',
} satisfies Traductions<typeof fr>
