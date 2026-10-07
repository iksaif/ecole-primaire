<template>
  <div class="container">
    <div class="legal-box">
      <h1 class="section-heading">{{ t('mentions.titre') }}</h1>

      <h2>{{ t('mentions.editeur') }}</h2>
      <p>{{ t('mentions.editeurTexte') }} Corentin Chary — ✉️ <a :href="`mailto:${SITE.contact}`">{{ SITE.contact }}</a></p>

      <h2>{{ t('mentions.hebergeur') }}</h2>
      <p>OVH SAS, 2 rue Kellermann, 59100 Roubaix, France — <a href="https://www.ovhcloud.com" target="_blank" rel="noopener">ovhcloud.com</a></p>

      <h2>{{ t('mentions.donnees') }}</h2>
      <ul>
        <li>{{ t('mentions.donnees1') }}</li>
        <li>{{ t('mentions.donnees2') }}</li>
        <li>{{ t('mentions.donnees3') }}</li>
        <li>{{ t('mentions.donnees4') }}</li>
        <li>{{ t('mentions.donnees5') }}</li>
      </ul>

      <h2>{{ t('mentions.contenus') }}</h2>
      <p>{{ t('mentions.contenusLicence') }} <a :href="`${SITE.depot}/blob/main/LICENCE-CONTENU.md`" target="_blank" rel="noopener">CC BY-NC-SA 4.0</a>{{ t('mentions.contenusLicenceSuite') }}</p>
      <p>{{ t('mentions.contenusTextes') }} <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.fr" target="_blank" rel="noopener">CC BY-SA 4.0</a>{{ t('mentions.contenusTextesSuite') }}</p>
      <p>{{ t('mentions.contenusImages') }} <a :href="`${SITE.depot}/blob/main/LICENCE-CONTENU.md`" target="_blank" rel="noopener">LICENCE-CONTENU.md</a>.</p>
      <p>{{ t('mentions.codeSource') }} <a :href="SITE.depot" target="_blank" rel="noopener">GitHub</a>{{ t('mentions.codeLicence') }}
        <a :href="`${SITE.depot}/blob/main/LICENSE`" target="_blank" rel="noopener">AGPL 3.0</a>.</p>
      <p>{{ t('mentions.polices') }}
        <a href="https://fonts.google.com/specimen/Playwrite+FR+Trad" target="_blank" rel="noopener">Playwrite FR Trad</a>,
        <a href="https://software.sil.org/andika/" target="_blank" rel="noopener">Andika</a>,
        <a href="https://opendyslexic.org/" target="_blank" rel="noopener">OpenDyslexic</a>
        (<a href="https://openfontlicense.org/" target="_blank" rel="noopener">SIL Open Font License</a>) ;
        <a href="https://luciole-vision.com/" target="_blank" rel="noopener">Luciole</a> © Laurent Bourcellier &amp; Jonathan Perez
        (<a href="https://creativecommons.org/licenses/by/4.0/deed.fr" target="_blank" rel="noopener">CC BY 4.0</a>).</p>

      <h2>{{ t('mentions.responsabilite') }}</h2>
      <p>{{ t('mentions.responsabiliteTexte') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Mentions légales et confidentialité : éditeur, hébergeur, données (rien ne sort, sauf le signal anonyme et Mistral avec une clé),
// licences des contenus, du code et des polices. Obligatoires (LCEN). Reprise de l'ancienne page, supprimée le 2026-10-07 sans report.
import { useLangue } from '../langues/useLangue.ts'
import { SITE } from '../sites.ts'

const { t } = useLangue()
</script>

<style scoped>
.legal-box { background: white; border-radius: var(--radius); box-shadow: var(--shadow); padding: 2rem; max-width: 780px; margin: 0 auto; }
h2 { font-size: 1.1rem; margin: 1.5rem 0 .5rem; }
p, li { color: var(--texte); line-height: 1.6; }
ul { padding-left: 1.25rem; }
</style>
