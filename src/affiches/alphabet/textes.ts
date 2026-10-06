// Les textes de l'affiche de l'alphabet, par langue. Le formulaire les lit dans la langue de l'interface (retombée sur le
// français), la feuille dans la langue de chaque page. Les mots illustrés du français sont `mot.<lettre>` ; ceux d'une
// langue régionale viennent de ses données vérifiées (src/langues/<langue>/donnees.ts), pas d'ici.
// Breton : traduction automatique, chaque texte nouveau est marqué « br: à relire ». Le titre de l'alphabet breton est celui
// des données vérifiées (« Al lizherenneg »).
import type { TextesAffiche } from '../types.ts'

const MOTS_FR: Record<string, string> = {
  a: 'abeille', b: 'ballon', c: 'canard', d: 'dauphin', e: 'escargot', f: 'fraise', g: 'gorille', h: 'hibou', i: 'image',
  j: 'jus', k: 'koala', l: 'lion', m: 'maison', n: 'nuage', o: 'orange', p: 'pomme', q: 'quille', r: 'renard', s: 'soleil',
  t: 'tortue', u: 'usine', v: 'vache', w: 'wagon', x: 'taxi', y: 'stylo', z: 'zèbre',
  é: 'étoile', è: 'crème', ê: 'fête', ë: 'Noël', à: 'là', â: 'pâtes', î: 'île', ï: 'maïs', ô: 'hôtel', ù: 'où', û: 'mûre',
  ç: 'glaçon', œ: 'œuf', æ: 'ex æquo',
}
const mots = Object.fromEntries(Object.entries(MOTS_FR).map(([lettre, mot]) => [`mot.${lettre}`, mot]))

export const TEXTES: TextesAffiche = {
  fr: {
    titre: 'L’alphabet',
    'titre.speciales': 'Les lettres spéciales',
    'variante.a4-paysage.court': 'Alphabet A4 paysage',
    'variante.a4-paysage.titre': 'Affiche de l’alphabet A4 (script et attaché)',
    'variante.a4-paysage.description': 'Affiche de l’alphabet A4 : les lettres en script et en attaché, majuscules et minuscules, avec un mot illustré pour chaque lettre. Gratuit, à imprimer en PDF.',
    'variante.a3-paysage.court': 'Alphabet A3 paysage',
    'variante.a3-paysage.titre': 'Affiche de l’alphabet A3 pour la classe (script et attaché)',
    'variante.a3-paysage.description': 'Affiche de l’alphabet A3 pour la classe : les lettres en script et en attaché, majuscules et minuscules, avec un mot illustré pour chaque lettre. Gratuit, à imprimer en PDF.',
    'variante.a4-portrait.court': 'Alphabet A4 portrait',
    'variante.a4-portrait.titre': 'Affiche de l’alphabet A4 portrait (script et attaché)',
    'variante.a4-portrait.description': 'Affiche de l’alphabet A4 en portrait : les lettres en script et en attaché, majuscules et minuscules, avec un mot illustré pour chaque lettre. Gratuit, à imprimer en PDF.',
    'variante.cursive.court': 'Alphabet en attaché',
    'variante.cursive.titre': 'Affiche de l’alphabet en écriture attachée (cursive)',
    'variante.cursive.description': 'Affiche de l’alphabet en écriture attachée (cursive), majuscules et minuscules, avec un mot illustré pour chaque lettre. Gratuit, à imprimer en PDF.',
    'variante.une-lettre-par-page.court': 'Une lettre par page',
    'variante.une-lettre-par-page.titre': 'Alphabet : une grande lettre par page (frise de la classe)',
    'variante.une-lettre-par-page.description': 'Une grande lettre par page, en script et en attaché, majuscule et minuscule, avec un mot illustré : à afficher en frise dans la classe. Gratuit, à imprimer en PDF.',
    'variante.lettres-speciales.court': 'Lettres spéciales',
    'variante.lettres-speciales.titre': 'Affiche des lettres spéciales : accents, cédille, œ et æ',
    'variante.lettres-speciales.description': 'Les lettres à signe (é è ê ë à â î ï ô ù û ü ÿ ç œ æ) en script et en attaché, majuscules et minuscules, avec un mot illustré. Gratuit, à imprimer en PDF.',
    'reglage.serie': 'Les lettres',
    'valeur.serie.alphabet': 'Tout l’alphabet', 'valeur.serie.speciales': 'Les lettres spéciales (é, è, ç, œ…)',
    'reglage.disposition': 'Disposition',
    'valeur.disposition.grille': 'Toutes les lettres sur une feuille', 'valeur.disposition.carte': 'Une lettre par page',
    'reglage.styles': 'Écritures affichées',
    'valeur.styles.script-maj': 'Script majuscule', 'valeur.styles.script-min': 'Script minuscule',
    'valeur.styles.attache-maj': 'Attaché majuscule', 'valeur.styles.attache-min': 'Attaché minuscule',
    'reglage.mot': 'Un mot et une image',
    'valeur.mot.true': 'Oui', 'valeur.mot.false': 'Non',
    'aide.mot': 'Un mot et une image pour chaque lettre (A comme abeille 🐝).',
    'reglage.voyelles': 'Couleurs',
    'valeur.voyelles.true': 'Voyelles en rouge, consonnes en bleu', 'valeur.voyelles.false': 'Tout en noir',
    'reglage.lignes': 'Lignes d’écriture',
    'valeur.lignes.true': 'Avec', 'valeur.lignes.false': 'Sans',
    'aide.lignes': 'Un lignage léger sous l’attaché, pour la hauteur des lettres.',
    'groupe.contenu': 'Le contenu', 'groupe.ecriture': 'Les écritures',
    'police.script': 'Police du script et du mot', 'police.attache': 'Police de l’attaché',
    ...mots,
  },
  br: {
    titre: 'Al lizherenneg',
    'titre.speciales': 'Al lizherennoù dibar', // br: à relire
    'variante.a4-paysage.court': 'Lizherenneg A4 gweledva', // br: à relire
    'variante.a4-paysage.titre': 'Skritell al lizherenneg A4 (skript hag a-stag)', // br: à relire
    'variante.a4-paysage.description': 'Skritell al lizherenneg A4 : al lizherennoù e skript hag a-stag, pennlizherennoù ha lizherennoù bihan, gant ur ger skeudennet evit pep lizherenn. Digoust, da voullañ e PDF.', // br: à relire
    'variante.a3-paysage.court': 'Lizherenneg A3 gweledva', // br: à relire
    'variante.a3-paysage.titre': 'Skritell al lizherenneg A3 evit ar c’hlas (skript hag a-stag)', // br: à relire
    'variante.a3-paysage.description': 'Skritell al lizherenneg A3 evit ar c’hlas : al lizherennoù e skript hag a-stag, pennlizherennoù ha lizherennoù bihan, gant ur ger skeudennet evit pep lizherenn. Digoust, da voullañ e PDF.', // br: à relire
    'variante.a4-portrait.court': 'Lizherenneg A4 poltred', // br: à relire
    'variante.a4-portrait.titre': 'Skritell al lizherenneg A4 e poltred (skript hag a-stag)', // br: à relire
    'variante.a4-portrait.description': 'Skritell al lizherenneg A4 e poltred : al lizherennoù e skript hag a-stag, pennlizherennoù ha lizherennoù bihan, gant ur ger skeudennet evit pep lizherenn. Digoust, da voullañ e PDF.', // br: à relire
    'variante.cursive.court': 'Al lizherenneg a-stag', // br: à relire
    'variante.cursive.titre': 'Skritell al lizherenneg e skritur a-stag', // br: à relire
    'variante.cursive.description': 'Skritell al lizherenneg e skritur a-stag, pennlizherennoù ha lizherennoù bihan, gant ur ger skeudennet evit pep lizherenn. Digoust, da voullañ e PDF.', // br: à relire
    'variante.une-lettre-par-page.court': 'Ul lizherenn dre bajenn', // br: à relire
    'variante.une-lettre-par-page.titre': 'Al lizherenneg : ul lizherenn vras dre bajenn', // br: à relire
    'variante.une-lettre-par-page.description': 'Ul lizherenn vras dre bajenn, e skript hag a-stag, gant ur ger skeudennet : da lakaat e-kerzh ar skol. Digoust, da voullañ e PDF.', // br: à relire
    'variante.lettres-speciales.court': 'Lizherennoù dibar', // br: à relire
    'variante.lettres-speciales.titre': 'Skritell al lizherennoù dibar', // br: à relire
    'variante.lettres-speciales.description': 'Al lizherennoù dibar e skript hag a-stag, pennlizherennoù ha lizherennoù bihan. Digoust, da voullañ e PDF.', // br: à relire
    'reglage.serie': 'Al lizherennoù', // br: à relire
    'valeur.serie.alphabet': 'An holl lizherenneg', 'valeur.serie.speciales': 'Al lizherennoù dibar', // br: à relire
    'reglage.disposition': 'Aozadur', // br: à relire
    'valeur.disposition.grille': 'An holl lizherennoù war ur follenn', 'valeur.disposition.carte': 'Ul lizherenn dre bajenn', // br: à relire
    'reglage.styles': 'Doareoù skrivañ diskouezet', // br: à relire
    'valeur.styles.script-maj': 'Skript, pennlizherennoù', 'valeur.styles.script-min': 'Skript, lizherennoù bihan',
    'valeur.styles.attache-maj': 'A-stag, pennlizherennoù', 'valeur.styles.attache-min': 'A-stag, lizherennoù bihan', // br: à relire
    'reglage.mot': 'Ur ger hag ur skeudenn', // br: à relire
    'valeur.mot.true': 'Ya', 'valeur.mot.false': 'Ket', // br: à relire
    'aide.mot': 'Ur ger hag ur skeudenn evit pep lizherenn (A evel abeille 🐝).', // br: à relire
    'reglage.voyelles': 'Livioù', // br: à relire
    'valeur.voyelles.true': 'Vogalennoù e ruz, kensonennoù e glas', 'valeur.voyelles.false': 'Pep tra e du', // br: à relire
    'reglage.lignes': 'Linennoù skrivañ', // br: à relire
    'valeur.lignes.true': 'Gant', 'valeur.lignes.false': 'Hep', // br: à relire
    'aide.lignes': 'Linennoù skañv dindan an a-stag, evit uhelder al lizherennoù.', // br: à relire
    'groupe.contenu': 'An danvez', 'groupe.ecriture': 'Ar skrituroù', // br: à relire
    'police.script': 'Nodrezh ar skript hag ar ger', 'police.attache': 'Nodrezh an a-stag', // br: à relire
  },
}
