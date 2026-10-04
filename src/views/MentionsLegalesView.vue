<template>
  <div class="container">
    <div class="legal-box">
      <h1 class="section-heading">{{ t('titre') }}</h1>

      <h2>{{ t('editeur') }}</h2>
      <p>{{ t('editeurTexte') }} Corentin Chary — ✉️ <a :href="`mailto:${CONTACT}`">{{ CONTACT }}</a></p>

      <h2>{{ t('hebergeur') }}</h2>
      <p>OVH SAS, 2 rue Kellermann, 59100 Roubaix, France — <a href="https://www.ovhcloud.com" target="_blank" rel="noopener">ovhcloud.com</a></p>

      <h2>{{ t('donnees') }}</h2>
      <ul>
        <li>{{ t('donnees1') }}</li>
        <li>{{ t('donnees2') }}</li>
        <li>{{ t('donnees3') }}</li>
        <li>{{ t('donnees4') }}</li>
        <li>{{ t('donnees5') }}</li>
      </ul>

      <h2>{{ t('contenus') }}</h2>
      <p>{{ t('contenusTexte') }}</p>
      <p>{{ t('polices') }} Playwrite FR Trad, Andika, OpenDyslexic (SIL Open Font License) ;
        Luciole © Laurent Bourcellier &amp; Jonathan Perez (CC BY 4.0).</p>

      <h2>{{ t('responsabilite') }}</h2>
      <p>{{ t('responsabiliteTexte') }}</p>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from '../i18n'
import messagesFr from '../i18n/fr/views/MentionsLegalesView.js'
import messagesBr from '../i18n/br/views/MentionsLegalesView.js'
import { CONTACT } from '../site'

const { t } = useI18n({ fr: messagesFr, br: messagesBr })
</script>

<style scoped>
.legal-box { background: white; border-radius: var(--radius); box-shadow: var(--shadow); padding: 2rem; max-width: 780px; margin: 0 auto; }
h2 { font-size: 1.1rem; margin: 1.5rem 0 .5rem; }
p, li { color: #444; line-height: 1.6; }
ul { padding-left: 1.25rem; }
</style>
