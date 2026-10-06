// Textes de l'interface — pages de développement (breton). Traduction automatique : les passages marqués « br: à relire »
// sont à faire vérifier par un brittophone. Pages visibles seulement avec `npm run dev`.
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/dev.ts'

export default {
  titre: 'Diorren', // br: à relire
  intro: 'N’emañ ar bajenn-mañ hag he skouerioù nemet gant <code>npm run dev</code> : na chom netra anezho er build.', // br: à relire
  exemples: 'Skouerioù evit kregiñ', // br: à relire
  documentation: 'Teuliadur', // br: à relire
  exerciceSimpleTitre: 'Skouer ur boelladenn simpl', // br: à relire
  exerciceSimpleDescription: 'un heuliad niveroù da glokaat : livioù, bonus, er-maez ar programm, fichenn dre barregezh, c’hoari ha fichenn da voullañ ; etrefas e yezh ar skramm, danvez ar fichenn troet ivez', // br: à relire
  exerciceCorpusTitre: 'Skouer ur boelladenn gant korpus', // br: à relire
  exerciceCorpusDescription: 'ar gerioù kenster : poelladenn c’hallek (danvez e galleg atav, katalog e galleg hepken), korpus e src/data/, QCM, testennoù an etrefas troet a-ziforc’h', // br: à relire
  afficheTitre: 'Skouer ur skritell', // br: à relire
  afficheDescription: 'ar vandenn niveroù : stummoù MS ha GS, dibaboù, furmskrid hollek, moullañ A4 / A3', // br: à relire
  docExercice: 'krouiñ ur boelladenn (npm run nouveau -- exercice <id> "<Titre>" --modele simple|corpus, pe eilañ ur skouer)', // br: à relire
  docAffiche: 'krouiñ ur skritell (npm run nouveau -- affiche <id> "<Titre>", pe eilañ exemple/)', // br: à relire
  afficheDevTitre: 'Skouer skritell (dev)', // br: à relire
  afficheDevIntro: 'Gwelit src/affiches/README.md. N’eus ket eus ar bajenn-mañ er produiñ.', // br: à relire
} satisfies Traductions<typeof fr>
