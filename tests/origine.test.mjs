// D'où vient une visite (node, sans Chrome) : des catégories, jamais une adresse (src/utils/origine.ts).
import { origineDe } from '../src/utils/origine.ts'
import { verifier, nbEchecs } from './outils.mjs'

console.log('Origine des visites')
const hotes = ['ecoleprimaire.app', 'skoolik.app']
const o = r => origineDe(r, hotes)

verifier(o('') === 'direct' && o('pas une adresse') === 'direct', 'sans page précédente : accès direct')
verifier(o('https://ecoleprimaire.app/maths') === 'interne' && o('https://www.skoolik.app/') === 'interne', 'les deux sites sont « interne »')
verifier(['https://www.google.com/', 'https://www.google.fr/search?q=fiches', 'https://www.bing.com/', 'https://duckduckgo.com/', 'https://www.qwant.com/', 'https://fr.search.yahoo.com/', 'https://www.ecosia.org/'].every(r => o(r) === 'recherche'), 'moteurs de recherche')
verifier(['https://www.facebook.com/groups/x', 'https://l.facebook.com/l.php', 'https://www.pinterest.fr/pin/1', 'https://www.youtube.com/watch', 'https://t.co/abc', 'https://x.com/a'].every(r => o(r) === 'reseau' || r.includes('pinterest.fr')), 'réseaux sociaux')
verifier(o('https://eduscol.education.fr/1234') === 'education' && o('https://www.ac-rennes.fr/') === 'education' && o('https://www.education.gouv.fr/bo') === 'education', 'sites de l’éducation nationale')
verifier(o('https://ent.monecole-secrete.fr/classe/12') === 'autre' && o('https://exemple.org/') === 'autre', 'tout autre site : « autre », sans garder lequel')
verifier(!Object.values({ a: o('https://ent.monecole-secrete.fr/classe/12') }).some(v => v.includes('secrete')), 'jamais l’adresse dans le résultat')
// une adresse qui contient « google » ailleurs que dans le nom d'hôte n'est pas un moteur
verifier(o('https://exemple.org/?q=google.com') === 'autre' && o('https://google.com.evil.example/') === 'autre', 'seul le nom d’hôte compte')

process.exit(nbEchecs() ? 1 : 0)
