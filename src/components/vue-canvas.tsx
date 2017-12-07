import Vue from 'vue'
import * as util from 'util'

export default Vue.extend({
  name: 'vue-canvas',
  computed: {
  },
  render () {
    let height = window.innerHeight
    let width = window.innerWidth
    return <canvas height={height} width={width}>canvas is not support</canvas>
  }
})