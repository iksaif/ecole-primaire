// La relecture du breton (node, sans Chrome) : lecture des marqueurs « // br: à relire » (src/langues/relecture.ts) et document à imprimer
// (src/impression/relecture.ts). La page /dev/relecture-breton les assemble avec les modules de Vite : elle n'est pas testée ici.
import { feuilles, lignesAffiche, lignesContenu, lignesSection, marquesAffiche, marquesContenu, marquesSection } from '../src/langues/relecture.ts'
import { documentRelecture, nbLignes } from '../src/impression/relecture.ts'
import { verifier, nbEchecs } from './outils.mjs'

// feuilles : un texte, une liste ou un pluriel est une feuille ; le reste est un sous-arbre
const cles = feuilles({ a: 'x', b: { c: 'y', d: ['z', 'w'] }, e: { one: '1', other: '2' } }).map(([k]) => k)
verifier(cles.join() === 'a,b.c,b.d,e', 'feuilles : clés pointées, liste et pluriel sont des feuilles')

// section : marqueur sur la ligne ou la ligne d'avant, et vaut pour tout le sous-arbre
const section = `export default {
  titre: 'Un', // br: à relire
  // br: à relire
  sur: {
    un: 'a',
    deux: 'b',
  },
  sain: 'c',
  autre: {
    pas: 'd',
  },
}`
const m = marquesSection(section)
verifier(m.has('titre') && m.has('sur') && m.has('sur.un') && m.has('sur.deux'), 'marquesSection : ligne, ligne d\'avant, enfants')
verifier(!m.has('sain') && !m.has('autre.pas'), 'marquesSection : une clé non marquée ne l\'est pas')

// contenu : seul le bloc `br: { … }` compte, par clé de premier niveau
const contenu = `export const CONTENU = catalogue({ titre: 'T', mots: { a: 'x' } }, { br: {
  titre: 'Tre', // br: à relire
  mots: { a: 'ar' },
} })`
verifier(marquesContenu(contenu).has('titre') && !marquesContenu(contenu).has('mots'), 'marquesContenu : seulement la clé marquée')
const l = lignesContenu('ex', { titre: 'T', mots: { a: 'x' } }, { titre: 'Tre', mots: { a: 'ar' } }, contenu)
verifier(l.find(x => x.cle === 'titre')?.aRelire === true && l.find(x => x.cle === 'mots.a')?.aRelire === false, 'lignesContenu : à relire par clé de premier niveau')
verifier(lignesContenu('ex', { titre: 'T' }, undefined, contenu)[0].breton === null, 'lignesContenu sans bloc br : pas de breton')

// affiche : clés à plat, le marqueur vaut pour toute la ligne
const affiche = `export const TEXTES = { fr: { titre: 'T' }, br: {
  titre: 'An', // br: à relire
  'legende.a': 'x', 'legende.b': 'y', // br: à relire
  'moment.leve': 'z',
} }`
const ma = marquesAffiche(affiche)
verifier(ma.has('titre') && ma.has('legende.a') && ma.has('legende.b') && !ma.has('moment.leve'), 'marquesAffiche : toutes les clés de la ligne marquée')
const la = lignesAffiche('h', { titre: 'T', 'moment.leve': 'Je me lève' }, { titre: 'An' }, affiche)
verifier(la[0].aRelire && la[1].breton === null, 'lignesAffiche : à relire, et breton absent')

// lignesSection : traduction manquante = null
const ls = lignesSection('s', { a: 'A', b: 'B' }, { a: 'Aa' }, `a: 'Aa', // br: à relire`)
verifier(ls[0].breton === 'Aa' && ls[1].breton === null, 'lignesSection : breton absent = null')

// nombre de lignes de correction : de 2 à 6, selon le texte le plus long
verifier(nbLignes({ francais: 'Court', breton: 'Berr' }) === 1, 'nbLignes : une ligne pour un texte court')
verifier(nbLignes({ francais: 'x'.repeat(130), breton: null }) === 3, 'nbLignes : une ligne par tranche de 60 signes')
verifier(nbLignes({ francais: 'x'.repeat(2000), breton: null }) === 6, 'nbLignes : au plus six')

// le document
const lignes = [
  { origine: 'interface', section: 'accueil', cle: 'titre', francais: 'Bienvenue <b>ici</b>', breton: 'Degemer mat', aRelire: true },
  { origine: 'exercice', section: 'heure', cle: 'x', francais: 'Quelle heure ?', breton: null, aRelire: false },
  { origine: 'affiche', section: 'horloge', cle: 'titre', francais: "L'horloge", breton: 'An horolaj', aRelire: false },
]
const base = { lignes: 3, cases: true, cles: true, parSection: false, contact: 'contact@example.org' }
const html = documentRelecture(lignes, base)
const compte = (re) => (html.match(re) ?? []).length
verifier(compte(/<article/g) === 3, 'document : un cadre par texte')
verifier(compte(/class="ligne"/g) === 9, 'document : trois lignes de correction par texte')
verifier(compte(/class="case"/g) === 6, 'document : deux cases par texte')
verifier(html.includes('Bienvenue &lt;b&gt;ici&lt;/b&gt;') && !html.includes('<b>ici</b>'), 'document : le texte est échappé')
verifier(html.includes('accueil.titre') && html.includes('contact@example.org'), 'document : clé et contact')
verifier(html.includes('pas encore traduit') && html.includes('Brezhoneg'), 'document : texte absent signalé, libellé breton')
verifier(compte(/class="incertain"/g) === 1, 'document : seul le texte à relire est signalé')
const nu = documentRelecture(lignes, { ...base, lignes: 'auto', cases: false, cles: false })
verifier(!nu.includes('class="case"') && !nu.includes('accueil.titre'), 'document : sans cases ni clés')
verifier((nu.match(/class="ligne"/g) ?? []).length === 3, 'document : lignes automatiques (1 par texte court)')
verifier(!html.includes('class="page"') && documentRelecture(lignes, { ...base, parSection: true }).includes('class="page"'), 'document : saut de page par section à la demande')

// deux parties : le contenu des fiches (exercices, affiches) d'abord, l'interface ensuite, saut de page entre les deux
const iPartie1 = html.indexOf('Partie 1'), iPartie2 = html.indexOf('Partie 2')
verifier(iPartie1 >= 0 && iPartie2 > iPartie1, 'parties : la partie 1 précède la partie 2')
verifier(html.indexOf('Contenu des fiches') < html.indexOf('Interface du site'), 'parties : le contenu des fiches est annoncé avant l\'interface')
verifier(html.indexOf('Quelle heure ?') < html.indexOf('Bienvenue'), 'parties : un texte d\'exercice vient avant un texte d\'interface, même donné après')
verifier(compte(/class="partie/g) === 2 && /class="partie page"/.test(html), 'parties : deux bannières, saut de page avant la seconde')
verifier(html.includes('class="priorite"'), 'parties : la priorité est dite quand il y a deux parties')
const seul = documentRelecture(lignes.filter(x => x.origine === 'interface'), base)
verifier(!seul.includes('class="partie') && !seul.includes('class="priorite"'), 'parties : une seule partie, pas de bannière')

process.exit(nbEchecs() ? 1 : 0)
