<template>
  <div id="app">
    <img src="./assets/logo.png">
    <HelloWorld/>
    <vue-canvas/>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import HelloWorld from './components/HelloWorld.tsx.vue'
import VueCanvas from './components/vue-canvas'

import { setSeed, random } from './utils/random-seed'
setSeed(3.14)
console.log(random())
console.log(random())

setSeed(0.618)
console.log(random())
console.log(random())

setSeed(3.14)
console.log(random())
console.log(random())

export default Vue.extend({
  name: 'app',
  components: {
    HelloWorld,
    VueCanvas
  }
})
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
