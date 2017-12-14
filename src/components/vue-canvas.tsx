import Vue from 'vue'
import * as util from 'util'
import { Canvas } from '../collection/utils/Canvas'

export function makeCanvas(script: () => Canvas) {
  return Vue.extend({
    name: 'vue-canvas',
    computed: {
      cv () { return script() }
    },
    mounted () {
      this.cv.run()
    },
    destroyed () {
      this.cv.destory()
    },
    render () {
      let height = window.innerHeight
      let width = window.innerWidth
      let style = {position: 'fixed', top: 0, left: 0, 'z-index': -1}
      return <canvas height={height} width={width} style={style}>canvas is not support</canvas>
    }
  })
}