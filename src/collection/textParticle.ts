import {Canvas} from './utils/Canvas'
import {ParticleLike, randColor, RefinedImageData, makeLinearGradient} from './utils/others'



class Dot {
  constructor (
    public pos: ParticleLike['pos'],
    // public dir: ParticleLike['dir'],
    public destPos: ParticleLike['pos'],
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
    this.dots && this.dots.forEach(dot => {
      dot.draw()
    })
  }
  onClick (e: MouseEvent) {
    // let data = this.ctx.getImageData(120, 120, 200, 50)
    // let refined = new RefinedImageData(data)
    // let filter = (x: number[]) => {
    //   // [...x] is slow, [].join('') is slow
    //   return x[0]==119 && x[1]==119 && x[2]==119 && x[3]==255
    // }
    // // [...x].join('') === '119119119255'
    // refined.refine(filter)
    // for (let i = 0; i < refined.data.length; i += 2) {
    //   let [x, y] = refined.data.subarray(i, i+2)
    //   let dot = new Dot({x, y}, [0x77, 0x77, 0x77, 0xff], this)
    //   this.dots.push(dot)
    // }
  }
}

export function textParticle () {
  let cv = new TextParticle()
  let {ctx} = cv
  let offset = 200
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
  ctx.fillStyle = '#eacdae'
  ctx.fillRect(200+offset, 150, 200, 50)
  ctx.fillStyle = textColor
  // ctx.fillStyle = '#777'
  ctx.font = '32px Sans'
  ctx.fillText('Rainbow', 200 + offset, 190)

  let hitChance = 0.8
  let filter = (color: number[]) => {
    let str = color.reduce((s, c) => {
      return s+c.toString(16)
    }, '#')
    return str !== cv.bgColor && Math.random() > hitChance
  }
  let refinedData = new RefinedImageData(ctx.getImageData(200 + offset, 150, 200, 50))
  refinedData.refine(filter)
  for (let i = 0; i < refinedData.data.length; i += 2) {
    let d = refinedData.data
    let [x, y] = [d[i], d[i+1]]
    let color = refinedData.getColor({x, y})
    let dot = new Dot({
      x: Math.random()*cv.windowW,
      y: Math.random()*cv.windowH
    }, {x, y}, color, cv)
    cv.dots.push(dot)
  }

  window.onresize = e => {
    let target = e.target as (typeof window)
    cv.canvas.height = target.innerHeight
    cv.canvas.width = target.innerWidth
  }

  return cv
}