<template>
  <div class="container">
    <h1 class="section-heading">{{ t('dev.titre') }}</h1>
    <p class="intro" v-html="t('dev.intro')"></p>

    <h2>{{ t('dev.exemples') }}</h2>
    <ul class="liste">
      <li v-for="e in EXEMPLES" :key="e.to">
        <router-link :to="e.to">{{ t(e.titre) }}</router-link> — {{ t(e.description) }}
        <div class="fichiers">{{ e.fichiers }}</div>
      </li>
    </ul>

    <h2>{{ t('dev.documentation') }}</h2>
    <ul class="liste">
      <li v-for="d in DOCS" :key="d.fichier"><code>{{ d.fichier }}</code> — {{ t(d.description) }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
// Page de développement (route /dev, ajoutée par src/router/index.ts seulement sous import.meta.env.DEV).
// Pour ajouter un exemple ou un document : une entrée de plus dans EXEMPLES ou DOCS, et ses textes dans la section `dev`.
import { useLangue } from '../../langues/useLangue.ts'
import type { CleTexte } from '../../langues/traduire.ts'

type CleDev = Extract<CleTexte, `dev.${string}`>

const { t } = useLangue()
const EXEMPLES: { titre: CleDev, to: string, description: CleDev, fichiers: string }[] = [
  { titre: 'dev.exerciceSimpleTitre', to: '/dev/exemple', description: 'dev.exerciceSimpleDescription', fichiers: 'src/exercices/exemple/ et src/views/dev/ExempleView.vue' },
  { titre: 'dev.exerciceCorpusTitre', to: '/dev/exemple-corpus', description: 'dev.exerciceCorpusDescription',
    fichiers: 'src/exercices/exemple-corpus/, src/data/exemple-corpus.ts et src/views/dev/ExempleCorpusView.vue' },
  { titre: 'dev.afficheTitre', to: '/dev/affiches?affiche=exemple', description: 'dev.afficheDescription', fichiers: 'src/affiches/exemple/ et src/views/dev/AfficheDevView.vue' },
]
const DOCS: { fichier: string, description: CleDev }[] = [
  { fichier: 'src/exercices/README.md', description: 'dev.docExercice' },
  { fichier: 'src/affiches/README.md', description: 'dev.docAffiche' },
]
</script>

<style scoped>
.intro { color: #666; margin: -.5rem 0 1rem; }
h2 { font-size: 1.1rem; margin: 1.5rem 0 .5rem; }
.liste { padding-left: 1.2rem; line-height: 1.7; }
.fichiers { font-size: .8rem; color: #888; font-family: monospace; }
</style>
