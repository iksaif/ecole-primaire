// Textes de l'interface — les formes (breton). Traduction automatique : les passages marqués « br: à relire » sont à faire vérifier par un
// brittophone (`npm run i18n:relecture`).
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/formes.ts'

export default {
  titre: 'Ar stummoù',
  description: "Rummañ, anavezout hag envel ar bladenn, ar c'harrez, an tric'horn hag ar skouergorneg", // br: à relire
  niveau: {
    ps: '🐣 PS — rummañ', // br: à relire
    ms: '🌱 MS — anavezout', // br: à relire
    gs: '🌳 GS — envel', // br: à relire
  },
  exercice: 'Poelladenn',
  mode: {
    meme: 'An hevelep stumm', // br: à relire
    reconnaitre: 'Anaout',
    compter: "Kontañ ar c'hostezioù", // br: à relire
    trouver: 'Kavout ar stumm',
  },
  modeDesc: {
    meme: 'Kav ar stumm heñvel ouzh ar patrom', // br: à relire
    reconnaitre: 'Kav anv ar stumm',
    compter: 'Pet kostez en deus ar stumm-mañ ?', // br: à relire
    trouver: 'Diskouez ar stumm a vez goulennet',
  },
  noteFichePS: 'Fichenn : liv an holl stummoù heñvel ouzh ar patrom.', // br: à relire
  noteFiche: 'Fichenn : liv pep stumm gant e liv, ha kont anezho.', // br: à relire
  consigneMeme: 'Stok ouzh ar stumm a zo heñvel.', // br: à relire
  commentSappelle: 'Petra eo anv ar stumm-mañ ?',
  combienCotes: 'Pet kostez en deus ar stumm-mañ ?', // br: à relire
  montre: 'Diskouez : {nom}',
  erreurMeme: '❌ Sell mat ouzh stumm ar patrom', // br: à relire
  erreurNom: '❌ Ar respont mat a oa {nom}',
  erreurForme: '❌ Ar respont mat a oa {nom}',
  erreurAucunCote: '❌ {nom} : kostez eeun ebet', // br: à relire (« kostez » = côté d'un polygone)
  erreurCotes: { other: '❌ {nom} : niver a gostezioù = {n}' }, // br: à relire (« kostez » = côté d'un polygone)
  choixForme: 'Stumm {n}', // br: à relire
} as const satisfies Traductions<typeof fr>
