import vue from '/Users/corentin.chary/dev/ecole-primaire/node_modules/@vitejs/plugin-vue/dist/index.mjs'
export default {
  root: '/Users/corentin.chary/dev/ecole-primaire',
  plugins: [vue()],
  logLevel: 'warn',
  build: { outDir: '/tmp/build-agent-a', emptyOutDir: true, lib: { entry: '/tmp/test-agent-a/entry.js', formats: ['es'], fileName: 'vues' }, rollupOptions: { external: ['vue'] } },
}
