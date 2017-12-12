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
      let style = {position: 'fixed', top: 0, left: 0, 'z-index': -1}
      return <canvas height={height} width={width} style={style}>canvas is not support</canvas>
    }
  })
} 