import {Canvas} from './utils/Canvas'
import {
  ParticleLike,
  randColor,
  RefinedImageData,
  makeLinearGradient,
  slide
} from './utils/others'



class Dot {
  public free: boolean = false
  constructor (
    public pos: ParticleLike['pos'],
    // public dir: ParticleLike['dir'],
    public destPos: ParticleLike['pos'],
    public color: number[],
    public cv: Canvas
  ) {  }
  draw ({ctx} = this.cv) {
    let {x, y} = this.pos
    ctx.fillStyle = `rgba(${this.color})`
    ctx.fillRect(x, y, 3, 3)
  }
  move () {
    if (!this.free) return
    let {pos, destPos} = this
    slide(pos, destPos, 0.05)
  }
}

class TextParticle extends Canvas {
  public dots: Dot[] = []
  constructor (public bgColor: string | CanvasGradient = "#feefed") {
    super(bgColor)
  }
  renderMain ({canvas, ctx, windowH, windowW, data}: Canvas = this) {
    this.dots && this.dots.forEach(dot => {
      dot.draw()
      dot.move()
    })
  }
  onClick (e: MouseEvent) {
    this.dots.forEach(dot => {
      setTimeout(() => dot.free = !dot.free, 60000*Math.random())
    })
  }
}

export function textParticle () {
  let cv = new TextParticle()
  let {ctx} = cv
  let offset = 0
  let colorInfoArr = [
    {offset: 1/6, color: '#f00'},
    {offset: 2/6, color: '#ff0'},
    {offset: 3/6, color: '#0f0'},
    {offset: 4/6, color: '#0ff'},
    {offset: 5/6, color: '#00f'},
    {offset: 6/6, color: '#f0f'}
  ]
  let gradientOption = {
    x0: 250 + offset, y0: 150,
    x1: 280 + offset, y1: 200,
    colorInfoArr
  }
  let textColor = makeLinearGradient(cv.ctx, gradientOption)
  // draw first frame and get its data, @pos(20000, 150)
  // ctx.fillStyle = '#eacdae'
  // ctx.fillRect(200+offset, 150, 200, 50)
  ctx.fillStyle = textColor
  // ctx.fillStyle = '#777'
  ctx.font = '60px helvetica,sans'
  ctx.fillText('彩虹', 200 + offset, 200)

  let hitChance = 0.3
  let filter = (color: number[]) => {
    let str = color.reduce((s, c) => {
      return s+c.toString(16)
    }, '#')
    return str !== cv.bgColor && Math.random() < hitChance
  }
  let refinedData = new RefinedImageData(ctx.getImageData(200 + offset, 150, 200, 60))
  // hide this pre-render text
  cv.clrscr()
  refinedData.refine(filter)
  for (let i = 0; i < refinedData.data.length; i += 2) {
    let d = refinedData.data
    let [x, y] = [d[i], d[i+1]]
    let color = refinedData.getColor({x, y})
    let dot = new Dot({
      x: Math.random()* 50 + cv.windowW / 2,
      y: -Math.random()* 20 + cv.windowH
    }, {x: x*2 + 150, y: y*2 + 150}, color, cv)
    cv.dots.push(dot)
  }

  window.onresize = e => {
    let target = e.target as (typeof window)
    cv.canvas.height = target.innerHeight
    cv.canvas.width = target.innerWidth
  }

  return cv
}