// Textes de l'interface — page « Diwar-benn » (breton). Traduction automatique : voir nav.ts.
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/apropos.ts'

export default {
  titre: '📚 Diwar-benn',
  avertissementTitre: 'Graet eo bet al lec\'hienn-mañ gant tadoù ha mammoù, ha n\'eo ket gant kelennerien.',
  avertissement: 'Diazezet eo ar poelladennoù war ar programmoù ofisiel, met n\'int ket bet gwiriet gant tud a vicher. Ma vez un douetañs war ur reolenn pe ur respont, goulennit digant kelenner ho pugel.',
  traductionAuto: '🤖 Graet eo bet an droidigezh e {langue} ent emgefre ha n\'eo ket bet adlennet c\'hoazh : degemeret eo pep evezhiadenn war {contact}.', // br: à relire
  intro: 'Poelladennoù etrewezhiat digoust ha fichennoù da voullañ evit ambroug ar vugale eus ar skol-vamm (PS, MS, GS) betek fin an elfennel (CP → CM2). Pep tra a dro er merdeer : hep kont, hep bruderezh, hep dastum roadennoù.', // br: à relire
  comment: 'Penaos e ya en-dro ?',
  commentListe: [
    'Ar c\'harcher hag ar skorioù a chom war an drobarzhell (renkell lec\'hel ar merdeer).', // br: à relire
    'Goulenn ebet na vez kaset d\'ul lec\'hienn all, toupin ebet.', // br: à relire
    'Digor eo ar c\'hod mammenn.', // br: à relire
  ],
  polices: 'Nodrezhioù', // br: à relire
  policesTexte: 'Enno emañ Playwrite FR Trad, Andika, OpenDyslexic (aotre OFL) ha Luciole (CC BY 4.0). Evit ar skritur a-stag e kuzulier Belle Allure pe Écolier : n\'hall ket bezañ kinniget gant al lec\'hienn abalamour d\'an aotre-implijout, ret eo o staliañ pe ouzhpennañ ar restr e dibab an nodrezh.', // br: à relire
  contribuer: 'Kemer perzh',
  contribuerTexte: 'Digor eo al lec\'hienn : an holl god a zo war {depot}. Degemer mat eo pep skoazell, ha pa ne ouifec\'h ket programmiñ :', // br: à relire
  contribuerErreur: 'Kemenn ur fazi (ur respont fall, ur fazi skrivañ, ur bug) : digeriñ un issue pe skrivañ da {contact}.', // br: à relire
  contribuerProposer: 'Kinnig ur boelladenn pe ur fichenn talvoudus er c\'hlas pe er gêr.',
  contribuerRelire: 'Adlenn un droidigezh : merket eo ar frazennoù da wiriañ gant « br: à relire » er c\'hod ; ur gemennadenn gant ho reizhadennoù a vo a-walc\'h.',
  contribuerEnseignant: 'Kelenner·ez oc\'h ? Talvoudus-tre eo ho evezhiadennoù diwar-benn ar c\'henglev gant ar programm.', // br: à relire
  issue: 'digeriñ un issue',
} satisfies Traductions<typeof fr>
