import Vue from 'vue'
import * as util from 'util'

export default Vue.extend({
  name: 'vue-canvas',
  props: {
    width: Number,
    height: Number
  },
  data () {
    return {
      msg: 'this component is rendered by pure .tsx'
    }
  },
  render () {
    let style = {color: 'purple'}
    let h2 = <h2 style= {{...style}}>{this.msg}</h2>
    let ret: any = h2
    return ret
  }
})