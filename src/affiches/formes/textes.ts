// Les textes de l'affiche « Figures et solides », par langue de l'affiche, lus avec T(clé) (`traducteurAffiche`, src/affiches/textes.ts).
//   titre, variante.<id>.court|titre|description : la convention des affiches ; lot.<variante> : le titre imprimé de la variante ;
//   figure.<id>.nom|info, solide.<id>.nom|info : le nom (avec son article) et les propriétés de chaque dessin (les retours à la ligne
//   sont des « \n ») ; legende.* : la légende au-dessus des cartes.
// Breton : chaque texte est à faire relire.
import type { TextesAffiche } from '../types.ts'

export const TEXTES: TextesAffiche = {
  fr: {
    titre: 'Les figures et les solides',
    'variante.plan-cycle2.court': 'Formes planes',
    'variante.plan-cycle2.titre': 'Affiche des formes planes : disque, carré, rectangle, triangle',
    'variante.plan-cycle2.description': 'Les quatre formes planes de référence du cycle 2, avec leurs côtés et leurs angles droits.',
    'variante.plan-gs.court': 'Formes planes (maternelle)',
    'variante.plan-gs.titre': 'Affiche des formes planes de la grande section : disque, carré, rectangle, triangle',
    'variante.plan-gs.description': 'Les quatre formes planes à nommer en grande section, avec leurs côtés et leurs angles droits.',
    'variante.plan-ce1.court': 'Formes planes CE1',
    'variante.plan-ce1.titre': 'Affiche des formes planes du CE1 : disque, carré, rectangle, triangle',
    'variante.plan-ce1.description': "Les quatre formes planes de référence, avec leurs angles droits (programme du CE1).",
    'lot.plan-ce1': 'Les formes planes',
    'variante.plan-cm1.court': 'Figures planes CM1',
    'variante.plan-cm1.titre': 'Affiche des figures planes du CM1',
    'variante.plan-cm1.description': 'Carré, rectangle, losange, triangle rectangle, isocèle, équilatéral et disque, avec leurs propriétés (programme du CM1).',
    'variante.plan-cycle3.court': 'Figures planes CM2',
    'variante.plan-cycle3.titre': 'Affiche des figures planes du cycle 3 (CM2)',
    'variante.plan-cycle3.description': 'Triangle rectangle, isocèle, équilatéral, losange, trapèze, pentagone, hexagone… avec leurs propriétés (programme du CM2).',
    'variante.solides-maternelle.court': 'Solides (maternelle)',
    'variante.solides-maternelle.titre': 'Affiche des solides de la maternelle : cube, pavé, boule, cylindre, cône, pyramide',
    'variante.solides-maternelle.description': 'Les six solides à reconnaître et à nommer, chacun avec un objet de tous les jours (dé, boîte, ballon, boîte de conserve, glace).',
    'variante.solides-ce2.court': 'Solides',
    'variante.solides-ce2.titre': 'Affiche des solides : cube, pavé, boule, cylindre, cône, pyramide',
    'variante.solides-ce2.description': 'Les six solides du programme du CE1 et du CE2 avec le nombre et la nature de leurs faces, sommets et arêtes.',
    'variante.solides-cm1.court': 'Solides et prisme',
    'variante.solides-cm1.titre': 'Affiche des solides avec le prisme droit',
    'variante.solides-cm1.description': 'Cube, pavé, prisme droit, pyramide, cylindre, cône et boule (programme du CM1).',
    'lot.plan-cycle2': 'Les formes planes',
    'lot.plan-gs': 'Les formes planes',
    'lot.plan-cm1': 'Les figures planes',
    'lot.plan-cycle3': 'Les figures planes',
    'lot.solides-maternelle': 'Je reconnais les solides',
    'lot.solides-ce2': 'Les solides',
    'lot.solides-cm1': 'Les solides',
    'legende.traits': 'traits rouges',
    'legende.cotes': 'côtés de même longueur',
    'legende.angles': 'angles droits',
    'legende.paralleles': 'côtés parallèles',
    'legende.rayon': 'centre et rayon du disque',
    'groupe.proprietes': 'Propriétés à montrer',
    'reglage.angles': 'Angles droits', 'valeur.angles.true': 'Marqués', 'valeur.angles.false': 'Non',
    'reglage.cotes': 'Côtés de même longueur', 'valeur.cotes.true': 'Marqués', 'valeur.cotes.false': 'Non',
    'reglage.paralleles': 'Côtés parallèles', 'valeur.paralleles.true': 'Marqués', 'valeur.paralleles.false': 'Non',
    'reglage.rayon': 'Centre et rayon du disque', 'valeur.rayon.true': 'Marqués', 'valeur.rayon.false': 'Non',
    'reglage.faces': 'Faces, sommets et arêtes', 'valeur.faces.true': 'Écrits', 'valeur.faces.false': 'Non',
    'aide.rayon': 'Le centre (un point rouge) et un rayon (un trait rouge) du disque, sans lesquels le disque reste un simple rond.',
    'aide.angles': "Le petit équerre rouge sur chaque angle droit, et son nom sous la figure.",
    'aide.cotes': 'Les traits rouges des côtés de même longueur, et leur nom sous la figure.',
    'aide.paralleles': 'Le double chevron des côtés parallèles (trapèze), et son nom sous la figure.',
    'aide.faces': 'Le nombre de faces, de sommets et d’arêtes sous le nom du solide.',
    'legende.solides': 'Arêtes cachées en pointillés',
    'figure.disque.nom': 'le disque', 'figure.disque.info': 'Un rond plein.\nLe bord est un cercle.',
    'figure.carre.nom': 'le carré', 'figure.carre.info': '4 côtés\n4 sommets', 'figure.carre.cotes': '4 côtés égaux', 'figure.carre.angles': '4 angles droits',
    'figure.rectangle.nom': 'le rectangle', 'figure.rectangle.info': '4 côtés\n4 sommets', 'figure.rectangle.angles': '4 angles droits', 'figure.rectangle.cotes': 'côtés opposés égaux',
    'figure.triangle.nom': 'le triangle', 'figure.triangle.info': '3 côtés\n3 sommets',
    'figure.triangle-rectangle.nom': 'le triangle rectangle', 'figure.triangle-rectangle.info': '3 côtés\n3 sommets', 'figure.triangle-rectangle.angles': '1 angle droit',
    'figure.isocele.nom': 'le triangle isocèle', 'figure.isocele.info': '3 côtés\n3 sommets', 'figure.isocele.cotes': '2 côtés égaux',
    'figure.equilateral.nom': 'le triangle équilatéral', 'figure.equilateral.info': '3 côtés\n3 sommets', 'figure.equilateral.cotes': '3 côtés égaux',
    'figure.losange.nom': 'le losange', 'figure.losange.info': '4 côtés\n4 sommets', 'figure.losange.cotes': '4 côtés égaux',
    'figure.trapeze.nom': 'le trapèze', 'figure.trapeze.info': '4 côtés\n4 sommets', 'figure.trapeze.paralleles': '2 côtés parallèles\n(les bases)',
    'figure.pentagone.nom': 'le pentagone', 'figure.pentagone.info': '5 côtés\n5 sommets',
    'figure.hexagone.nom': "l'hexagone", 'figure.hexagone.info': '6 côtés\n6 sommets',
    'solide.cube.nom': 'le cube', 'solide.cube.info': '6 faces carrées\n8 sommets · 12 arêtes',
    'solide.pave.nom': 'le pavé (parallélépipède rectangle)', 'solide.pave.info': '6 faces rectangulaires\n8 sommets · 12 arêtes',
    'solide.boule.nom': 'la boule', 'solide.boule.info': 'Aucune face plane\nune surface courbe',
    'solide.cylindre.nom': 'le cylindre', 'solide.cylindre.info': '2 faces planes (des disques)\n+ 1 surface courbe',
    'solide.cone.nom': 'le cône', 'solide.cone.info': '1 face plane (un disque)\n+ 1 surface courbe\n1 sommet',
    // maternelle : le nom court (« pavé », sans parallélépipède ; « pyramide », sans la base)
    'solide.pave.nom.solides-maternelle': 'le pavé', 'solide.pyramide.nom.solides-maternelle': 'la pyramide',
    'solide.pyramide.nom': 'la pyramide (base carrée)', 'solide.pyramide.info': '5 faces : 1 carré + 4 triangles\n5 sommets · 8 arêtes',
    'solide.prisme.nom': 'le prisme droit', 'solide.prisme.info': '5 faces : 2 triangles + 3 rectangles\n6 sommets · 9 arêtes',
  },
  br: {
    titre: 'Ar stummoù hag ar soludoù', // br: à relire
    'variante.plan-cycle2.court': 'Stummoù plaen', // br: à relire
    'variante.plan-cycle2.titre': "Skritell ar stummoù plaen : pladenn, karrez, skouergorneg, tric'horn", // br: à relire
    'variante.plan-cycle2.description': "Ar pevar stumm plaen da reiñ skouer er c'helc'hiad 2, gant o c'hostezioù hag o c'hornioù skouer.", // br: à relire
    'variante.plan-gs.court': 'Stummoù plaen (skol-vamm)', // br: à relire
    'variante.plan-gs.titre': "Skritell ar stummoù plaen eus ar renk meur : pladenn, karrez, skouergorneg, tric'horn", // br: à relire
    'variante.plan-gs.description': "Ar pevar stumm plaen da envel er renk meur, gant o c'hostezioù hag o c'hornioù skouer.", // br: à relire
    'variante.plan-ce1.court': 'Stummoù plaen CE1', // br: à relire
    'variante.plan-ce1.titre': "Skritell ar stummoù plaen eus ar CE1 : pladenn, karrez, skouergorneg, tric'horn", // br: à relire
    'variante.plan-ce1.description': "Ar pevar stumm plaen da reiñ skouer, gant o c'hornioù skouer (programm ar CE1).", // br: à relire
    'lot.plan-ce1': 'Ar stummoù plaen', // br: à relire
    'variante.plan-cm1.court': 'Stummoù plaen CM1', // br: à relire
    'variante.plan-cm1.titre': 'Skritell ar stummoù plaen eus ar CM1', // br: à relire
    'variante.plan-cm1.description': "Karrez, skouergorneg, lozanj, tric'horn skouer, tric'horn kevreizh, tric'horn kevatal ha pladenn, gant o c'herzhioù (programm ar CM1).", // br: à relire
    'variante.plan-cycle3.court': 'Stummoù plaen CM2', // br: à relire
    'variante.plan-cycle3.titre': "Skritell ar stummoù plaen eus ar c'helc'hiad 3 (CM2)", // br: à relire
    'variante.plan-cycle3.description': "Tric'horn skouer, kevreizh, kevatal, lozanj, trapez, pentagon, hexagon… gant o c'herzhioù (programm ar CM2).", // br: à relire
    'variante.solides-maternelle.court': 'Soludoù (skol-vamm)', // br: à relire
    'variante.solides-maternelle.titre': 'Skritell soludoù ar skol-vamm : kub, hirgarrezeg, boull, silindr, kon, piramid', // br: à relire
    'variante.solides-maternelle.description': 'Ar c’hwec’h solud da anavezout ha da envel, pep hini gant un dra pemdez.', // br: à relire
    'variante.solides-ce2.court': 'Soludoù', // br: à relire
    'variante.solides-ce2.titre': "Skritell ar soludoù : kub, hirgarrezeg, boull, silindr, kon, piramid", // br: à relire
    'variante.solides-ce2.description': "Ar c'hwec'h solud eus programm ar CE1 hag ar CE2 gant niver ha giz o zaloù, o begoù hag o biñsoù.", // br: à relire
    'variante.solides-cm1.court': 'Soludoù ha prism', // br: à relire
    'variante.solides-cm1.titre': 'Skritell ar soludoù gant ar prism eeun', // br: à relire
    'variante.solides-cm1.description': 'Kub, hirgarrezeg, prism eeun, piramid, silindr, kon ha boull (programm ar CM1).', // br: à relire
    'lot.plan-cycle2': 'Ar stummoù plaen', // br: à relire
    'lot.plan-gs': 'Ar stummoù plaen', // br: à relire
    'lot.plan-cm1': 'Ar stummoù plaen', // br: à relire
    'lot.plan-cycle3': 'Ar stummoù plaen', // br: à relire
    'lot.solides-maternelle': 'Anavezout a ran ar soludoù', // br: à relire
    'lot.solides-ce2': 'Ar soludoù', // br: à relire
    'lot.solides-cm1': 'Ar soludoù', // br: à relire
    'legende.traits': 'linennoù ruz', // br: à relire
    'legende.cotes': "kostezioù hir kement-ha-kement", // br: à relire
    'legende.angles': 'kornioù skouer', // br: à relire
    'legende.paralleles': 'kostezioù kenstok', // br: à relire
    'legende.rayon': 'kreiz ha skin ar bluenn', // br: à relire
    'groupe.proprietes': 'Perzhioù da ziskouez', // br: à relire
    'reglage.angles': 'Kornioù skouer', 'valeur.angles.true': 'Merket', 'valeur.angles.false': 'Nann', // br: à relire
    'reglage.cotes': "Kostezioù hir kement-ha-kement", 'valeur.cotes.true': 'Merket', 'valeur.cotes.false': 'Nann', // br: à relire
    'reglage.paralleles': 'Kostezioù kenstok', 'valeur.paralleles.true': 'Merket', 'valeur.paralleles.false': 'Nann', // br: à relire
    'reglage.rayon': 'Kreiz ha skin ar bluenn', 'valeur.rayon.true': 'Merket', 'valeur.rayon.false': 'Nann', // br: à relire
    'reglage.faces': 'Talioù, begoù ha biñsoù', 'valeur.faces.true': 'Skrivet', 'valeur.faces.false': 'Nann', // br: à relire
    'aide.rayon': 'Kreiz ar bluenn (ur poent ruz) hag ur skin (ul linenn ruz), hep ar re-se e chom ar bluenn ur c\'helc\'h hepken.', // br: à relire
    'aide.angles': "An ekr ruz bihan war pep korn skouer, hag e anv dindan ar stumm.", // br: à relire
    'aide.cotes': "Al linennoù ruz eus ar c'hostezioù hir kement-ha-kement, hag o anv dindan ar stumm.", // br: à relire
    'aide.paralleles': "An div c'hroaz-nijal eus ar c'hostezioù kenstok (trapez), hag o anv dindan ar stumm.", // br: à relire
    'aide.faces': 'Niver an talioù, ar begoù hag ar biñsoù dindan anv ar solud.', // br: à relire
    'legende.solides': 'Ar biñsoù kuzhet e pikennoù', // br: à relire
    'figure.disque.nom': 'ar pladenn', 'figure.disque.info': "Ur c'helc'h leun.\nAr riblenn a zo ur c'helc'h.", // br: à relire
    'figure.carre.nom': "ar c'harrez", 'figure.carre.info': '4 kostez\n4 beg', 'figure.carre.cotes': "4 c'hostez ingal", 'figure.carre.angles': "4 c'horn skouer", // br: à relire
    'figure.rectangle.nom': 'ar skouergorneg', 'figure.rectangle.info': '4 kostez\n4 beg', 'figure.rectangle.angles': "4 c'horn skouer", 'figure.rectangle.cotes': 'kostezioù a-dal ingal', // br: à relire
    'figure.triangle.nom': "an tric'horn", 'figure.triangle.info': "3 c'hostez\n3 beg", // br: à relire
    'figure.triangle-rectangle.nom': "an tric'horn skouer", 'figure.triangle-rectangle.info': "3 c'hostez\n3 beg", 'figure.triangle-rectangle.angles': "1 c'horn skouer", // br: à relire
    'figure.isocele.nom': "an tric'horn kevreizh", 'figure.isocele.info': "3 c'hostez\n3 beg", 'figure.isocele.cotes': '2 gostez ingal', // br: à relire
    'figure.equilateral.nom': "an tric'horn kevatal", 'figure.equilateral.info': "3 c'hostez\n3 beg", 'figure.equilateral.cotes': "3 c'hostez ingal", // br: à relire
    'figure.losange.nom': 'al lozanj', 'figure.losange.info': "4 c'hostez\n4 beg", 'figure.losange.cotes': "4 c'hostez ingal", // br: à relire
    'figure.trapeze.nom': 'an trapez', 'figure.trapeze.info': "4 c'hostez\n4 beg", 'figure.trapeze.paralleles': '2 gostez kenstok\n(ar bonioù)', // br: à relire
    'figure.pentagone.nom': 'ar pentagon', 'figure.pentagone.info': "5 kostez\n5 beg", // br: à relire
    'figure.hexagone.nom': 'an hexagon', 'figure.hexagone.info': "6 c'hostez\n6 beg", // br: à relire
    'solide.cube.nom': "ar c'hub", 'solide.cube.info': "6 zal karrez\n8 beg · 12 biñs", // br: à relire
    'solide.pave.nom': 'an hirgarrezeg', 'solide.pave.info': "6 zal skouergorneg\n8 beg · 12 biñs", // br: à relire
    'solide.boule.nom': 'ar boull', 'solide.boule.info': "Tal plaen ebet\nun dremm gromm", // br: à relire
    'solide.cylindre.nom': 'ar silindr', 'solide.cylindre.info': "2 zal blaen (pladennoù)\n+ 1 dremm gromm", // br: à relire
    'solide.cone.nom': "ar c'hon", 'solide.cone.info': "1 tal plaen (ur bladenn)\n+ 1 dremm gromm\n1 beg", // br: à relire
    'solide.pave.nom.solides-maternelle': 'an hirgarrezeg', 'solide.pyramide.nom.solides-maternelle': 'ar piramid', // br: à relire
    'solide.pyramide.nom': 'ar piramid (diazez karrez)', 'solide.pyramide.info': "5 tal : 1 c'harrez + 4 tric'horn\n5 beg · 8 biñs", // br: à relire
    'solide.prisme.nom': 'ar prism eeun', 'solide.prisme.info': "5 tal : 2 dric'horn + 3 skouergorneg\n6 beg · 9 biñs", // br: à relire
  },
}
