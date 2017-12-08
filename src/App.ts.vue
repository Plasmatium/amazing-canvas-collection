<template>
  <div id="app">
    <needle-dot/>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import NeedleDot from './collection/NeedleDot'

import { setSeed, random } from './utils/random-seed'

export default Vue.extend({
  name: 'app',
  components: {
    NeedleDot
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
/* .bg {
  position: fixed;
  top: 100px;
  left: 400px;
  z-index: -1;
} */
</style>
