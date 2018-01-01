import { Canvas } from "./utils/Canvas"
import { ParticleLike, makeLinearGradient, applyGravity, rebound, move, randn_bm, earthFricion } from "./utils/others"

let tuneList = [-9, -5, -2, 3, 7, 10, 15]
class Donut {
  isSlow: boolean
  isDead: boolean
  constructor (
    public pos: ParticleLike['pos'],
    public dir: ParticleLike['dir'],
    public r: number,
    public thickness: number,
    public color: number[],
    private cv: Canvas,
    private actx: AudioContext
  ) {
    this.isSlow = false
    this.isDead = false
  }
  mutate () {
    let {pos, dir} = this
    applyGravity(this, this.cv)
    move(this, true)

    let {windowW, windowH} = this.cv
    let bottom: number
    if (this.isSlow) bottom = windowH
    else bottom = windowH*0.9
    rebound(
      this,
      {top: -Infinity, bottom, left: 0, right: windowW},
      {dcx: 0.8, dcy: 0.8},
      this.makeSound.bind(this)
    ) 
    earthFricion(this, this.r*0.05, bottom)

    this.fade()
  }
  draw ({ctx, canvas} = this.cv) {
    let {pos: {x, y}, r, thickness} = this
    ctx.strokeStyle = `rgba(${this.color})`
    ctx.lineWidth = thickness
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2*Math.PI)
    ctx.closePath()
    ctx.stroke()
    this.mutate()
  }
  markIfSlow () {
    let {vx, vy} = this.dir
    if (Math.abs(vx) < 0.5 && Math.abs(vy) < 0.5) this.isSlow = true
  }
  fade () {
    if (!this.isSlow) {
      this.markIfSlow()
      return
    }
    let [r, g, b, a] = this.color
    if (a < 1/255) { this.isDead = true }
    this.color = [r, g, b, a*0.9]
  }
  makeSound (strength: number) {
    let {actx, cv} = this
    if (!actx.destination) { return }
    let {windowH} = cv
    let tuneIdx = Math.round(3*(Math.sin(this.r*this.thickness)+1))
    let tune = tuneList[tuneIdx]
    let amp = actx.createGain()
    let osc = actx.createOscillator()

    let startTime = actx.currentTime
    let endTime = startTime + 2

    // this.color[3] is alpha channel,
    // when graphic of a donut is dissapeared,
    // its sound should be dissapeared too.
    // Also consider its height to hit strength
    let peekGain = 0.1 * this.color[3] * strength // * (windowH - this.pos.y) / windowH

    amp.gain.value = 0
    amp.gain.setTargetAtTime(peekGain, startTime, 0.005)
    amp.gain.setTargetAtTime(0, startTime+0.1, 0.05)
    osc.detune.value = tune * 100
    // osc.type = 'square' as any

    osc.connect(amp)
    amp.connect(actx.destination)

    osc.start(startTime)
    osc.stop(endTime)
  }
}

function isValid (arr: any[]) {
  for(let m of arr) {
    if (m) return true
  }
  return false
}
class ColorfulDonut extends Canvas {
  public data: Set<Donut[]> = new Set()
  private actx: AudioContext
  // public step: number = 0
  constructor (public bgColor: string | CanvasGradient = "#eacdae") {
    super(bgColor)

    // add sound effects
    let AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContext) {
      throw Error('web audio api not supported')
    }
    this.actx = new AudioContext()
  }
  renderMain ({canvas, ctx, windowH, windowW, data}: Canvas = this) {
    this.data.forEach(dataGroup => {
      if (!isValid(dataGroup)) {
        this.data.delete(dataGroup)
        return
      }
      dataGroup.forEach((donut, idx) => {
      // if (idx > this.step) return
      if (!donut) return
      if (donut.isDead) {
        delete dataGroup[idx]
        return
      }
      donut.draw()
      })
    })
  }
  
  addData (x?: number, y?: number) {
    let {windowH, windowW} = this
    let count = 1 // windowH * windowW / (1920*1080) * 30
    let ret = []
    for (let i = 0; i < count; i++) {
      let randColor = [255, 255, 255].map(c => Math.floor(c * Math.random()))
      let r: number = 0
      while (r < 5) r = Math.abs(randn_bm() * 7) + 3
      ret.push(new Donut(
        // careful, **DO NOT USE** `pos` as an object,
        // or all particle will act on the same pos object
        {x: x || windowW/2, y: y || windowH*0.618},
        {vx: randn_bm()*10, vy: -Math.abs(randn_bm()*25)},
        r, Math.abs(randn_bm()*3.1+3.1),
        [...randColor, 1.0], 
        this,
        this.actx
      ))
    }
    this.data.add(ret)
  }
  onClick (e: MouseEvent) {
    super.onClick(e)
    let {x, y} = e
    this.addData(x, y)
  }
  destory () {
    super.destory()
    this.actx.close()
  }
}

export function colorfulDonut () {
  let cv = new ColorfulDonut()
  let {windowH} = cv
  let colorInfoArr = [
    {offset: 0.0, color: '#eacdae'},
    {offset: 0.9, color: '#fefeef'},
    {offset: 0.909, color: '#777'},
    {offset: 0.91, color: '#eacdae'},
    {offset: 1.0, color: '#eacdae'}
  ]
  let gradientOption = {
    x0: 0, y0: 0,
    x1: 0, y1: windowH,
    colorInfoArr
  }
  cv.bgColor = makeLinearGradient(cv.ctx, gradientOption)
  cv.addData()

  window.onresize = e => {
    let target = e.target as (typeof window)
    cv.canvas.height = target.innerHeight
    cv.canvas.width = target.innerWidth
  }

  return cv
}