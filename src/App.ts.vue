<template>
  <div id="app">
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
  router
})
//*
// try {
//   let AudioContext = window.AudioContext || webkitAudioContext
//   var audioContext = new AudioContext()

//   play(0, 3, 0.5)
//   play(1, 10, 0.5)
//   play(2, 15, 0.5)

//   function play (delay: number, pitch: number, duration: number) {
//     var startTime = audioContext.currentTime + delay
//     var endTime = startTime + duration

//     var oscillator = audioContext.createOscillator()
//     var amp = audioContext.createGain()
//     amp.connect(audioContext.destination)
//     oscillator.connect(amp)

//     oscillator.type = 'sawtooth' as any
//     oscillator.detune.value = pitch * 100
//     amp.gain.value = 0
//     amp.gain.setTargetAtTime(1, startTime, 0.1)
//     amp.gain.setTargetAtTime(0, endTime, 0.2)

//     oscillator.start(startTime)
//     oscillator.stop(endTime + 2)
//   }
// } catch (e) {
//   alert(e)
// }
//*/
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
