// Lecture — le corpus : des mots découpés en syllabes écrites (la syllabe muette finale comptée : « rou-ge », « mon-ta-gne »), et des
// textes à lire à voix haute, par classe. Repris de l'ancienne page Lecture ; cinq découpages corrigés au report (2026-10-07) pour
// suivre partout la même règle : é-co-le, nu-a-ge, i-ma-ge, ca-mion, pi-ra-nha.
import type { Classe } from '../../data/classes.ts'

export interface MotDecoupe { mot: string, syllabes: readonly string[] }

const MOTS_CP: readonly MotDecoupe[] = [
  { mot: 'papa', syllabes: ['pa', 'pa'] },
  { mot: 'maman', syllabes: ['ma', 'man'] },
  { mot: 'bateau', syllabes: ['ba', 'teau'] },
  { mot: 'maison', syllabes: ['mai', 'son'] },
  { mot: 'lapin', syllabes: ['la', 'pin'] },
  { mot: 'soleil', syllabes: ['so', 'leil'] },
  { mot: 'nuage', syllabes: ['nu', 'a', 'ge'] },
  { mot: 'école', syllabes: ['é', 'co', 'le'] },
  { mot: 'ami', syllabes: ['a', 'mi'] },
  { mot: 'image', syllabes: ['i', 'ma', 'ge'] },
  { mot: 'vélo', syllabes: ['vé', 'lo'] },
  { mot: 'photo', syllabes: ['pho', 'to'] },
  { mot: 'feuille', syllabes: ['feuil', 'le'] },
  { mot: 'rouge', syllabes: ['rou', 'ge'] },
  { mot: 'forêt', syllabes: ['fo', 'rêt'] },
]
const MOTS_CE1: readonly MotDecoupe[] = [
  { mot: 'papillon', syllabes: ['pa', 'pil', 'lon'] },
  { mot: 'chocolat', syllabes: ['cho', 'co', 'lat'] },
  { mot: 'éléphant', syllabes: ['é', 'lé', 'phant'] },
  { mot: 'carotte', syllabes: ['ca', 'rot', 'te'] },
  { mot: 'domino', syllabes: ['do', 'mi', 'no'] },
  { mot: 'caméra', syllabes: ['ca', 'mé', 'ra'] },
  { mot: 'tomate', syllabes: ['to', 'ma', 'te'] },
  { mot: 'camion', syllabes: ['ca', 'mion'] },
  { mot: 'piranha', syllabes: ['pi', 'ra', 'nha'] },
  { mot: 'château', syllabes: ['châ', 'teau'] },
  { mot: 'jardin', syllabes: ['jar', 'din'] },
  { mot: 'fenêtre', syllabes: ['fe', 'nê', 'tre'] },
  { mot: 'librairie', syllabes: ['li', 'brai', 'rie'] },
  { mot: 'montagne', syllabes: ['mon', 'ta', 'gne'] },
]
const MOTS_CE2: readonly MotDecoupe[] = [
  { mot: 'bibliothèque', syllabes: ['bi', 'bli', 'o', 'thè', 'que'] },
  { mot: 'catégorie', syllabes: ['ca', 'té', 'go', 'rie'] },
  { mot: 'anniversaire', syllabes: ['an', 'ni', 'ver', 'sai', 're'] },
  { mot: 'révolution', syllabes: ['ré', 'vo', 'lu', 'tion'] },
  { mot: 'dinosaure', syllabes: ['di', 'no', 'sau', 're'] },
  { mot: 'encyclopédie', syllabes: ['en', 'cy', 'clo', 'pé', 'die'] },
  { mot: 'électricité', syllabes: ['é', 'lec', 'tri', 'ci', 'té'] },
  { mot: 'photographie', syllabes: ['pho', 'to', 'gra', 'phie'] },
  { mot: 'vocabulaire', syllabes: ['vo', 'ca', 'bu', 'lai', 're'] },
  { mot: 'géographie', syllabes: ['gé', 'o', 'gra', 'phie'] },
]

/** Les mots d'une classe : ceux du CP au CP, ceux du CP et du CE1 au CE1, les plus longs au CE2. */
export const MOTS: Readonly<Partial<Record<Classe, readonly MotDecoupe[]>>> = {
  cp: MOTS_CP,
  ce1: [...MOTS_CP, ...MOTS_CE1],
  ce2: [...MOTS_CE1, ...MOTS_CE2],
}

/** Textes à lire à voix haute : une phrase au CP, deux ou trois au CE1, une petite histoire au CE2. */
export const TEXTES: Readonly<Partial<Record<Classe, readonly string[]>>> = {
  cp: [
    'Le petit chat dort sur le tapis chaud.',
    'Maman prépare un bon gâteau au chocolat doux.',
    'Le vélo rouge de Léo est dans le jardin.',
    'Il y a un grand oiseau bleu sur le toit.',
    'Papa joue au ballon avec mon petit frère.',
    'La jolie poule rousse mange du bon pain.',
    'Je vois un grand renard dans la forêt verte.',
    'La banane jaune est très douce et sucrée.',
    'Le poisson rouge nage dans la rivière.',
    "Hugo mange une pomme rouge à l'école.",
  ],
  ce1: [
    "C'est l'été. Les enfants jouent joyeusement sur la plage de sable chaud. Ils construisent un magnifique château de sable.",
    'Le petit chien de Rémi a trouvé un vieil os dans le grand jardin. Il court le cacher sous de jolies fleurs.',
    "Ce matin, la maîtresse apporte un nouveau livre d'images. Tous les élèves écoutent l'histoire avec un grand sourire.",
    'Le lapin blanc se promène dans la prairie verte. Soudain, il voit une très grosse carotte et la mange avec joie.',
    'La pluie commence à tomber sur la grande forêt. Les petits oiseaux se cachent sous les feuilles pour rester au sec.',
    'Maman prépare une bonne soupe de légumes chauds pour le dîner. Ça sent vraiment bon dans toute la cuisine !',
    "Le soleil brille fort aujourd'hui. Léa met son chapeau bleu et part faire du vélo avec sa meilleure amie.",
  ],
  ce2: [
    "Pendant les vacances d'automne, toute la famille décide de faire une longue et belle randonnée en montagne. Le paysage est magnifique avec toutes ces belles feuilles rouges.",
    "L'électricité est devenue indispensable dans notre vie quotidienne. Elle permet d'allumer la lumière et de faire fonctionner les appareils grâce à un circuit électrique simple.",
    'Dans la grande forêt amazonienne, de nombreux animaux étranges et colorés s\'abritent dans les arbres géants. Les scientifiques étudient cette biodiversité incroyable.',
  ],
}
