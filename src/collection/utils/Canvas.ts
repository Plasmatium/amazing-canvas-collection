import { showFPS } from "./others";

export abstract class Canvas{
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  renderMask: {(ctx: CanvasRenderingContext2D): void}[]
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
  abstract animate ({canvas, ctx, windowH, windowW, data}: Canvas): void
  clrscr ({bgColor, canvas, ctx, windowH, windowW, data}: Canvas = this) {
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, windowW, windowH)
  }
  render (bgColor = this.bgColor) {
    this.clrscr()
    this.renderMain(this)
    this.renderMask.forEach(mask => {
      mask(this.ctx)
    })
  }
}

class DefaultCanvas extends Canvas {
  step: number
  constructor (public bgColor: string) {
    super(bgColor)
    this.step = 0.0
  }
  clrscr ({bgColor, canvas, ctx, windowH, windowW, data}: Canvas = this) {
    // ctx.clearRect(0, 0, windowW(), windowH())
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, windowW, windowH)
  }
  renderMain ({canvas, ctx, windowH, windowW, data}: Canvas = this) {
    let r = Math.floor((Math.sin(this.step) / 2 + 0.5) * 255)
    let g = Math.floor((Math.sin(this.step + Math.PI*2/3) / 2 + 0.5) * 255)
    let b = Math.floor((Math.sin(this.step - Math.PI*2/3) / 2 + 0.5) * 255)
    let color = `rgb(${[r,g,b]})`
    ctx.font = '48px sans'
    ctx.strokeStyle = color
    ctx.strokeText('default canvas', 100, 100)
  }
  animate ({canvas, ctx, windowH, windowW, data}: Canvas = this) {
    setInterval(() => {
      this.render(this.bgColor)
      this.step += 0.001
    }, 16)
  }
}

export function defaultCanvas () {
  const cv = new DefaultCanvas('#eaeaea')
  cv.animate()
}