import Vue from 'vue'
import * as util from 'util'
import { Canvas } from '../collection/utils/Canvas'
import { GLScene } from '../collection/utils/WebGL';

export function makeCanvas(script: () => Canvas | GLScene) {
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
      // when below is running, this.cv in computed is not calculated.
      let handleClick = (e: MouseEvent) => this.cv.onClick(e)
      return (<canvas 
        onClick={handleClick}
        height={height}
        width={width}
        style={style}>
        canvas is not support
      </canvas>)
    }
  })
}