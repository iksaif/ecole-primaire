<template>
  <div class="container">
    <h1 class="section-heading">Développement</h1>
    <p class="intro">Cette page et ses exemples n'existent qu'avec <code>npm run dev</code> : rien n'en reste dans le build.</p>

    <h2>Exemples de départ</h2>
    <ul class="liste">
      <li v-for="e in EXEMPLES" :key="e.titre">
        <router-link :to="e.to">{{ e.titre }}</router-link> — {{ e.description }}
        <div class="fichiers">{{ e.fichiers }}</div>
      </li>
    </ul>

    <h2>Documentation</h2>
    <ul class="liste">
      <li v-for="d in DOCS" :key="d.fichier"><code>{{ d.fichier }}</code> — {{ d.description }}</li>
    </ul>
  </div>
</template>

<script setup>
// Page de développement (route /dev, ajoutée par src/router/index.js seulement sous import.meta.env.DEV).
// Pour ajouter un exemple ou un document : une entrée de plus dans EXEMPLES ou DOCS.
const EXEMPLES = [
  {
    titre: 'Exemple d\'exercice simple',
    to: '/dev/exemple',
    description: 'une suite de nombres à compléter : niveaux, bonus, hors programme, fiche par compétence, jeu et fiche imprimable ; un seul catalogue de textes',
    fichiers: 'src/exercices/exemple/ et src/views/dev/ExempleView.vue',
  },
  {
    titre: 'Exemple d\'exercice à corpus',
    to: '/dev/exemple-corpus',
    description: 'les synonymes : exercice de français (contenu toujours en français), corpus dans src/data/, QCM, textes d\'interface à part',
    fichiers: 'src/exercices/exemple-corpus/, src/data/exemple-corpus.ts et src/views/dev/ExempleCorpusView.vue',
  },
  {
    titre: 'Exemple d\'affiche',
    to: '/dev/affiches?affiche=exemple',
    description: 'la bande numérique : variantes MS et GS, options, formulaire générique, impression A4 / A3',
    fichiers: 'src/affiches/exemple/ et src/views/dev/AfficheDevView.vue',
  },
]
const DOCS = [
  { fichier: 'src/exercices/README.md', description: 'créer un exercice (npm run nouveau -- exercice <id> "<Titre>" --modele simple|corpus, ou copier un exemple)' },
  { fichier: 'src/affiches/README.md', description: 'créer une affiche (npm run nouveau -- affiche <id> "<Titre>", ou copier exemple/)' },
]
</script>

<style scoped>
.intro { color: #666; margin: -.5rem 0 1rem; }
h2 { font-size: 1.1rem; margin: 1.5rem 0 .5rem; }
.liste { padding-left: 1.2rem; line-height: 1.7; }
.fichiers { font-size: .8rem; color: #888; font-family: monospace; }
</style>
