import Vue from 'vue'
import * as util from 'util'

export function makeCanvas(script: Function) {
  return Vue.extend({
    name: 'vue-canvas',
    mounted () {
      script()
    },
    render () {
      let height = window.innerHeight
      let width = window.innerWidth
      return <canvas height={height} width={width}>canvas is not support</canvas>
    }
  })
} 