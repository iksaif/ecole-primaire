// Textes de l'interface — page d'accueil (breton). Traduction automatique : voir nav.ts.
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/accueil.ts'

export default {
  bienvenue: 'Degemer mat ! 👋',
  accroche: 'Poelladennoù etrewezhiat evit adwelet ha mont war-raok en ur zudiañ, ha fichennoù da voullañ.',
  maClasse: 'Ma c\'hlas', // br: à relire
  toutes: 'An holl',
  enConstruction: 'Ar poelladennoù hag ar fichennoù a zo o vezañ adkemeret war un diazez nevez : ne ziskouez ar stumm-mañ nemet ar pajennoù diazez.', // br: à relire
  reglages: 'Arventennoù',
  reglagesDesc: 'Yezh, klas, nodrezh ar fichennoù', // br: à relire
  regionaleDesc: 'Lizherenneg, niveroù, deizioù ha mizioù', // br: à relire
  nouveautes: 'Nevezentioù', // br: à relire
  nouveautesDesc: 'Ar pezh a cheñch war al lec\'hienn', // br: à relire
} satisfies Traductions<typeof fr>
