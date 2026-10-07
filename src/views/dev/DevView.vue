<template>
  <div class="container">
    <h1 class="section-heading">{{ t('dev.titre') }}</h1>
    <p class="intro" v-html="t('dev.intro')"></p>

    <h2>{{ t('dev.exemples') }}</h2>
    <ul class="liste">
      <li v-for="e in EXEMPLES" :key="e.to">
        <router-link :to="e.to">{{ e.titre }}</router-link> — {{ e.description }}
        <div class="fichiers">{{ e.fichiers }}</div>
      </li>
      <li v-for="e in PAGES" :key="e.to">
        <router-link :to="e.to">{{ t(e.titre) }}</router-link> — {{ t(e.description) }}
        <div class="fichiers">{{ e.fichiers }}</div>
      </li>
      <!-- la visite guidée de la première visite, rouverte même si elle a déjà été vue -->
      <li>
        <button type="button" class="lien" @click="revoirAssistant(router)">{{ t('dev.assistantTitre') }}</button> — {{ t('dev.assistantDescription') }}
        <div class="fichiers">src/shell/AssistantAccueil.vue, src/shell/assistant.ts</div>
      </li>
    </ul>

    <h2>{{ t('dev.documentation') }}</h2>
    <ul class="liste">
      <li v-for="d in DOCS" :key="d.fichier"><code>{{ d.fichier }}</code> — {{ t(d.description) }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
// Page de développement (route /dev, ajoutée par src/router/index.ts seulement en développement : src/dev.ts).
// Les exemples viennent des registres (exercices : `exemple: true` de src/exercices/index.ts ; affiches : src/affiches/dev.ts),
// jamais d'une liste écrite ici : un exemple de plus au registre apparaît tout seul. Seules la page des composants et la
// documentation sont listées à la main (DOCS, PAGES).
import { useLangue } from '../../langues/useLangue.ts'
import { traducteur } from '../../langues/catalogue.ts'
import { traducteurAffiche } from '../../affiches/textes.ts'
import { competenceDe } from '../../data/programme.ts'
import type { CleTexte } from '../../langues/traduire.ts'
import { REGISTRE } from '../../exercices/index.ts'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { ModuleAffiche } from '../../affiches/types.ts'
import { revoirAssistant } from '../../shell/assistant.ts'

const router = useRouter()

// clés sans paramètre (celles de la page de couverture qui en ont ne sont pas listées ici)
type CleDev = Exclude<Extract<CleTexte, `dev.${string}`>, 'dev.couvertureBase'>

const { t, langue } = useLangue()
interface Exemple { titre: string, to: string, description: string, fichiers: string }
const titreExercice = (textes: Parameters<typeof traducteur>[0]) => traducteur(textes, () => langue.value)('titre')
const libelles = (ids: readonly string[]) => ids.map(k => competenceDe(k)?.libelle ?? k).join(' ; ')

// les affiches d'exemple : import dynamique (src/affiches/dev.ts n'est jamais importé statiquement, tests/affiches-modele.test.mjs)
const affiches = ref<ModuleAffiche[]>([])
onMounted(async () => { affiches.value = (await import('../../affiches/dev.ts')).EXEMPLES as ModuleAffiche[] })
const EXEMPLES = computed<Exemple[]>(() => [
  ...REGISTRE.filter(e => e.exemple).map(e => ({
    titre: titreExercice(e.textes), to: e.definition.route,
    description: `${Object.keys(e.definition.niveaux).join(', ')} — ${libelles([...new Set(Object.values(e.definition.niveaux).flatMap(n => n?.competences ?? []))])}`,
    fichiers: `src/exercices/${e.definition.id}/`,
  })),
  ...affiches.value.map(a => ({
    titre: traducteurAffiche(a.textes, langue.value)('titre'), to: `/dev/affiches?affiche=${a.definition.id}`,
    description: `affiche — ${Object.keys(a.definition.variantes).join(', ')}`,
    fichiers: `src/affiches/${a.definition.id}/`,
  })),
])
// pages de développement qui ne sont pas des exemples d'un registre
const PAGES: { titre: CleDev, to: string, description: CleDev, fichiers: string }[] = [
  { titre: 'dev.composantsTitre', to: '/dev/composants', description: 'dev.composantsDescription', fichiers: 'src/noyau/ et src/views/dev/ComposantsView.vue' },
  { titre: 'dev.couvertureTitre', to: '/dev/couverture', description: 'dev.couvertureDescription', fichiers: 'src/views/dev/CouvertureDevView.vue (programme : src/data/programme.ts)' },
]
const DOCS: { fichier: string, description: CleDev }[] = [
  { fichier: 'src/exercices/README.md', description: 'dev.docExercice' },
  { fichier: 'src/affiches/README.md', description: 'dev.docAffiche' },
]
</script>

<style scoped>
.intro { color: var(--texte-doux); margin: -.5rem 0 1rem; }
h2 { font-size: 1.1rem; margin: 1.5rem 0 .5rem; }
.liste { padding-left: 1.2rem; line-height: 1.7; }
.lien { border: none; background: none; padding: 0; font: inherit; color: var(--bleu-fort); text-decoration: underline; cursor: pointer; }
.fichiers { font-size: .8rem; color: var(--texte-doux); font-family: monospace; }
</style>
