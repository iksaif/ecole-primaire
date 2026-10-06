// Textes de l'interface — page des arventennoù (breton). Traduction automatique : voir nav.ts.
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/reglages.ts'

export default {
  titre: '⚙️ Arventennoù',
  intro: 'Enrollet eo an arventennoù-mañ war an drobarzhell-mañ, er merdeer. Netra n\'a er-maez.', // br: à relire
  interface: {
    titre: 'Yezh an etrefas', // br: à relire
    aide: 'Yezh al lañserioù hag an destennoù.', // br: à relire
  },
  langues: {
    titre: 'Yezhoù ar fichennoù hag an ekzersoù', // br: à relire
    aide: 'Galleg hepken, galleg gant ar yezh rannvroel (niveroù, lizherenneg, deizioù, mizioù, gerioù), pe ar yezh rannvroel hepken. Talvoudus evit ar skolioù divyezhek pe dre soubidigezh.', // br: à relire
  },
  classe: {
    titre: 'Ma c\'hlas', // br: à relire
    aide: 'Ar rolloù a ziskouez ekzersoù ha fichennoù ar glas. Gant ar profil Kelenner e c\'haller dibab meur a glas.', // br: à relire
  },
  profil: {
    titre: 'Piv a implij al lec\'hienn ?', // br: à relire
    aide: 'Ar profil ne cheñch nemet an daolenn hag an niver a glasoù. Netra n\'eo prennet.', // br: à relire
  },
  police: {
    titre: 'Nodrezh ar fichennoù', // br: à relire
    aide: 'Ar skritur implijet war ar fichennoù da voullañ.', // br: à relire
  },
  remise: {
    titre: 'Adderaouekaat',
    aide: 'Diverkañ an holl arventennoù hag ar skorioù enrollet war an drobarzhell-mañ.', // br: à relire
    bouton: 'Adderaouekaat pep tra',
    confirmer: 'Ha sur oc\'h ? Diverket e vo pep tra a zo enrollet war an drobarzhell-mañ.', // br: à relire
    fait: { one: '✅ {n} arventenn dilamet.', other: '✅ {n} arventenn dilamet.' }, // br: à relire
  },
  retour: '← Distreiñ d\'an degemer',
} satisfies Traductions<typeof fr>
