// Textes de l'interface — page de la langue régionale (breton). Traduction automatique : voir nav.ts.
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/regionale.ts'

export default {
  inactif: 'Ar bajenn-mañ n\'eo ket oberiant er mod « Galleg hepken ».', // br: à relire
  inactifAide: 'Gweredekait ar yezh evit gwelet he lizherenneg, he niveroù, he deizioù hag he mizioù.', // br: à relire
  activer: 'Gweredekaat : galleg + {nom}', // br: à relire
  intro: 'Lizherenneg, niveroù, deizioù ha mizioù e {nom}, evit {ecoles}.', // br: à relire
  alphabetAide: '{n} lizherenn. Al lizherennoù ouzhpenn d\'al lizherenneg latin : {plus}.', // br: à relire
  motsIllustres: 'Ur ger evit pep lizherenn', // br: à relire
  nombres: 'An niveroù en lizherennoù', // br: à relire
  nombresAide: 'Eus 1 da 10, an degadoù, un nebeud niveroù bras.', // br: à relire
  voixAbsente: 'Ne lenn ket ar merdeer ar yezh-mañ gant ur vouezh : n\'eus skrivadeg hep sellet ebet.', // br: à relire
  voixPresente: 'Gallout a ra ar merdeer lenn ar yezh-mañ a-leizh e c\'harn.', // br: à relire
  ressources: 'Poelladennoù ha fichennoù e {nom}', // br: à relire
  ressourcesVide: 'Ar poelladennoù hag ar fichennoù e {nom} a zeu abred.', // br: à relire
} satisfies Traductions<typeof fr>
