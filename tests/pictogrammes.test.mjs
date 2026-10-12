// Les pictogrammes des consignes (src/images/consignes.ts, node sans Chrome) : chaque verbe du lexique a ses deux images (couleur et
// contour), en WebP en ligne, sous leur budget de poids ; le rendu suit le réglage (selon la classe : en maternelle seulement ; toujours ;
// jamais) et n'en montre AUCUN quand le réglage est absent (PDF publiés, instantanés) : le texte de la consigne revient alors à l'identique.
import { gzipSync } from 'node:zlib'
import { readFileSync } from 'node:fs'
import { VERBES, assainirPictogrammes, consignesDe, fournirPictogrammes, quandPictogrammesManquent, DEFAUT_PICTOGRAMMES } from '../src/images/consignes.ts'
import { PICTOGRAMMES } from '../src/images/donnees/pictogrammes.ts'
import { fiche as ficheCompter } from '../src/exercices/compter/fiche.ts'
import { verifier, nbEchecs } from './outils.mjs'

const TEXTE = 'Compte les objets.'
const marques = html => (html.match(/data-image="arasaac"/g) ?? []).length

console.log('Avant le chargement des images')
let demandes = 0
quandPictogrammesManquent(() => { demandes++ })
const enAttente = consignesDe({ reglages: { niveau: 'ms' }, pictogrammes: 'classe' })(['compte'], TEXTE)
verifier(enAttente === TEXTE && demandes === 1, 'images pas encore là : le texte seul, et le chargement est demandé')

console.log('Données')
fournirPictogrammes(PICTOGRAMMES)
const numeros = Object.values(VERBES).map(String)
verifier(numeros.every(n => PICTOGRAMMES[n]?.couleur.startsWith('data:image/webp;base64,') && PICTOGRAMMES[n]?.contour.startsWith('data:image/webp;base64,')),
  `chaque verbe a son image en couleur et en contour, en WebP (${numeros.length})`)
verifier(Object.keys(PICTOGRAMMES).every(n => numeros.includes(n)), 'aucune image inutile (relancer scripts/generer/pictogrammes.ts)')
verifier(new Set(numeros).size === numeros.length, 'deux verbes ne partagent pas un pictogramme')
const ko = gzipSync(readFileSync(new URL('../src/images/donnees/pictogrammes.ts', import.meta.url))).length / 1024
verifier(ko <= 120, `lot des pictogrammes : ${ko.toFixed(0)} Ko gzip, sous 120 Ko (chargé à la demande)`)

console.log('Réglage')
const rendu = (pictogrammes, niveau, images) => consignesDe({ reglages: { niveau }, pictogrammes, images })(['compte', 'ecris'], TEXTE)
verifier(rendu(undefined, 'ms') === TEXTE, 'réglage absent (PDF publiés, instantanés) : le texte seul, à l’identique')
verifier(rendu('non', 'ms') === TEXTE, '« jamais » : le texte seul')
verifier(marques(rendu('classe', 'ms')) === 2 && rendu('classe', 'ms').endsWith(TEXTE), '« en maternelle » en MS : un pictogramme par verbe, puis le texte')
verifier(rendu('classe', 'cp') === TEXTE, '« en maternelle » en CP : le texte seul')
verifier(marques(rendu('oui', 'cm2')) === 2, '« toujours » : même en élémentaire')
verifier(rendu('oui', 'ms').includes('alt=""'), 'décoratifs : le texte de la consigne est à côté')
const contour = rendu('oui', 'ms', { famille: 'openmoji', style: 'contour' })
verifier(contour.includes(PICTOGRAMMES[VERBES.compte].contour) && !contour.includes(PICTOGRAMMES[VERBES.compte].couleur), 'style contour : la version sans couleur')
const systeme = rendu('oui', 'ms', { famille: 'systeme', style: 'contour' })
verifier(systeme.includes(PICTOGRAMMES[VERBES.compte].couleur), 'emojis de l’appareil : les pictogrammes restent en couleur')
verifier(assainirPictogrammes('peut-etre') === DEFAUT_PICTOGRAMMES && assainirPictogrammes('non') === 'non', 'réglage mémorisé lu avec méfiance')
let erreur = ''
try { consignesDe({ pictogrammes: 'oui' })(['saute'], TEXTE) } catch (e) { erreur = String(e) }
verifier(/saute/.test(erreur), 'un verbe inconnu (JavaScript non vérifié) échoue en le nommant')

console.log('Une fiche')
const T = cle => cle
const params = niveau => ({ questions: { reponse: 'ecrire', questions: [] }, reglages: { niveau, reponse: 'ecrire' }, T, langue: 'fr' })
let sans = '', avec = ''
try {
  sans = ficheCompter(params('ms'))
  avec = ficheCompter({ ...params('ms'), pictogrammes: 'classe' })
} catch (e) { console.log('   (fiche de compter :', String(e).slice(0, 120), ')') }
verifier(sans && !marques(sans), 'fiche de compter sans réglage (build des PDF) : aucun pictogramme')
verifier(marques(avec) === 2, 'fiche de compter en MS, « en maternelle » : ses deux pictogrammes (compte, écris)')

process.exit(nbEchecs() ? 1 : 0)
