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
  voix: {
    titre: 'Mouezh', // br: à relire
    aide: 'Ar vouezh a lenn ar c\'hemennoù, anv al lizherennoù hag ar skrivadeg. Dont a ra eus ar merdeer : cheñch a ra eus un drobarzhell d\'eben.', // br: à relire
    voixPour: 'Mouezh evit ar {langue}', // br: à relire
    automatique: 'Emgefre (erbedet) : {nom}', // br: à relire
    automatiqueSeul: 'Emgefre (erbedet)', // br: à relire
    surAppareil: 'War an drobarzhell-mañ', // br: à relire
    enLigne: 'Enlinenn', // br: à relire
    qualite: 'gwelloc\'h kalite', // br: à relire
    aucune: 'Mouezh ebet evit ar yezh-se war an drobarzhell-mañ : skrivet e chom an destennoù.', // br: à relire
    noteEnLigne: 'Mouezh enlinenn : evit he lakaat da gomz e kas ar merdeer an destenn lennet da servij e embanner (Google, Microsoft, Apple…). Hol lec\'hienn ne gas netra. Gant ar mouezhioù « war an drobarzhell-mañ » ne ya netra er-maez.', // br: à relire
    astuce: 'Evit ur vouezh naturaloc\'h : war Mac, iPhone hag iPad, pellgargit ur vouezh « Premium » pe « Gwellaet » (Arventennoù › Haezadusted › Danvez distaget) ; war Windows, ouzhpennit ur vouezh (Arventennoù › Eur ha yezh › Mouezh) ; war Android, e Haezadusted › Mouezh sintetek. Adkargit ar bajenn goude.', // br: à relire
    vitesse: 'Tizh', // br: à relire
    plusLente: 'goustatoc\'h', // br: à relire
    plusRapide: 'buanoc\'h', // br: à relire
    pourcent: '{n} %',
    ecouter: '▶️ Selaou ur skouer', // br: à relire
    exemple: 'Demat ! Selaou mat : diskouez din al lizherenn B, evel bolotenn.', // br: à relire
    sansVoix: 'N\'eus mouezh ebet c\'hoazh evit : {langues}. Skrivet e chom an destennoù-se, evit ma vint lennet gant an oadour.', // br: à relire
    sansSynthese: 'Ne oar ket ar merdeer-mañ lenn a vouezh uhel : skrivet e chom ar c\'hemennoù.', // br: à relire
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
