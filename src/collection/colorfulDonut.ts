import { Canvas } from "./utils/Canvas"
import { ParticleLike, makeLinearGradient, applyGravity, rebound, move, randn_bm } from "./utils/others"

class Donut {
  isSlow: boolean
  isDead: boolean
  constructor (
    public pos: ParticleLike['pos'],
    public dir: ParticleLike['dir'],
    public r: number,
    public thickness: number,
    public color: number[],
    private cv: Canvas,
  ) {
    this.isSlow = false
    this.isDead = false
  }
  mutate () {
    let {pos, dir} = this
    applyGravity(this, this.cv)
    move(this)
    rebound(this, this.cv, {dcx: 0.9, dcy: 0.8})
    this.fade()
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
  markIfSlow () {
    let {vx, vy} = this.dir
    if (Math.abs(vx) < 0.5 && Math.abs(vy) < 0.5) this.isSlow = true
  }
  fade () {
    if (!this.isSlow) {
      this.markIfSlow()
      return
    }
    let [r, g, b, a] = this.color
    if (a < 1e-3) { this.isDead = true }
    this.color = [r, g, b, a*0.9]
  }
}

class ColorfulDonut extends Canvas {
  public data: Donut[] = []
  // public step: number = 0
  constructor (public bgColor: string | CanvasGradient = "#eacdae") {
    super(bgColor)
  }
  renderMain ({canvas, ctx, windowH, windowW, data}: Canvas = this) {
    this.data.forEach((donut, idx) => {
      // if (idx > this.step) return
      if (!donut) return
      if (donut.isDead) {
        delete this.data[idx]
        return
      }
      donut.draw()
    })
    // this.step += 1
  }
  animate ({canvas, ctx, windowH, windowW, data}: Canvas = this) {
    this.render()
  }
  
  addData () {
    let {windowH, windowW} = this
    let count = windowH * windowW / (1920*1080) * 150
    let ret = []
    for (let i = 0; i < count; i++) {
      let randColor = [255, 255, 255].map(c => Math.floor(c * Math.random()))
      ret.push(new Donut(
        {x: windowW/2, y: windowH*0.618},
        {vx: randn_bm()*10, vy: -Math.abs(randn_bm()*15)},
        Math.abs(randn_bm()*10+3), Math.abs(randn_bm()*6.2+3.1),
        [...randColor, 1.0], 
        this
      ))
    }
    this.data = ret
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
  cv.addData()

  window.onresize = e => {
    let target = e.target as (typeof window)
    cv.canvas.height = target.innerHeight
    cv.canvas.width = target.innerWidth
  }

  return cv
}