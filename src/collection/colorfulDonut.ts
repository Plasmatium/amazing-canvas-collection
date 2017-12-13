import { Canvas } from "./utils/Canvas"
import { ParticleLike } from "./utils/others"

class Donut {
  // pos: ParticleLike['pos']
  public dir: ParticleLike['dir']
  // r: number
  // thickness: number
  constructor (
    public pos: ParticleLike['pos'],
    public r: number,
    public thickness: number,
    public color: number[],
    private cv: Canvas
  ) { }
  mutate () {

  }
  draw ({ctx, canvas} = this.cv) {
    let {pos: {x, y}, r, thickness} = this
    ctx.strokeStyle = `rgba(${this.color})`
    ctx.lineWidth = thickness
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2*Math.PI)
    ctx.closePath()
    ctx.stroke()
  }
}

class ColorfulDonut extends Canvas {
  constructor (bgColor: string = "#eccece") {
    super(bgColor)
  }
  renderMain ({canvas, ctx, windowH, windowW, data}: Canvas = this) {
    let donut = new Donut({x: 100, y: 100}, 25, 16, [0xea, 0xae, 0xae, 1], this)
    donut.draw()
  }
  animate ({canvas, ctx, windowH, windowW, data}: Canvas = this) {
    setInterval(() => {
      this.render()
    }, 16)
  }
}

export function colorfulDonut () {
  let cv = new ColorfulDonut()
  cv.animate()

  window.onresize = e => {
    let target = e.target as (typeof window)
    cv.canvas.height = target.innerHeight
    cv.canvas.width = target.innerWidth
  }
}