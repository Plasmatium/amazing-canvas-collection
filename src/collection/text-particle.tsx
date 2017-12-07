import Vue from 'vue'
import VueCanvas from '../components/vue-canvas'

interface CTX {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
}

class Canvas {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  windowH: number
  windowW: number
  constructor (id: string) {
    let canvas = document.getElementById(id) as HTMLCanvasElement
    if (!canvas) throw Error(`canvas id not found. id: ${id}`)
    this.canvas = canvas
    let ctx = canvas.getContext('2d')
    if (!ctx) throw Error(`context not found. id: ${id}`)
    this.ctx = ctx

    this.windowH = this.canvas.height
    this.windowW = this.canvas.width
  }
  drawPoint (x: number, y: number) {
    let {ctx, canvas}: CTX = this
    ctx.fillStyle = '#aeaeae'
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, 2*Math.PI)
  }
}

window.onload = function () { buildCanvas() }

function buildCanvas () {
  const canvas = document.getElementById('particle1') as HTMLCanvasElement
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.fillStyle = "#ececec"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  let step = 0
  setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    step += 0.001
  }, 16)
  // ctx.fillRect(10, 10, 20, 20)
}

export default Vue.extend({
  components: {
    'vue-canvas': VueCanvas
  },
  render () {
    return <vue-canvas id="particle1"/>
  }
})