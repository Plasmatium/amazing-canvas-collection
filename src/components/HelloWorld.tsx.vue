<!--
<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <h2>Essential Links</h2>
    <ul>
      <li><a href="https://vuejs.org" target="_blank">Core Docs</a></li>
      <li><a href="https://forum.vuejs.org" target="_blank">Forum</a></li>
      <li><a href="https://chat.vuejs.org" target="_blank">Community Chat</a></li>
      <li><a href="https://twitter.com/vuejs" target="_blank">Twitter</a></li>
      <br>
      <li><a href="http://vuejs-templates.github.io/webpack/" target="_blank">Docs for This Template</a></li>
    </ul>
    <h2>Ecosystem</h2>
    <ul>
      <li><a href="http://router.vuejs.org/" target="_blank">vue-router</a></li>
      <li><a href="http://vuex.vuejs.org/" target="_blank">vuex</a></li>
      <li><a href="http://vue-loader.vuejs.org/" target="_blank">vue-loader</a></li>
      <li><a href="https://github.com/vuejs/awesome-vue" target="_blank">awesome-vue</a></li>
    </ul>
  </div>
</template>
-->

<script lang="tsx">
import Vue from 'vue'
export default Vue.extend({
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App. This element is rendered by .tsx.vue with <script lang="tsx">',
      num: 2
    }
  },
  computed: {
    renderRet (): JSX.Element {
      return <p>This is an {'<element>'} in `computed` invokes `this.num` = {this.num}</p>
    }
  },
  render (): JSX.Element {
    let style = {color: 'orange'}
    let h3 = <h3 style={{...style}}>{this.msg}</h3>
    let input = <input type="text" onInput={e => this.msg = (e.target as any).value}></input>
    let ret = <div style={{border: '1px solid #777'}}>{[h3, input, this.renderRet]}</div>
    
    return ret
  }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
