import {
  showFPS,
  ParticleLike,
  makeRandomColorful,
  randn_bm,
  randColor,
  showFPS2
} from "./others";
import { Timestamp } from "rxjs/operators/timestamp";

let {random, sin, PI} = Math

export abstract class Canvas{
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  renderMask: Function[]
  isRunning: boolean = false
  data: any
  constructor (public bgColor: string | CanvasGradient) {
    let canvas = document.getElementsByTagName('canvas')[0] as HTMLCanvasElement
    if (!canvas) throw Error(`canvas not found.`)
    this.canvas = canvas

    let ctx = canvas.getContext('2d')
    if (!ctx) throw Error(`context not found.`)
    this.ctx = ctx
    this.renderMask = [/*showFPS(ctx), */showFPS2()]
    
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
  render (timestamp: number, isRunning: boolean) {
    this.isRunning && window.requestAnimationFrame((timestamp: number) => {
      this.render(timestamp, this.isRunning)
    })
    this.clrscr()
    this.renderMain(this)
    this.renderMask.forEach(mask => {
      mask(timestamp, isRunning)
    })
  }
  run () {
    this.isRunning = true
    window.requestAnimationFrame((timestamp: number) => {
      this.render(timestamp, this.isRunning)
    })
  }
  destory () {
    this.isRunning = false
  }
  onClick (e: MouseEvent) { 
    e.preventDefault()
   }
}

class DefaultCanvas extends Canvas {
  curves: ((x: number) =>number)[]
  step: number = 0
  waveStep: number = 0
  ribbonMoving: boolean = false
  constructor (public bgColor: string) {
    super(bgColor)
    let {windowH} = this
    let phase = random()*2
    let phaseList = [1.5]

    // generate sine envelope
    let order = [1,2,3,4,5].map(x => 0.618*x**1.618)
    this.curves = [1, ...order].map(order => {
      let amp: number
      if (order === 1) amp = windowH*0.1/order
      else amp = windowH*0.2/order
      let ret = (x: number) => {
        return amp*sin(order*(2*PI*x*0.4e-3 + phase))
      }
      // add a random color to each curve function
      Object.assign(ret, {color: makeRandomColorful()})
      return ret
    })

    setTimeout(() => { this.ribbonMoving = true }, 1500)
  }
  clrscr ({bgColor, canvas, ctx, windowH, windowW, data}: Canvas = this) {
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, windowW, windowH)
  }
  renderMain ({canvas, ctx, windowH, windowW, data}: Canvas = this) {
    let base = this.curves[0]
    this.curves.forEach((func, idx) => {
      let veryStart, veryEnd, start, end, step
      if (idx % 2 === 0) {
        veryStart = -10000
        veryEnd = 10000
        start = 0
        end = windowW
        step = (n: number) => n+1
      } else {
        veryStart = 10000
        veryEnd = -10000
        start = windowW
        end = 0
        step = (n: number) => n-1
      }
      
      if (idx % 2 === 0) {
        ctx.beginPath()
        ctx.moveTo(veryStart, windowH/2)
      }

      for (let i = start; i != end; i = step(i)) {
        ctx.lineTo(i, base(i+i*this.waveStep) + func(i-i*this.waveStep) + windowH*0.2)
      }
      ctx.lineTo(veryEnd, windowH/2)

      if (idx % 2 !== 0) {
        let color = (func as any).color(this.step)
        ctx.fillStyle = `rgba(${color})`
        ctx.lineTo(veryEnd, windowH/2)
        ctx.closePath()
        ctx.fill()
      }
    })

    if (!this.ribbonMoving) return
    this.step += 0.001
    let x = this.step*18
    this.waveStep += Math.E**(-x*3) * (x*0.6)**2
  }
}

export function defaultCanvas () {
  return new DefaultCanvas('#eaeaea')
}