<template>
  <div id="app">
    <ul>
      <li class="script-link" v-for="link in links" :key="link">
        <router-link :to="link">{{link}}</router-link>
      </li>
    </ul>
    <router-view />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {makeCanvas} from './components/vue-canvas'
import {router, links} from './router'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

export default Vue.extend({
  name: 'app',
  data () {
    return {
      links
    }
  },
  router,
  computed: {
    scripts (): any {
      return this.$router
    }
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
.script-link {
  display: inline;
  margin: 0 0.62rem;
}
</style>
