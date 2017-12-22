import { showFPS, ParticleLike } from "./others";

let {random} = Math

export abstract class Canvas{
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  renderMask: {(ctx: CanvasRenderingContext2D): void}[]
  timerID: number
  data: any
  constructor (public bgColor: string | CanvasGradient) {
    let canvas = document.getElementsByTagName('canvas')[0] as HTMLCanvasElement
    if (!canvas) throw Error(`canvas not found.`)
    this.canvas = canvas

    let ctx = canvas.getContext('2d')
    if (!ctx) throw Error(`context not found.`)
    this.ctx = ctx
    this.renderMask = [showFPS()]
    
    window.onresize = e => {
      let target = e.target as (typeof window)
      this.canvas.height = target.innerHeight
      this.canvas.width = target.innerWidth
    }
  }
  // windowH = () => this.canvas.height
  // windowW = () => this.canvas.width
  get windowH () { return this.canvas.height }
  get windowW () { return this.canvas.width }
  abstract renderMain ({canvas, ctx, windowH, windowW, data}: Canvas): void
  clrscr ({bgColor, canvas, ctx, windowH, windowW, data}: Canvas = this) {
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, windowW, windowH)
  }
  render () {
    this.clrscr()
    this.renderMain(this)
    this.renderMask.forEach(mask => {
      mask(this.ctx)
    })
  }
  run () {
    this.timerID = window.setInterval(() => this.render(), 16)
  }
  destory () {
    window.clearInterval(this.timerID)
  }
  onClick (e: MouseEvent) {  }
}

class DefaultCanvas extends Canvas {
  step: number
  checkpoint: ParticleLike['pos'][]
  constructor (public bgColor: string) {
    super(bgColor)
    this.step = 0.0

    let {windowW, windowH} = this
    let interval = windowW / 10
    let point1 = { x: -random()*interval, y: random()*windowH }
    let point2 = { x: -random()*interval, y: random()*windowH }

    this.checkpoint = [point1, point2]

    for(let i=1; i<=10; i++) {
      let point = { x: random()*interval*i, y: random()*windowW }
      this.checkpoint.push(point)
    }

    let point3 = { x: windowW + random()*interval, y: random()*windowH }
    let point4 = { x: windowW + random()*interval, y: random()*windowH }
    this.checkpoint.push(point3)
    this.checkpoint.push(point4)

    this.render()
  }
  clrscr ({bgColor, canvas, ctx, windowH, windowW, data}: Canvas = this) {
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, windowW, windowH)
  }
  renderMain ({canvas, ctx, windowH, windowW, data}: Canvas = this) {
    for(let i=0; i<10 + 2; i++) {
      let color = [255, 255, 205, 255].map(c => Math.floor(c))
      ctx.fillStyle = `rgba(${color})`

      let points = this.checkpoint.slice(i, i + 3)
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      ctx.lineTo(points[1].x, points[1].y)
      ctx.lineTo(points[2].x, points[2].y)
      ctx.closePath()
      ctx.fill()
    }
  }
}

export function defaultCanvas () {
  return new DefaultCanvas('#eaeaea')
}