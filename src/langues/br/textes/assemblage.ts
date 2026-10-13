// Textes de l'interface — la fiche sur mesure (breton). Traduction automatique : à faire relire.
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/assemblage.ts'

export default {
  titre: 'Fichenn diouzh ar muzul', // br: à relire
  intro: 'Strollit war ur follenn nemetañ fichennoù meur a ekzerzh : ul linenn Anv-bihan ha Deiziad, ur reizhadur hepken. Pep ekzerzh a ra gant e reolennoù boas evit ar c’hlas dibabet.', // br: à relire
  exercices: 'Ekzerzhioù da strollañ', // br: à relire
  aucun: 'Dibabit un ekzerzh da nebeutañ evit gwelout ar follenn.', // br: à relire
  aucunPourLaClasse: 'Ekzerzh ebet n’en deus fichenn evit ar c’hlas-mañ.', // br: à relire
  nonAssemblables: 'Ne c’haller ket e strollañ amañ : {noms}', // br: à relire
  titreFiche: 'Va fichenn', // br: à relire
  ouvrir: 'Digeriñ ar fichenn diouzh ar muzul', // br: à relire
  activer: { // br: à relire
    titre: 'Fichenn diouzh ar muzul (dibabus)',
    aide: 'Ur bajenn a strolla war ur follenn fichennoù meur a ekzerzh. Kuzh e chom keit ha ma n’eo ket gweredekaet.',
    case: 'Kinnig ar fichenn diouzh ar muzul war an trevnad-mañ',
    parSite: 'Kinniget e vez gant al lec’hienn-mañ da gentañ.',
  },
  reglage: { // br: à relire
    titre: 'Fichenn diouzh ar muzul',
    aide: 'Dibabit ekzerzhioù eus ur c’hlas, ha moullit anezho asambles : ul linenn Anv-bihan ha Deiziad, ur reizhadur hepken.',
  },
} as const satisfies Traductions<typeof fr>
