<template>
  <!-- Prépare un mail (pas de formulaire ni de données stockées) avec ce qu'il faut pour retrouver l'erreur -->
  <a class="signaler" :href="lien" :title="t('titre')">{{ t('signaler') }}</a>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from '../i18n'
import messagesFr from '../i18n/fr/components/SignalerErreur.js'
import messagesBr from '../i18n/br/components/SignalerErreur.js'
import { useClasse } from '../composables/useClasse'
import { useLangueRegionale } from '../composables/useLangueRegionale'
import { CONTACT, SITE } from '../site'

// reglages : réglages de l'exercice en cours (facultatif) ; detail : texte en plus (ex. question affichée)
const props = defineProps({ reglages: { type: Object, default: null }, detail: { type: String, default: '' } })
const { t, langue } = useI18n({ fr: messagesFr, br: messagesBr })
const route = useRoute()
const classe = useClasse()
const { code: regionale } = useLangueRegionale()

const lien = computed(() => {
  const sujet = `[${SITE.nom}] Erreur — ${route.path}`
  const lignes = [
    'Bonjour,', '', "J'ai trouvé une erreur sur cette page :", '', '…(décrivez ici ce qui ne va pas : la question, la réponse attendue, ce que vous auriez écrit)…', '',
    '———', `Page : ${location.href}`, `Langue : ${langue.value}${regionale.value ? ` · langue régionale : ${regionale.value}` : ''}`,
    `Classe choisie : ${classe.value || 'toutes'}`,
    ...(props.detail ? [`Détail : ${props.detail}`] : []),
    ...(props.reglages ? [`Réglages : ${JSON.stringify(props.reglages)}`] : []),
    `Navigateur : ${navigator.userAgent}`,
  ]
  return `mailto:${CONTACT}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(lignes.join('\n'))}`
})
</script>

<style scoped>
.signaler { font-size: .85rem; color: #888; text-decoration: none; border: 1px dashed var(--gris-brd); border-radius: 16px; padding: .2rem .7rem; white-space: nowrap; }
.signaler:hover { color: var(--texte); border-color: #aaa; }
</style>
