<template>
  <div id="app">
    <editor-page></editor-page>
  </div>
</template>

<script>
  import EditorPage from '@/components/EditorPage'
  export default {
    name: 'electron-vue-buefy-editor',
    components: {
      EditorPage
    }

  }
</script>

<style>
  /* CSS */
  #app {
    height: 100%;
  }
</style>
