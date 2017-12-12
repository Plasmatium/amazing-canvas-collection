import { setInterval } from "timers";

// type func = (...p: any[]) => any

// interface CanvasOptions<T> {
//   render: func
//   renderMask: func
//   clrscr: func
//   animate: func
//   createData?: ({canvas, ctx, windowH, windowW}: RawCanvas) => T
//   data:T
// }

// interface RawCanvas {
//   canvas: HTMLCanvasElement
//   ctx: CanvasRenderingContext2D
//   windowH: () => number
//   windowW: () => number
// }

export abstract class Canvas{
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  data: any
  constructor () {
    let canvas = document.getElementsByTagName('canvas')[0] as HTMLCanvasElement
    if (!canvas) throw Error(`canvas not found.`)
    this.canvas = canvas

    let ctx = canvas.getContext('2d')
    if (!ctx) throw Error(`context not found.`)
    this.ctx = ctx
    
    window.onresize = e => {
      let target = e.target as (typeof window)
      this.canvas.height = target.innerHeight
      this.canvas.width = target.innerWidth
    }
  }
  windowH = () => this.canvas.height
  windowW = () => this.canvas.width
  abstract clrscr (bgColor: string, {canvas, ctx, windowH, windowW, data}: Canvas): void
  abstract render ({canvas, ctx, windowH, windowW, data}: Canvas): void
  abstract animate ({canvas, ctx, windowH, windowW, data}: Canvas): void
  flush (bgColor: string) {
    this.clrscr(bgColor, this)
    this.render(this)
  }
}

class DefaultCanvas extends Canvas {
  step: number
  constructor (private bgColor: string) {
    super()
    this.step = 0.0
  }
  clrscr (bgColor: string, {canvas, ctx, windowH, windowW, data}: Canvas = this) {
    // ctx.clearRect(0, 0, windowW(), windowH())
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, windowW(), windowH())
  }
  render ({canvas, ctx, windowH, windowW, data}: Canvas = this) {
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
      this.flush(this.bgColor)
      this.step += 0.001
    }, 16)
  }
}

export function defaultCanvas () {
  const cv = new DefaultCanvas('#eaeaea')
  cv.animate()
}