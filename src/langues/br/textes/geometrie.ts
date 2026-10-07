// Textes de l'interface — la géométrie (breton). Traduction automatique : les passages marqués « br: à relire » sont à faire vérifier par un
// brittophone (`npm run i18n:relecture`).
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/geometrie.ts'

export default {
  titre: 'Mentoniezh',
  description: 'Kemparzhded, karrezennoù, stummoù ha solidennoù',
  optionsSym: 'Dibarzhioù ar gemparzhded',
  axeV: 'Ahel a-serzh hepken',
  axeH: 'Ahel a-blaen ivez',
  modele: 'Skouer',
  aToi: 'Da dro !',
  astuceEquerre: 'Tun : gwiri gant da skouer pe gant korn ur follenn !',
  aucunBtn: 'Hini ebet',
  legJuste: 'mat',
  legOubliee: 'ankouaet',
  legEnTrop: 're',
  passer: 'Tremen ⏭',
  passe: '(tremenet)',
  effacer: '🧽 Diverkañ',
  exercices: {
    symetrie: '🦋 Kemparzhded',
    reproduction: '✏️ Adtresañ', // br: à relire
    reperage: "📍 Lec'hiañ",
    figures: '🔷 Stummoù',
    solides: '🧊 Soludoù', // br: à relire
    angles: '📐 Kornioù skouer',
    proprietes: '📋 Perzhioù',
    cercle: "⭕ Kelc'h",
    patrons: "🎲 Patromoù ar c'hub", // br: à relire
  },
} as const satisfies Traductions<typeof fr>
