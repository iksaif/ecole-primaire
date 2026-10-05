// Textes de l'interface — page de la langue régionale (breton). Traduction automatique : voir nav.ts.
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/langueRegionale.ts'

export default {
  titreAucune: 'Yezh rannvroel',
  aucune: 'N’eus yezh rannvroel ebet gweredekaet.',
  activer: 'He gweredekaat en arventennoù',
  intro: 'Lizherenneg, niveroù, deizioù ha mizioù e {nom}, evit {ecoles}.', // br: à relire
  alphabet: 'An lizherenneg', // br: à relire
  alphabetAide: '{n} lizherenn. Al lizherennoù ouzhpenn d\'al lizherenneg latin : {plus}.', // br: à relire
  motsIllustres: 'Ur ger evit pep lizherenn', // br: à relire
  nombres: 'An niveroù en lizherennoù', // br: à relire
  nombresAide: 'Eus 1 da 10, an degadoù, un nebeud niveroù bras.', // br: à relire
  listes: 'Deizioù, mizioù ha niveroù', // br: à relire
  voixAbsente: 'Ne lenn ket ar merdeer ar yezh-mañ gant ur vouezh : n\'eus skrivadeg hep sellet ebet.', // br: à relire
  voixPresente: 'Gallout a ra ar merdeer lenn ar yezh-mañ a-leizh e c\'harn.', // br: à relire
} satisfies Traductions<typeof fr>
