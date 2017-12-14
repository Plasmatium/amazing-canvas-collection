import { Canvas } from "./utils/Canvas"
import { ParticleLike, makeLinearGradient, applyGravity, rebound, move } from "./utils/others"

class Donut {
  constructor (
    public pos: ParticleLike['pos'],
    public dir: ParticleLike['dir'],
    public r: number,
    public thickness: number,
    public color: number[],
    private cv: Canvas
  ) { 
  }
  mutate () {
    let {pos, dir} = this
    applyGravity(this, this.cv)
    move(this)
    rebound(this, this.cv, {dcx: 0.9, dcy: 0.8})
  }
  draw ({ctx, canvas} = this.cv) {
    let {pos: {x, y}, r, thickness} = this
    ctx.strokeStyle = `rgba(${this.color})`
    ctx.lineWidth = thickness
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2*Math.PI)
    ctx.closePath()
    ctx.stroke()
    this.mutate()
  }
}

class ColorfulDonut extends Canvas {
  public data: Donut[] = []
  constructor (bgColor: string | CanvasGradient = "#eacdae") {
    super(bgColor)
  }
  renderMain ({canvas, ctx, windowH, windowW, data}: Canvas = this) {
    this.data.forEach(donut => {
      donut.draw()
    })
  }
  animate ({canvas, ctx, windowH, windowW, data}: Canvas = this) {
    this.render()
  }
  createData () {
    this.data.push(new Donut({x: 100, y: 100}, {vx: 55.3, vy: -1.5}, 25, 16, [0xea, 0xae, 0xae, 1], this))
  }
}

export function colorfulDonut () {
  let cv = new ColorfulDonut()
  let {windowH} = cv
  let colorInfoArr = [
    {offset: 0.0, color: '#eacdae'},
    {offset: 0.9, color: '#ededed'},
    {offset: 0.9, color: '#eacdae'},
    {offset: 1.0, color: '#eacdae'}
  ]
  let gradientOption = {
    x0: 0, y0: 0,
    x1: 0, y1: windowH,
    colorInfoArr
  }
  cv.bgColor = makeLinearGradient(cv.ctx, gradientOption)
  cv.createData()

  window.onresize = e => {
    let target = e.target as (typeof window)
    cv.canvas.height = target.innerHeight
    cv.canvas.width = target.innerWidth
  }

  return cv
}