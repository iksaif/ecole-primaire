<template>
  <div class="container" data-page="apropos">
    <div class="about-box">
      <div class="disclaimer">
        <div class="disclaimer-icon">⚠️</div>
        <div><strong>{{ t('apropos.avertissementTitre') }}</strong> {{ t('apropos.avertissement') }}</div>
      </div>
      <!-- les langues dont la traduction n'est pas relue : avis en français (langue source) -->
      <p v-for="l in nonRelues" :key="l.code" class="about-para avis-fr" lang="fr">
        {{ contenuSource.t('apropos.traductionAuto', { langue: l.nom[LANGUE_SOURCE], contact: SITE.contact }) }}
      </p>

      <h1 class="section-heading titre">{{ t('apropos.titre') }}</h1>
      <p class="about-para">{{ t('apropos.intro') }}</p>

      <h2 class="about-h2">🛠️ {{ t('apropos.comment') }}</h2>
      <ul class="about-list">
        <li v-for="ligne in liste('apropos.commentListe')" :key="ligne">{{ ligne }}</li>
      </ul>

      <h2 class="about-h2">🔤 {{ t('apropos.polices') }}</h2>
      <p class="about-para">{{ t('apropos.policesTexte') }}</p>

      <h2 class="about-h2">🤝 {{ t('apropos.contribuer') }}</h2>
      <p class="about-para">{{ depot[0] }}<a :href="SITE.depot" target="_blank" rel="noopener">{{ DEPOT_TEXTE }}</a>{{ depot[1] }}</p>
      <ul class="about-list">
        <li>🐞 {{ erreur[0] }}<a :href="`mailto:${SITE.contact}`">{{ SITE.contact }}</a>{{ erreur[1] }}
          (<a :href="`${SITE.depot}/issues/new`" target="_blank" rel="noopener">{{ t('apropos.issue') }}</a>)</li>
        <li>💡 {{ t('apropos.contribuerProposer') }}</li>
        <li><IconeMatiere matiere="regionale" /> {{ t('apropos.contribuerRelire') }}</li>
        <li>👩‍🏫 {{ t('apropos.contribuerEnseignant') }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SITE } from '../sites.ts'
import IconeMatiere from '../shell/IconeMatiere.vue'
import { useLangue } from '../langues/useLangue.ts'
import { LANGUES, CODES, LANGUE_SOURCE } from '../langues/registre.ts'
import { contenu } from '../langues/traduire.ts'

const { t, liste } = useLangue()
const contenuSource = contenu(LANGUE_SOURCE)
// langues proposées par le site dont la traduction reste à relire
const nonRelues = CODES.filter(c => SITE.languesInterface.includes(c) && !LANGUES[c].traductionRelue).map(c => LANGUES[c])

// Un texte avec un lien au milieu : le paramètre prend la place du lien, on coupe autour
const MARQUE = '\u0000'
const DEPOT_TEXTE = `GitHub (${SITE.depot.replace('https://github.com/', '')})`
const coupe = (texte: string): [string, string] => {
  const i = texte.indexOf(MARQUE)
  return i < 0 ? [texte, ''] : [texte.slice(0, i), texte.slice(i + 1)]
}
const depot = computed(() => coupe(t('apropos.contribuerTexte', { depot: MARQUE })))
const erreur = computed(() => coupe(t('apropos.contribuerErreur', { contact: MARQUE })))
</script>

<style scoped>
.avis-fr { background: #f4f6fb; border-radius: 8px; padding: .6rem .9rem; font-size: .9rem; margin-top: 1rem; }
.about-box { max-width: 720px; margin: 0 auto; background: white; border-radius: var(--radius); box-shadow: var(--shadow); padding: 2rem 2rem 2.5rem; }
.titre { margin-top: 1.5rem; }
.disclaimer { display: flex; align-items: flex-start; gap: 1rem; background: #fff8e1; border: 2px solid var(--orange); border-radius: 10px; padding: 1rem 1.25rem; font-size: .95rem; line-height: 1.5; }
.disclaimer-icon { font-size: 1.8rem; flex-shrink: 0; }
.about-h2 { font-size: 1.1rem; font-weight: 800; margin: 1.5rem 0 .5rem; color: var(--bleu); }
.about-para { font-size: .95rem; line-height: 1.6; color: #444; }
.about-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: .4rem; font-size: .95rem; color: #444; line-height: 1.5; }
a { color: var(--bleu); }
a:hover { text-decoration: underline; }
</style>
