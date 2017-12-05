import Vue from 'vue'

export default Vue.extend({
  name: 'vue-canvas',
  data () {
    return {}
  },
  render () {
    let style = {color: 'purple'}
    return <h2 style= {{...style}}>Hello World by tsx</h2>
  }
})