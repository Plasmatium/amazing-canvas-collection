import {Canvas} from './utils/Canvas'
import {ParticleLike} from './utils/others'

class TextParticle extends Canvas {
  constructor (public bgColor: string | CanvasGradient = "#eacdae") {
    super(bgColor)
  }
  renderMain ({canvas, ctx, windowH, windowW, data}: Canvas = this) {
    ctx.fillStyle = '#777'
    ctx.fillText('test text', 150, 150)
  }
  onClick (e: MouseEvent) {
    let data = this.ctx.getImageData(120, 120, 500, 500)
    console.log(data)
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