<template>
  <div id="app">
    <a href="https://github.com/Plasmatium/amazing-canvas-collection">
      <img style="position: absolute; top: 0; left: 0; border: 0;"
        :src="forkmeImg"
        alt="Fork me on GitHub"></a>
    <div class="menu-container">
      <router-link
        class="script-link"
        v-for="link in links"
        :key="link"
        :to="link">
          <span>{{link}}</span>
      </router-link>
    </div>
    <router-view />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { makeCanvas } from './components/vue-canvas';
import { router, links } from './router';
import VueRouter from 'vue-router';

const forkmeImg = require('./assets/forkme.png');

Vue.use(VueRouter);

export default Vue.extend({
  name: 'app',
  data() {
    return {
      links,
      forkmeImg,
    };
  },
  router,
});
</script>

<style>
* {
  margin: 0;
  /* no context menu */
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.menu-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;

  margin: .4em;
}
.script-link {
  display: flex;
  justify-content: center;
  align-items: center;

  width: 10em;
  height: 3.3em;
  margin: 0.6em;

  cursor: pointer;
  font-size: 1rem;
  border-radius: .16em;
  transition: 150ms all
}

.script-link:hover {
  background-color: #ffffffbb;
  box-shadow: 0 8px 16px 0 #0000001a;
}
.script-link:active {
  box-shadow: 0 1px 2px 0 #0000001a;
}

a {
  text-decoration: none;
  color: #2c3e50;
}
</style>
