import Vue from 'vue'
import VueCanvas from '../components/vue-canvas'

let random = () => Math.random()

class Dot {
  x: number
  y: number
  r: number
  color: number[]
  dir: {vx: number, vy: number}
  cv: Canvas
  constructor (
    x: number, y: number, r: number, color: number[], cv: Canvas) {
    Object.assign(this, {x, y, r, color, cv})
    this.dir = {vx: random()*3 - 1.5, vy: random()*3 - 1.5}
    // this.color = [Math.floor(128*random() + 100),Math.floor(128*random() + 100),Math.floor(128*random() + 100), random()*0.3 + 0.5]
  }
  mutate () {
    let {windowH, windowW} = this.cv

    this.x += this.dir.vx
    this.y += this.dir.vy

    if (this.x < 0) {
      this.x = 0
      this.dir.vx *= -1
    } else if (this.x > windowW) {
      this.x = windowW
      this.dir.vx *= -1
    }

    if (this.y < 0) {
      this.y = 0
      this.dir.vy *= -1
    } else if (this.y > windowH) {
      this.y = windowH
      this.dir.vy *= -1
    }
  }
  draw () {
    let {ctx, canvas} = this.cv
    let {x, y, r} = this
    ctx.fillStyle = `rgba(${[...this.color]})`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2*Math.PI)
    ctx.closePath()
    ctx.fill()
  }
}

class Canvas {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  windowH: number
  windowW: number
  bgColor: string
  dots: Dot[]
  constructor (id: string, bgColor = '#eaeaea') {
    let canvas = document.getElementById(id) as HTMLCanvasElement
    if (!canvas) throw Error(`canvas id not found. id: ${id}`)
    this.canvas = canvas
    let ctx = canvas.getContext('2d')
    if (!ctx) throw Error(`context not found. id: ${id}`)
    this.ctx = ctx

    this.windowH = this.canvas.height
    this.windowW = this.canvas.width

    this.bgColor = bgColor
    this.clrscr()
  }
  clrscr (bgColor: string = this.bgColor) {
    let {ctx, windowH, windowW} = this
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, windowW, windowH)
  }
  randPos () {
    let {windowH, windowW} = this
    let x = random() * windowW
    let y = random() * windowH
    return {x, y}
  }
  createPoints (count: number) {
    let dots: Dot[] = this.dots = new Array<Dot>(count)
    for (let i = 0; i < count; i++) {
      let {x, y} = this.randPos()
      dots[i] = new Dot(x, y, 1.62, [0xac, 0xbd, 0xce, 0.62], this)
    }
  }
  render () {
    let {ctx, windowH, windowW} = this
    this.clrscr()
    let threshold = Math.sqrt(0.618*windowW*windowH/Math.PI)*0.62

    this.dots.forEach((dot, idx) => {
      // lines
      this.dots.slice(idx+1).forEach(anotherDot => {
        let d = ((dot.x-anotherDot.x)**2 + (dot.y-anotherDot.y)**2)
        let a = (1 - d/95/95)
        if (a < 0) return
        ctx.beginPath()
        ctx.moveTo(dot.x, dot.y)
        ctx.lineTo(anotherDot.x, anotherDot.y)
        ctx.closePath()
        ctx.strokeStyle = `rgba(50, 128, 255, ${a})`
        ctx.stroke()
        debugger
      })
      dot.draw()
      dot.mutate()
    })
  }
  animate () {
    setInterval(() => {
      this.render()
    }, 16)
  }
}

window.onload = function () {
  let cv = new Canvas('particle1')
  cv.createPoints(Math.floor(250*cv.windowH*cv.windowW/(1920*1080)))
  cv.animate()
}

export default Vue.extend({
  components: {
    'vue-canvas': VueCanvas
  },
  render () {
    return <vue-canvas id="particle1"/>
  }
})