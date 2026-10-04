<template>
  <div class="container">
    <!-- En-tête : le titre, puis « ma classe » (le filtre de tout le site), puis deux accès : le programme de la
         classe et les nouveautés -->
    <header class="hero">
      <h1>{{ t('bienvenue') }}</h1>
      <p class="accroche">{{ t('accroche') }}</p>

      <div class="ma-classe" role="group" :aria-label="t('maClasse')">
        <span class="ma-classe-titre">🎒 {{ t('maClasse') }}</span>
        <div class="puces">
          <button v-for="c in CLASSES" :key="c.id" class="puce" :class="{ active: classe === c.id }"
            :aria-pressed="classe === c.id" @click="classe = classe === c.id ? '' : c.id">{{ c.label }}</button>
          <button class="puce toutes" :class="{ active: !classe }" :aria-pressed="!classe" @click="classe = ''">{{ t('toutes') }}</button>
        </div>
      </div>

      <div class="acces">
        <RouterLink to="/programme" class="tuile programme">
          <span class="tuile-icone">📚</span>
          <span><strong>{{ classe ? t('programmeDe', { classe: labelClasse, en: enClasse(classe) }) : t('programme') }}</strong>
            <small>{{ t('programmeDesc') }}</small></span>
        </RouterLink>
        <RouterLink to="/nouveautes" class="tuile nouveautes">
          <span class="tuile-icone">🆕</span>
          <span><strong>{{ t('nouveautes') }}</strong><small>{{ t('nouveau') }}</small></span>
        </RouterLink>
      </div>
    </header>

    <div v-for="m in matieresVisibles" :key="m.id" class="matiere-section" :class="{ 'imprimer-section': m.id === 'imprimer' }">
      <h2 class="section-heading">
        {{ langue === 'br' ? m.br : m.titre }}
        <RouterLink v-if="m.id === 'imprimer'" to="/imprimer" class="voir-tout">{{ t('voirTout') }}</RouterLink>
      </h2>
      <GrilleActivites :matiere="m.id" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import GrilleActivites from '../components/GrilleActivites.vue'
import { MATIERES, CLASSES, ACTIVITES } from '../data/activites'
import { useClasse } from '../composables/useClasse'
import { enClasse } from '../data/classes'
import { useI18n } from '../i18n'
import messagesFr from '../i18n/fr/views/HomeView.js'
import messagesBr from '../i18n/br/views/HomeView.js'

const { t, langue } = useI18n({ fr: messagesFr, br: messagesBr })

const classe = useClasse()
const matieresVisibles = computed(() => MATIERES.filter(m =>
  ACTIVITES.some(a => a.matiere === m.id && (!classe.value || a.niveaux.includes(classe.value)))))
const labelClasse = computed(() => CLASSES.find(c => c.id === classe.value)?.label)
</script>

<style scoped>
.hero { text-align: center; padding: 2rem 0 1.75rem; }
.hero h1 { font-size: 2.3rem; font-weight: 900; color: var(--bleu); margin-bottom: .4rem; }
.accroche { font-size: 1.1rem; color: #555; max-width: 560px; margin: 0 auto 1.4rem; }

.ma-classe {
  display: inline-flex; align-items: center; gap: .4rem .8rem; flex-wrap: wrap; justify-content: center;
  background: white; box-shadow: var(--shadow); border-radius: 999px; padding: .5rem .6rem .5rem 1.1rem;
}
.ma-classe-titre { font-weight: 800; font-size: .95rem; color: #555; white-space: nowrap; }
.puces { display: flex; flex-wrap: wrap; gap: .3rem; justify-content: center; }
.puce {
  border: 2px solid var(--gris-brd); background: white; border-radius: 999px; padding: .3rem .75rem;
  font: inherit; font-weight: 800; font-size: .9rem; color: var(--texte); cursor: pointer; transition: all .15s;
}
.puce:hover { border-color: var(--vert); }
.puce.active { background: var(--vert); border-color: var(--vert); color: white; }
.puce.toutes { font-weight: 600; color: #777; }
.puce.toutes.active { background: var(--gris-bg); border-color: var(--gris-brd); color: var(--texte); }

.acces { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: .8rem; max-width: 760px; margin: 1.25rem auto 0; }
.tuile {
  display: flex; align-items: center; gap: .8rem; text-align: left; text-decoration: none; color: var(--texte);
  background: white; border-radius: var(--radius); box-shadow: var(--shadow); padding: .8rem 1rem;
  border-left: 5px solid var(--bleu); transition: transform .15s;
}
.tuile:hover { transform: translateY(-2px); }
.tuile.nouveautes { border-left-color: var(--orange); }
.tuile-icone { font-size: 1.8rem; }
.tuile strong { display: block; font-size: 1rem; }
.tuile.programme strong { color: var(--bleu); }
.tuile.nouveautes strong { color: #b35c00; }
.tuile small { display: block; color: #666; font-size: .85rem; line-height: 1.3; margin-top: .1rem; }

.matiere-section { margin-bottom: 2.5rem; }
.imprimer-section {
  background: #fff8ef; border: 2px dashed #f5c27a; border-radius: var(--radius); padding: 1.25rem 1.25rem 1.5rem;
}
.voir-tout { margin-left: auto; font-size: .9rem; font-weight: 700; color: var(--orange); text-decoration: none; }
@media (max-width: 600px) {
  .hero { padding-top: 1.25rem; }
  .hero h1 { font-size: 1.8rem; }
  .ma-classe { border-radius: var(--radius); padding: .6rem; }
}
</style>
