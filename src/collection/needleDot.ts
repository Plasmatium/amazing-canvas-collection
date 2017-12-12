import Vue from 'vue'
import { Canvas } from './utils/Canvas'

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

    this.dir.vx += Math.sin(this.dir.vx/1000)/1000
    this.dir.vy += Math.cos(this.dir.vy/1000)/1000
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

class NeedleDotCanvas extends Canvas {
  bgColor: string
  data: Dot[]
  constructor (bgColor = '#eaeaea') {
    super (bgColor)
    this.createDots()
  }
  clrscr ({bgColor, canvas, ctx, windowH, windowW, data}: Canvas) {
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, windowW, windowH)
  }
  randPos () {
    let {windowH, windowW} = this
    let x = random() * windowW
    let y = random() * windowH
    return {x, y}
  }
  createDots () {
    let count = Math.floor(250*this.windowH*this.windowW/(1920*1080))
    let data: Dot[] = this.data = new Array<Dot>(count)
    for (let i = 0; i < count; i++) {
      let {x, y} = this.randPos()
      data[i] = new Dot(x, y, 1.62, [0xac, 0xbd, 0xce, 0.62], this as Canvas)
    }
  }
  render ({canvas, ctx, windowH, windowW, data}: Canvas) {
    let dThreshold = Math.sqrt(0.618*windowW*windowH/Math.PI)*30

    ctx.lineWidth = 0.3
    this.data.forEach((dot, idx) => {
      // lines
      this.data.slice(idx+1).forEach(anotherDot => {
        let dsqr = ((dot.x-anotherDot.x)**2 + (dot.y-anotherDot.y)**2)
        let a = (1 - dsqr/dThreshold)
        if (a < 0) return
        ctx.beginPath()
        ctx.moveTo(dot.x, dot.y)
        ctx.lineTo(anotherDot.x, anotherDot.y)
        ctx.closePath()
        ctx.strokeStyle = `rgba(50, 128, 255, ${a})`
        ctx.stroke()
      })
      dot.draw()
      dot.mutate()
    })
  }
  animate ({canvas, ctx, windowH, windowW, data}: Canvas = this) {
    setInterval(() => {
      this.flush()
    }, 16)
  }
}

export function needleDot () {
  let cv = new NeedleDotCanvas()
  cv.animate()

  window.onresize = e => {
    let target = e.target as (typeof window)
    cv.canvas.height = target.innerHeight
    cv.canvas.width = target.innerWidth
  }
}