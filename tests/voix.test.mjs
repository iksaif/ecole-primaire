// Choix de la voix de synthèse (src/noyau/voix.ts) : test unitaire node, sans navigateur. Listes de voix inspirées de
// ce que donnent vraiment Chrome sur Mac, Edge sous Windows et Chrome sous Android.
//   node tests/voix.test.mjs
import { choisirVoix, classerVoix, idVoix, voixDeQualite, voixFantaisie } from '../src/noyau/voix.ts'
import { LANGUES } from '../src/langues/registre.ts'
import { verifier, nbEchecs } from './outils.mjs'

// une voix du navigateur (voiceURI = nom, comme Chrome)
const v = (name, lang, localService = true, defaut = false) => ({ name, voiceURI: name, lang, localService, default: defaut })
const nom = voix => voix?.name ?? null

console.log('Règle de base')
verifier(choisirVoix([v('a', 'en-US'), v('b', 'fr-CA'), v('c', 'fr-FR')], 'fr-FR')?.lang === 'fr-FR', 'même région d\'abord')
verifier(choisirVoix([v('a', 'fr-FR', false), v('b', 'fr_CA')], 'fr-FR')?.lang === 'fr_CA', 'une voix locale de la langue avant une voix en ligne de la région')
verifier(choisirVoix([v('a', 'fr-FR', false)], 'fr-FR')?.name === 'a', 'une voix en ligne, faute de voix locale')
verifier(choisirVoix([v('a', 'en-US'), v('b', 'de-DE')], 'fr-FR') === null, 'aucune voix de la langue : null')
verifier(choisirVoix([v('a', 'fr-FR')], LANGUES.br.voix.bcp47) === null, 'pas de voix bretonne : null (repli silencieux)')
verifier(choisirVoix([], 'fr-FR') === null, 'aucune voix : null')
verifier(choisirVoix([{ lang: 'fr-FR', localService: true }], 'fr-FR')?.lang === 'fr-FR', 'une voix sans nom reste utilisable')

console.log('Qualité et voix fantaisie')
verifier(voixDeQualite(v('Amélie (Premium)', 'fr-CA')) && voixDeQualite(v('Thomas (Amélioré)', 'fr-FR')) && voixDeQualite(v('Microsoft Denise Online (Natural) - French (France)', 'fr-FR')),
  'Premium, Amélioré, Natural : qualité annoncée')
verifier(!voixDeQualite(v('Thomas', 'fr-FR')) && !voixDeQualite(v('Microsoft Hortense - French (France)', 'fr-FR')), 'voix ordinaires : pas de qualité annoncée')
verifier(voixFantaisie(v('Grandma (French (France))', 'fr-FR')) && voixFantaisie(v('Rocko', 'fr-FR')) && !voixFantaisie(v('Thomas', 'fr-FR')),
  'voix-gags de macOS reconnues par leur premier mot')
verifier(idVoix(v('Thomas', 'fr-FR')) === 'Thomas' && idVoix({ name: 'X', voiceURI: '', lang: 'fr', localService: true }) === 'X', 'identifiant : voiceURI, sinon le nom')

console.log('Chrome sur Mac')
const mac = [
  v('Eddy (français (France))', 'fr-FR'), v('Grandma (français (France))', 'fr-FR'), v('Rocko (français (France))', 'fr-FR'),
  v('Amélie', 'fr-CA'), v('Thomas', 'fr-FR', true, true), v('Audrey (Premium)', 'fr-FR'), v('Samantha', 'en-US'),
  v('Google français', 'fr-FR', false), v('Google US English', 'en-US', false),
]
verifier(nom(choisirVoix(mac, 'fr-FR')) === 'Audrey (Premium)', 'une voix Premium de France, sur l\'appareil, avant la voix Google en ligne')
verifier(nom(choisirVoix(mac.filter(x => x.name !== 'Audrey (Premium)'), 'fr-FR')) === 'Thomas', 'sans voix Premium : la voix par défaut de France, pas une voix-gag')
const classees = classerVoix(mac, 'fr-FR').map(x => x.name)
verifier(classees.at(-1) === 'Google français', 'la voix en ligne est classée en dernier')
verifier(classees.indexOf('Amélie') < classees.indexOf('Eddy (français (France))'), 'une voix ordinaire (même canadienne) avant une voix-gag')
verifier(classees.every(n => !n.startsWith('Samantha') && !n.startsWith('Google US')), 'seules les voix de la langue sont classées')

console.log('Edge sous Windows')
const edge = [
  v('Microsoft Hortense - French (France)', 'fr-FR'), v('Microsoft Paul - French (France)', 'fr-FR'),
  v('Microsoft Denise Online (Natural) - French (France)', 'fr-FR', false), v('Microsoft Sylvie Online (Natural) - French (Canada)', 'fr-CA', false),
]
verifier(nom(choisirVoix(edge, 'fr-FR')) === 'Microsoft Hortense - French (France)', 'voix locale ordinaire choisie d\'office plutôt qu\'une voix en ligne « Natural »')
verifier(nom(choisirVoix(edge, 'fr-FR', 'Microsoft Denise Online (Natural) - French (France)')) === 'Microsoft Denise Online (Natural) - French (France)',
  'la voix en ligne choisie par l\'adulte est respectée')
verifier(nom(choisirVoix(edge, 'fr-FR', 'Voix disparue')) === 'Microsoft Hortense - French (France)', 'une voix choisie qui n\'existe plus : retour au choix automatique')
verifier(nom(choisirVoix([...edge, v('Microsoft David', 'en-US')], 'fr-FR', 'Microsoft David')) === 'Microsoft Hortense - French (France)',
  'une voix choisie d\'une autre langue est ignorée')

console.log('Chrome sous Android')
const android = [v('Français France', 'fr_FR'), v('Français Canada', 'fr_CA'), v('English United States', 'en_US')]
verifier(nom(choisirVoix(android, 'fr-FR')) === 'Français France', 'étiquettes « fr_FR » d\'Android comprises')

process.exit(nbEchecs() ? 1 : 0)
