<template>
  <AppNav />
  <RouterView />
  <AppFooter />
</template>

<script setup lang="ts">
import AppNav from './shell/AppNav.vue'
import AppFooter from './shell/AppFooter.vue'
</script>
