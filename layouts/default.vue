<script setup lang="ts">
import { useHead } from '@unhead/vue'

useHead({
  title: '自然風景写真集 Hydrangea',
  link: [
    {
      href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200',
      rel: 'stylesheet'
    }
  ]
})
</script>

<template>
  <div class="layout_root">
    <slot />
  </div>
</template>

<style lang="scss">
* {
  box-sizing: border-box;
}

html {
  font-size: 62.5%;
}

.layout_root {
  &,
  html:has(&),
  body:has(&),
  #__nuxt:has(&) {
    overflow: hidden;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: stretch;
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    flex: 1;
  }
}

.leaflet-control-layers {
  background-color: #494949;

  label {
    color: #fff;
  }
}
.leaflet-bar a {
    background-color: #494949;
    color: #fff;
    border-bottom: 1px solid #333;
}

.leaflet-container{
  a {
    color: #fff;
  }
  .leaflet-control-attribution {
    background-color: #494949;
  }
}
</style>
