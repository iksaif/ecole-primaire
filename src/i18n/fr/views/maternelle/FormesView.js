// Textes de l'interface — FormesView (français).
// Clés partagées avec src/i18n/br/views/maternelle/FormesView.js (vérifier avec `npm run i18n`).
export default {
    titre: 'Les formes',
    exercice: 'Exercice',
    reconnaitre: 'Reconnaître', reconnaitreDesc: 'Trouve le nom de la forme',
    compter: 'Compter les côtés', combienCotes: 'Combien de côtés a cette forme ?',
    trouver: 'Trouver la forme', trouverDesc: "Montre la forme qu'on te demande",
    commentSappelle: "Comment s'appelle cette forme ?",
    montre: 'Montre le',
    changer: '⚙️ Changer',
    res100: 'Parfait ! Tu connais toutes les formes ! 🏆',
    res75: 'Très bien ! 🌟',
    res50: 'Bien ! Regarde les formes autour de toi 💪',
    res0: 'Courage ! Observe les formes dans la classe 📐',
    noteFiche: 'Fiche : colorie chaque forme de sa couleur, puis compte-les.',
    fConsigne: 'Colorie chaque forme de la bonne couleur.',
    fCompte: 'Combien y en a-t-il ? Écris le nombre.',
    rouge: 'rouge', bleu: 'bleu', vert: 'vert', jaune: 'jaune',
    // Corrections ; {nom} = nom de la forme dans la langue du contenu
    erreurNom: "❌ C'est un {nom}",
    erreurCotes: ({ nom, n }) => `❌ Un ${nom} ${n === 0 ? "n'a aucun côté droit" : 'a ' + n + ' côté' + (n > 1 ? 's' : '')}`,
    erreurForme: '❌ C\'était le {nom}',
  }
