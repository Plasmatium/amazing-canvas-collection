interface PainterBox {
  [propertyName: string]: any
  ['mixin']: (cv: Canvas) => void
}

const defaultPainterBox = {
  mixin: (cv: Canvas) => {
    Object.assign(cv, {data: '2'})
    cv.data
  }
}

class Canvas {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  windowH: () => number
  windowW: () => number
  bgColor: string
  
  constructor (bgColor = '#eaeaea', painterBox: PainterBox) {
    let canvas = document.getElementsByTagName('canvas')[0] as HTMLCanvasElement
    if (!canvas) throw Error(`canvas not found.`)
    this.canvas = canvas
    let ctx = canvas.getContext('2d')
    if (!ctx) throw Error(`context not found.`)

    this.ctx = ctx
    this.bgColor = bgColor

    this.windowH = () => this.canvas.height
    this.windowW = () => this.canvas.width

    painterBox.mixin(this)
  }
  clrscr ({bgColor, ctx, windowH, windowW} = this) {
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, windowW(), windowH())
  }
  render ({ctx, windowH, windowW} = this) {
    this.clrscr()
  }
  renderMask ({ctx, windowH, windowW} = this) {
    
  }
  animate () {
    setInterval(() => {
      this.render()
    }, 20)
  }
}