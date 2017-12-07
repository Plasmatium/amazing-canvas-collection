<template>
  <div id="app">
    <text-particle/>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import TextParticle from './collection/text-particle'

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
    TextParticle
  }
})
</script>

<style>
* {
  margin: 0
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
