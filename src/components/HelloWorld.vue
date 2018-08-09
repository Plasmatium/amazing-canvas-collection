<script lang="tsx">
import Vue from 'vue';
import * as util from 'util';

export default Vue.extend({
  name: 'HelloWorld',
  data() {
    return {
      msg: 'Welcome to Your Vue.js App. This element is rendered by .tsx.vue with <script lang="tsx">',
      num: 2,
    };
  },
  computed: {
    renderRet(): JSX.Element {
      return <p>This is an {'<element>'} in `computed` invokes `this.num` = {this.num}</p>;
    },
  },
  render(): JSX.Element {
    const style = { color: 'orange' };
    const h3 = <h3 style={{ ...style }}>{this.msg}</h3>;
    const input = <input type="text"
      onInput={(e: Event) => this.msg = (e.target as HTMLInputElement).value}></input>;
    const ret = <div style={{ border: '1px solid #777' }}>{[h3, input, this.renderRet]}</div>;

    return ret;
  },
});
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
