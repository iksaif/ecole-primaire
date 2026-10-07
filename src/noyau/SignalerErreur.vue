<template>
  <a class="signaler" :href="lien" :title="t('cadre.signaler.titre')">{{ t('cadre.signaler.lien') }}</a>
</template>

<script setup lang="ts">
// « Signaler une erreur » : prépare un mail (pas de formulaire, rien n'est stocké) avec ce qu'il faut pour retrouver l'erreur. Le corps
// du mail reste en français (destinataire : nous). `reglages` : réglages de l'exercice en cours ; `detail` : texte en plus.
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useLangue } from '../langues/useLangue.ts'
import { useLangueRegionale } from '../langues/useLangueRegionale.ts'
import { useContexte } from '../contexte/useContexte.ts'
import { SITE } from '../sites.ts'

const props = withDefaults(defineProps<{ reglages?: Record<string, unknown> | null, detail?: string }>(), { reglages: null, detail: '' })
const { t, langueAffichee } = useLangue()
const route = useRoute()
const { contexte } = useContexte()
const { code: regionale } = useLangueRegionale()

const lien = computed(() => {
  const sujet = `[${SITE.nom}] Erreur — ${route.path}`
  const classes = contexte.value.classes.join(', ') || 'toutes'
  const lignes = [
    'Bonjour,', '', "J'ai trouvé une erreur sur cette page :", '', '…(décrivez ici ce qui ne va pas : la question, la réponse attendue, ce que vous auriez écrit)…', '',
    '———', `Page : ${location.href}`, `Langue : ${langueAffichee.value}${regionale.value ? ` · langue régionale : ${regionale.value}` : ''}`,
    `Classes choisies : ${classes}`,
    ...(props.detail ? [`Détail : ${props.detail}`] : []),
    ...(props.reglages ? [`Réglages : ${JSON.stringify(props.reglages)}`] : []),
    `Navigateur : ${navigator.userAgent}`,
  ]
  return `mailto:${SITE.contact}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(lignes.join('\n'))}`
})
</script>

<style scoped>
.signaler { font-size: .85rem; color: var(--texte-doux); text-decoration: none; border: 1px dashed var(--gris-brd); border-radius: 16px; padding: .2rem .7rem; white-space: nowrap; }
.signaler:hover { color: var(--texte); border-color: #aaa; }
</style>
