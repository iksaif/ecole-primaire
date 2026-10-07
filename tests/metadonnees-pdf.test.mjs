// Propriétés des PDF des fiches (node, sans Chrome) : licence toujours écrite, crédits d'images seulement pour les images présentes
// (scripts/build/fiches/metadonnees.ts), et le PDF reste lisible avec le même nombre de pages.
import { PDFDocument } from '@cantoo/pdf-lib'
import { avecMetadonnees, sourcesDImages, sujet } from '../scripts/build/fiches/metadonnees.ts'
import { verifier, nbEchecs } from './outils.mjs'

// sources d'images : d'après data-image, sans doublon, inconnues ignorées
verifier(sourcesDImages('<p>texte</p>').length === 0, 'sans image : aucune source')
verifier(sourcesDImages('<img data-image="openmoji"><img data-image="openmoji"><img data-image="arasaac"><img data-image="autre">').join() === 'arasaac,openmoji',
  'sources : openmoji et arasaac, une fois chacune, l\'inconnue ignorée')

// sujet : la licence est toujours là ; un crédit par source présente et aucun autre
const sans = sujet([])
verifier(sans.includes('CC BY-NC-SA 4.0') && sans.includes('CC BY-SA 4.0'), 'sujet : licences de la fiche et des textes sources')
verifier(!sans.includes('ARASAAC') && !sans.includes('OpenMoji'), 'sujet sans image : aucun crédit d\'image')
verifier(sujet(['openmoji']).includes('OpenMoji') && !sujet(['openmoji']).includes('ARASAAC'), 'sujet avec OpenMoji seul : pas de crédit ARASAAC')
verifier(sujet(['arasaac']).includes('Sergio Palao'), 'sujet avec ARASAAC : auteur cité')

// PDF : propriétés écrites, titre et pages conservés
const source = await PDFDocument.create()
source.setTitle('Titre de Chrome'); source.addPage(); source.addPage()
const sortie = await PDFDocument.load(await avecMetadonnees(await source.save(), '<img data-image="arasaac">'))
verifier(sortie.getTitle() === 'Titre de Chrome', 'PDF : titre conservé')
verifier(sortie.getPageCount() === 2, 'PDF : pages conservées')
verifier((sortie.getSubject() ?? '').includes('ARASAAC'), 'PDF : crédit ARASAAC écrit quand le HTML a un pictogramme')
verifier(!(sortie.getKeywords() ?? '').includes('OpenMoji'), 'PDF : pas de mot-clé OpenMoji sans image OpenMoji')

process.exit(nbEchecs() ? 1 : 0)
