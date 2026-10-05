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
  regionale: {
    titre: 'Yezh rannvroel',
    aide: 'Ouzhpennañ ar yezh rannvroel d\'ar fichennoù da voullañ ha d\'al lañser : niveroù, lizherenneg, deizioù, mizioù ha gerioù. Talvoudus evit ar skolioù divyezhek pe dre soubidigezh.',
    aucune: 'Hini ebet',
    imposee: 'Pa vez an etrefas er yezh-mañ, ez eo gweredekaet he fonksionoù ent emgefre.',
  },
  classe: {
    titre: 'Ma c\'hlas', // br: à relire
    aide: 'Silañ ar poelladennoù hag ar fichennoù dre glas. « An holl » a ziskouez pep tra.', // br: à relire
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
