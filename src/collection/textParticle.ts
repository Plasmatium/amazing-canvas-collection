import {Canvas} from './utils/Canvas'
import {ParticleLike, randColor, RefinedImageData} from './utils/others'



class Dot {
  constructor (
    public pos: ParticleLike['pos'],
    // public dir: ParticleLike['dir'],
    public color: number[],
    public cv: Canvas
  ) {  }
  draw ({ctx} = this.cv) {
    let {x, y} = this.pos
    ctx.beginPath()
    ctx.strokeStyle = `rgba(${this.color})`
    ctx.arc(x, y, 1, 0, 2*Math.PI)
    ctx.closePath()
    ctx.stroke()
  }
}

class TextParticle extends Canvas {
  public dots: Dot[] = []
  constructor (public bgColor: string | CanvasGradient = "#eacdae") {
    super(bgColor)
  }
  renderMain ({canvas, ctx, windowH, windowW, data}: Canvas = this) {
    ctx.fillStyle = `#777`
    ctx.fillText('test text', 150, 150)
    ctx.strokeStyle = '#777'
    ctx.strokeRect(120, 120, 500, 500)
    this.dots && this.dots.forEach(dot => {
      dot.draw()
    })
  }
  onClick (e: MouseEvent) {
    let data = this.ctx.getImageData(120, 120, 500, 500)
    let refined = new RefinedImageData(data)
    let filter = (x: number[]) => {
      // [...x] is slow, [].join('') is slow
      return x[0]==119 && x[1]==119 && x[2]==119 && x[3]==255
    }
    // [...x].join('') === '119119119255'
    refined.refine(filter)
    for (let i = 0; i < refined.data.length; i += 2) {
      let [x, y] = refined.data.subarray(i, i+2)
      let dot = new Dot({x, y}, [0x77, 0x77, 0x77, 0xff], this)
      this.dots.push(dot)
    }
  }
}

export function textParticle () {
  let cv = new TextParticle()

  window.onresize = e => {
    let target = e.target as (typeof window)
    cv.canvas.height = target.innerHeight
    cv.canvas.width = target.innerWidth
  }

  return cv
}